import { React, useState, useEffect } from "react";
import {
    Button,
    TextField,
    Box,
    FormControl,
    IconButton,
    InputLabel,
    List,
    MenuItem,
    Select,
    Grid,
    Container,
    Typography,
    CssBaseline,
} from "@mui/material";
import "./styles/gpaPage.scss";
import "../gpaCalculator/styles/courseItem.scss";
import curve from "../gpaCalculator/styles/bellcurve.png";
import { Slider } from "@mui/material";
import Header from "../header/header";
import axios from "axios";
import api from "../../utils/api";
// import { number } from "prop-types";

/* This function takes in the grade distribution array and the average array 
    to return an array of all the quartiles for a class*/
function quartileCalc(array1, aveg) {
    let studentarr = [];
    const gpa = [
        4.0, 4.0, 3.7, 3.3, 3.0, 3.7, 2.3, 2.0, 1.7, 1.3, 1.0, 0.7, 0.0,
    ];
    for (let i = 0; i < array1.length; i++) {
        for (let j = 0; j < array1[i]; j++) {
            studentarr.push(gpa[i]);
        }
    }

    let std1 = studentarr.map((k) => {
        return (k - aveg) ** 2;
    });

    let sum = std1.reduce((acc, curr) => acc + curr, 0);

    let variance = sum / std1.length;

    let standardD = variance ** (1 / 2);

    let tenthQ = aveg -0.675*standardD
    let twentythQ = aveg -0.50625 *standardD
    let thritythQ = aveg -0.3375 *standardD
    let fortythQ = aveg -0.16875 *standardD
    let fiftythQ = aveg
    let sixtyth = aveg + 0.16875*standardD 
    let seventyQ = aveg + 0.3375*standardD 
    let eightyQ = aveg + 0.50625*standardD 
    let ninetyQ = aveg + 0.675*standardD 

    const quartileArr = [0, Math.max(tenthQ, 0), Math.max(twentythQ, 0), Math.max(thritythQ, 0), Math.max(fortythQ, 0), fiftythQ, Math.min(sixtyth, 4), Math.min(seventyQ, 4), Math.min(eightyQ, 4), Math.min(ninetyQ, 4), 4.0];
    return quartileArr;
}

/* This function takes in a list of all sections and every professor of a class and return 
  a map with the key as the professor for that class and the value as the average gpa distribution 
  for the course for that particular professor */

function gpaPerProf(data) {
    let profGpaMap = new Map();
    for (let i = 0; i < data.length; i++) {
        let sectionL = data[i].sections;
        for (let j = 0; j < sectionL.length; j++) {
            //console.log(sectionL[j].profName)
            let distribuition = sectionL[j].distribution;
            let aveg = sectionL[j].avgGPA;

            let newquartiles = quartileCalc(distribuition, aveg);

            if (profGpaMap.has(sectionL[j].profName) === false) {
                profGpaMap.set(sectionL[j].profName, newquartiles);
            } else {
                let currentquartile = profGpaMap.get(sectionL[j].profName);
                let combinedQuartile = [];
                for (let m = 0; m < currentquartile.length; m++) {
                    combinedQuartile[m] = currentquartile[m] + newquartiles[m];
                }
                combinedQuartile = combinedQuartile.map((k) => {
                    return k / 2;
                });
                profGpaMap.set(sectionL[j].profName, combinedQuartile);
            }
        }
    }
    return profGpaMap;
}

/* This function takes in the professor map and returns a list of dictionary with each dictionary 
  in the form 
  {
    value: {professor name},
    label: {professor name}
  } for the drop down menu */
function profprofmap(map_) {
    let result = [];
    result.push({
        value: "None Selected",
        label: "None Selected",
    });
    for (let key of map_.keys()) {
        let mp2 = {};
        mp2["value"] = key;
        mp2["label"] = key;
        result.push(mp2);
    }
    return result;
}

function genId(data) {
    return `${data.course_prof}${data.course_name}`;
}

// Inner component to be used for each row of the course added list - helps avoid repetition of code
function CourseItem(props) {
    const [curr_gpa, update_currGPA] = useState(props.data.course_gpa);
    const quartileToIdx = {
        0: 0,
        10: 1,
        20: 2,
        30: 3, 
        40: 4,
        50: 5,
        60: 6,
        70: 7, 
        80: 8, 
        90: 9, 
        100: 10
    };
    let gpa_distrib = props.data.course_distribution;
    useEffect(() => {
        props.changeHandler(props.id, props.data.course_gpa);
    }, []);

    const handleSliderChange = (event) => {
        let idx = event.target.value;
        let newGpaValue = gpa_distrib[quartileToIdx[idx]].toFixed(2);
        update_currGPA(newGpaValue);
        props.changeHandler(props.id, newGpaValue);
    };

    const deleteCourse = () => {
        props.removeCourse(props.id, props.data.course_name, props.data.course_prof)
    }

    return (
        <Box className="entry" sx={{
            borderRadius: 5,
            backgroundColor: '#282828'
        }}>
            <Box className="col left" id="course_name">
                <Typography variant="h5">{props.data.course_name}</Typography>
            </Box>
            <Box className="col middle" id="course_gpa">
                <Typography variant="h5">{props.data.course_gpa}</Typography>
            </Box>
            <Box className="col right" id="course_curve">
                <img className="curve" src={curve} />
                <Slider
                    size="small"
                    track={false}
                    valueLabelDisplay="auto"
                    defaultValue={50}
                    step={10}
                    marks
                    min={0}
                    max={100}
                    onChange={handleSliderChange}
                />
            </Box>
            <Box className="col last" id="course_curve">
                <Typography variant="h5">{curr_gpa}</Typography>
            </Box>
            <Box className="close" onClick = {deleteCourse}>
                <Typography variant="h10">x</Typography>
            </Box>
        </Box>
    );
}

export default function GpaPage(props) {
    //All possible states being used
    const [coursesAdded, changeCoursesAdded] = useState([]);
    const [avgGPA, changeAvgGPA] = useState(0.0);
    const [courseInput, setCourseInput] = useState("");
    const [numberInput, setNumberInput] = useState("");
    const [SearchDisabled, updateSearchDisabled] = useState(true);
    const [prof, setProf] = useState("None Selected");
    const [courseMap, updateCourseMap] = useState(new Map());
    const [professors, updateProfessors] = useState([]);
    const [gpaMap, changeGpaMap] = useState({});

    
    // Data fetching using our API through axios and loading into state variables to be used throughout the page
    useEffect(() => {
        const fetch_data = async function () {
            try {
                let ci = courseInput.replace(/\s/g, "").toUpperCase();
                const {
                    data: { data: results },
                } = await api.get(`/courses?subject=${ci}&number=${numberInput}`);
                updateCourseMap(gpaPerProf(results));
            } catch (e) {
                console.log(e);
            } 
        };
        if (courseInput.length >= 2 && numberInput.length === 3) {
            fetch_data();
        }
    }, [courseInput, numberInput]);

    useEffect(() => {
        updateProfessors(profprofmap(courseMap));
    }, [courseMap]);

    useEffect(() => {
        let sum = 0;
        let num = 0;

        for (let i in gpaMap) {
            sum += (gpaMap[i]) * 1;
            num += 1;
        }
        num = (num === 0) ? 1 : num;
        changeAvgGPA(sum / num);
    }, [gpaMap]);

    const handleProfChange = (event) => {
        setProf(event.target.value);
        // console.log(event.target.value)
    };

    const handleCourseChange = (event) => {
        setCourseInput(event.target.value);
    };

    const handleNumberChange = (event) => {
        setNumberInput(event.target.value);
    };

    const handleChildComponentChange = (id, new_value) => {
        changeGpaMap({ ...gpaMap, [id]: new_value });
    }

    const handleCourseRemoval = (id, course, professor) => {
        changeCoursesAdded(coursesAdded.filter(item => (item.course_prof !== professor || item.course_name !== course)))
        let updateMap = {...gpaMap};
        delete updateMap[id];
        changeGpaMap(updateMap);
    };

    function addCourse() {
        let currCourse =
            courseInput.replace(/\s/g, "").toUpperCase() + numberInput;
        let prof_GPAList = courseMap.get(prof);
        let prof_avgGPA = prof_GPAList[2].toFixed(2);
        changeCoursesAdded((coursesAdded) => [
            ...coursesAdded,
            {
                course_name: currCourse,
                course_gpa: prof_avgGPA,
                course_distribution: prof_GPAList,
                course_prof: prof
            },
        ]);
    }

    useEffect(() => {
        if (courseInput.length >= 2 && numberInput.length >= 3) {
            updateSearchDisabled(false);
        } else {
            updateSearchDisabled(true);
        }
    }, [courseInput, numberInput]);

    return (
        <div>
            <Header />
            <Container className="gpaPage" sx={{
                backgroundColor: 'primary.background',
                marginTop: 5,
                padding: 5,
                borderRadius: 10
            }}>
                <CssBaseline />
                <br></br>
                <Typography variant="h4" id="pred">Your Predicted GPA is:</Typography>
                <Typography variant="h4" id="GPAVal"> {avgGPA.toFixed(2)}</Typography>

                <br></br>
                <TextField
                    id="course-search"
                    label="Search Course"
                    placeholder="(e.g. CS)"
                    type="search"
                    variant="outlined"
                    helperText="Entry must be at minimum a length of 2"
                    onChange={handleCourseChange}
                />
                <br></br>
                <br></br>
                <TextField
                    id="number-search"
                    label="Search Number"
                    placeholder="(e.g. 409)"
                    type="search"
                    variant="outlined"
                    helperText="Entry must be a number of length 3"
                    onChange={handleNumberChange}
                />
                <br></br>
                <br></br>
                <TextField
                    disabled={SearchDisabled}
                    id="prof-search"
                    select
                    label="Professor"
                    helperText="Please select Professor"
                    value={prof}
                    onChange={handleProfChange}
                    SelectProps={{ native: true }}
                >
                    {professors.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </TextField>
                <br></br>
                <br></br>
                <Button
                    disabled={SearchDisabled}
                    variant="contained"
                    onClick={addCourse}
                >
                    {" "}
                    ADD COURSE{" "}
                </Button>

                <Box className="row" sx={{marginBottom: 5}}>
                    <Box sx={{
                        // paddingLeft: "4%",
                        width: "12vw",
                        textAlign: 'center',
                    }}>
                        <Typography variant="h5" sx={{textAlign: 'center'}}>Courses</Typography>
                    </Box>
                    <Box sx={{
                        width: "13vw",
                        textAlign: 'center'
                    }}>
                        <Typography variant="h5" sx={{textAlign: 'center'}}>Course GPA</Typography>
                    </Box>
                    <Box sx={{
                        width: "18vw",
                        textAlign: 'center'
                    }}>
                        <Typography noWrap variant="h5" sx={{textAlign: 'center'}}>Grade Distribution</Typography>
                    </Box>
                    <Box sx={{
                        width: "13vw",
                        textAlign: 'center'
                    }}>
                        <Typography variant="h5" sx={{textAlign: 'center'}}>Your GPA</Typography>
                    </Box>
                </Box>

                <Box sx={{marginBottom: 2}}>
                    {coursesAdded.map((e, idx) => (
                        <Box key={idx} sx={{marginBottom: 2}}>
                            <CourseItem data={e} id={genId(e)} changeHandler={handleChildComponentChange} removeCourse={handleCourseRemoval}/>
                        </Box>
                    ))}
                </Box>
            </Container>
        </div>
    );
}

// CourseItem.propTypes = {
//     data: PropTypes.shape({
//         course_name: PropTypes.string.isRequired,
//         course_gpa: PropTypes.string.isRequired,
//         course_distribution: arrayOf(PropTypes.number).isRequired
//     }).isRequired
// }
