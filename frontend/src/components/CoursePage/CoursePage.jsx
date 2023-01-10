import { React, useState, useEffect } from "react";
import { Button, TextField, Box, FormControl, IconButton, InputLabel, List, MenuItem, Select, Grid, Container, CssBaseline } from '@mui/material';
import axios from 'axios'
import { Typography } from '@mui/material';
import GraphComponent from "../Graph/graph.jsx";
import "./styles/styles.scss";
import CourseRatingsComponent from "../ratings/courseRatingsComponent.jsx";
import { useSearchParams } from "react-router-dom";
import Header from "../header/header.jsx";
import api from "../../utils/api.js";
import FAQItem from "../faq/FAQItem.js";
import FAQComponent from "../faq/FAQComponent.js";

function transformCourseData(data) {
    let mainData = new Map();
    let reviewData = [];
    let faqData = [];

    for (let courseIdx = 0; courseIdx < data.length; courseIdx++) {
        let course = data[courseIdx];
        reviewData = reviewData.concat(course["reviews"]);
        faqData = faqData.concat(course["faqs"]);

        for (let sectionIdx = 0; sectionIdx < course["sections"].length; sectionIdx++) {
            let section = course["sections"][sectionIdx];
            if (mainData.has(section["professor"]) === true) {
                mainData.get(section["professor"])["courseData"].push({
                    courseId: course["_id"],
                    term: course["term"],
                    year: course["year"],
                    name: course["name"],
                    number: course["number"],
                    subject: course["subject"],
                    distribution: section["distribution"],
                    profName: section["profName"]
                });
            } else {
                mainData.set(section["professor"], {
                    profId: section["professor"],
                    profName: section["profName"],
                    courseData: [
                        {
                            courseId: course["_id"],
                            term: course["term"],
                            year: course["year"],
                            number: course["number"],
                            name: course["name"],
                            subject: course["subject"],
                            distribution: section["distribution"],
                            profName: section["profName"]
                        }
                    ]
                });
            }
        }
    }
    return [Array.from(mainData.values()), reviewData, faqData];
}

export default function CoursePage(props) {
    const [data, setdata] = useState();
    const [profFilterValue, changeProfFilterValue] = useState('');
    const [profFilterDropdown, changeProfFilterDropdown] = useState([]);
    const [yearTermFilterValue, changeYearTermFilterValue] = useState('');
    const [yearTermFilterDropdown, changeYearTermFilterDropdown] = useState([]);
    const [isDataInit, changeInitState] = useState(false);
    const [reviewData, changeReviewData] = useState([]);
    const [faqData, changeFaqData] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();

    const numberParam = searchParams.get('number');
    const subjectParam = searchParams.get('subject');

    useEffect(() => {
        const fetch_data = async function () {
            try {
                const { data: {
                    data: results
                } } = await api.get(`/courses?subject=${subjectParam}&number=${numberParam}`);
    
                let [mainData, newReviewData, newfaqData] = transformCourseData(results);
    
                setdata(mainData);
                changeFaqData(newfaqData);
                changeReviewData(newReviewData);
    
                changeInitState(true);
            } catch (e) {
                console.log(e);
            }
        };
        fetch_data();
        console.log(faqData)
    }, [subjectParam, numberParam]);

    useEffect(() => {
        if (!isDataInit) return;
        let defaultVal = '';
        changeProfFilterDropdown(data.map((val, idx) => {
            if (idx === 0) defaultVal = val.profId;
            return <MenuItem value={val.profId} key={idx}>
                {val.profName}
            </MenuItem>;
        }));
        changeProfFilterValue(defaultVal);
    }, [data]);

    useEffect(() => {
        if (!isDataInit) return;
        for (let i = 0; i < data.length; i++) {
            if (data[i].profId === profFilterValue) {
                let defaultVal = '';
                changeYearTermFilterDropdown(data[i].courseData.map((val, idx) => {
                    if (idx === 0) defaultVal = val;
                    return <MenuItem value={val} key={idx}>
                        {`${val.term} ${val.year}`}
                    </MenuItem>;
                }));
                changeYearTermFilterValue(defaultVal);
            }
        }
    }, [profFilterValue]);

    return !isDataInit ? (<></>) : (
        <div>
            <Header />
            <Container className="CoursePage" sx={{
                marginTop: 5
            }}>
                <CssBaseline />
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: "100%",
                    backgroundColor: 'primary.background',
                    borderRadius: 2,
                    marginBottom: 5
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-around',
                        width: "100%",
                        backgroundColor: 'primary.background',
                        borderRadius: 2,
                        padding: 2
                    }} className='coursePageDropdowns'>
                        <FormControl className="courseProfessorDropdown" sx={{ alignSelf: 'center' }}>
                            <InputLabel>{`Filter by Professor`}</InputLabel>
                            <Select
                                label={`Filter by Professor`}
                                value={profFilterValue}
                                onChange={(e) => {
                                    changeProfFilterValue(e.target.value);
                                }}
                                autoWidth
                            >
                                {profFilterDropdown}
                            </Select>
                        </FormControl>
                        <FormControl className="courseYearTermDropdown" sx={{ alignSelf: 'center' }}>
                            <InputLabel>{`Filter by Year & Term`}</InputLabel>
                            <Select
                                label={`Filter by Year & Term`}
                                value={yearTermFilterValue}
                                onChange={(e) => {
                                    changeYearTermFilterValue(e.target.value);
                                }}
                                autoWidth
                            >
                                {yearTermFilterDropdown}
                            </Select>
                        </FormControl>
                    </Box>
                    <GraphComponent data={yearTermFilterValue} />
                </Box>
                <Box sx={{
                    backgroundColor: 'primary.background',
                    borderRadius: 2,
                    marginBottom: 5,
                    padding: 2
                }}>
                    <FAQComponent FAQList={faqData} />
                </Box>
                <Box sx={{
                    backgroundColor: 'primary.background',
                    borderRadius: 2,
                    padding: 2,
                    marginBottom: 5,
                }}>
                    <Typography variant="h4" sx={{ marginBottom: 3, textAlign: 'center', width: "100%" }}>{`Ratings`}</Typography>
                    <CourseRatingsComponent profData={data} reviewList={reviewData} />
                </Box>
            </Container>
        </div>
    );
};
