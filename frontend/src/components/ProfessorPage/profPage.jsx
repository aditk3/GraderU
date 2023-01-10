import { Box, Container, CssBaseline, Typography } from '@mui/material';
import { React, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import Header from '../header/header';
import ProfessorRatingsComponent from '../ratings/profRatingsComponent';
import './profPage.scss';

function avgGpaProf(data, prof_name) {
    let toreturn = 0;
    for (let i = 0; i < data.length; i++) {
        let sectionL = data[i].sections;
        for (let j = 0; j < sectionL.length; j++) {
            if (sectionL[j].profName === prof_name) {
                toreturn = sectionL[j].avgGPA;
            }
        }
    }
    return toreturn;
}

function transformProfessorData(data) {
    let output = {};
    output['profId'] = data['_id'];
    output['profName'] = data['name'];

    let courseData = [];
    for (let i = 0; i < data.courses.length; i++) {
        let course = data.courses[i];
        courseData.push({
            term: course['term'],
            year: course['year'],
            courseId: course['_id'],
            name: course['name'],
            subject: course['subject'],
            number: course['number'],
        });
    }
    output['courseData'] = courseData;

    return output;
}

export default function ProfPage(props) {
    //All possible states being used
    const [profData, updateProfData] = useState({});
    const [reviewData, changeReviewData] = useState([]);
    const [isDataInit, changeDataInit] = useState(false);
    const [avgRating, changeAvgRating] = useState(0);
    const [searchParams, _setSearchParams] = useSearchParams();

    const profNameParam = searchParams.get('profName');

    // Data fetching using our API through axios and loading into state variables to be used throughout the page
    useEffect(() => {
        const fetch_prof_data = async function () {
            try {
                // Get Prof data
                const {
                    data: { data: results },
                } = await api.get(`/professors?name=${profNameParam}`);
                updateProfData(transformProfessorData(results[0]));

                const {
                    data: { data: reviewArr },
                } = await api.get(`/reviews?professor=${results[0]['_id']}`);

                changeReviewData(reviewArr);
                changeDataInit(true);
            } catch (e) {
                console.log(e);
            }
        };
        fetch_prof_data();
    }, []);

    useEffect(() => {
        let sum = 0;
        let num = 0;
        reviewData.forEach((val) => {
            sum += val.rating;
            num += 1;
        });

        if (num !== 0) changeAvgRating(Math.floor(sum / num));
        else changeAvgRating('not rated');
    }, [reviewData]);
    // List components and functions to be used here
    function CourseItem(props) {
        const [avgGPA, updateGPA] = useState(0.0);

        useEffect(() => {
            const fetch_course_data = async function () {
                try {
                    //API calls
                    const {
                        data: { data: results },
                    } = await api.get(
                        `/courses?subject=${props.data.subject}&year=${props.data.year}&term=${props.data.term}&number=${props.data.number}`
                    );

                    updateGPA(avgGpaProf(results, profNameParam));
                } catch (e) {
                    console.log(e);
                }
            };
            fetch_course_data();
        }, []);

        const navigate = useNavigate();
        return (
            <Box
                className="row"
                onClick={() =>
                    navigate(
                        `/courses?subject=${props.data.subject}&number=${props.data.number}`
                    )
                }
                sx={{
                    width: '100%',
                    backgroundColor: '#282828',
                    marginBottom: 2,
                    borderRadius: 5,
                    padding: 2,
                    boxShadow: '0px 5px 10px 0px rgba(0, 0, 0, 0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    <Typography variant="h5">
                        {props.data.subject}
                        {props.data.number} : {props.data.name}
                    </Typography>
                    <Typography variant="h5">
                        {props.data.term} {props.data.year}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'left',
                        width: '100%',
                    }}
                >
                    <Typography variant="h5">Average GPA: {avgGPA}</Typography>
                </Box>
            </Box>
        );
    }

    return !isDataInit ? (
        <></>
    ) : (
        <div>
            <Header />
            <Container
                className="profPage"
                sx={{
                    marginTop: 5,
                }}
            >
                <CssBaseline />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        marginBottom: 5,
                        padding: 5,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'primary.background',
                            width: '100%',
                            borderRadius: 2,
                            marginBottom: 5,
                            padding: 5,
                        }}
                    >
                        <Typography variant="h3">{`Professor Name: ${profNameParam}`}</Typography>
                        <Typography variant="h5">{`Average Rating: ${avgRating}`}</Typography>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            flexWrap: 'wrap',
                            width: '100%',
                            backgroundColor: 'primary.background',
                            borderRadius: 2,
                            padding: 2,
                            marginBottom: 5,
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                marginBottom: 3,
                                textAlign: 'center',
                                width: '100%',
                            }}
                        >
                            {`Courses Taught`}
                        </Typography>
                        {profData.courseData.map((val, idx) => (
                            <CourseItem
                                data={val}
                                key={idx}
                                profName={profNameParam}
                            />
                        ))}
                    </Box>
                    <Box
                        sx={{
                            backgroundColor: 'primary.background',
                            borderRadius: 2,
                            padding: 2,
                            marginBottom: 5,
                            width: '100%',
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                marginBottom: 3,
                                textAlign: 'center',
                                width: '100%',
                            }}
                        >{`Ratings`}</Typography>
                        <ProfessorRatingsComponent
                            profData={profData}
                            reviewList={reviewData}
                        ></ProfessorRatingsComponent>
                    </Box>
                </Box>
            </Container>
        </div>
    );
}
