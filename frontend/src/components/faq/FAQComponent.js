import { Box, List } from '@mui/material';
import Typography from '@mui/material/Typography';
import React, { useEffect, useId, useState } from 'react';
import CreateFAQ from './createFAQ';
import FAQItem from './FAQItem';
import './styles/styles.scss';

function FAQComponent(props) {
    const [courseFAQs, setCourseFAQs] = useState([]);

    const modalId = useId();
    const modalDiv = document.getElementById(modalId);

    useEffect(() => {
        let temp = [];
        props.FAQList.forEach((value, idx) => {
            temp.push(<FAQItem data={value} key={idx} />);
        });
        setCourseFAQs(temp);
    }, [props.FAQList]);

    return (
        <>
            <Box className="ratingsComponent">
                <Typography
                    variant="h5"
                    color="text.primary"
                    sx={{
                        textAlign: 'center',
                    }}
                >
                    FAQs
                </Typography>

                {/* <Box className="ratingsButtonsDiv">
                    <IconButton aria-label="addReview" className='ratingsAddButton' onClick={
                        () => {
                            modalDiv.style.display = 'block';
                        }
                    }>
                        < AddIcon />
                    </IconButton>
                </Box> */}

                <Box className="createModalFAQ" id={modalId}>
                    <Box
                        className="faqCreateReview"
                        sx={{
                            backgroundColor: 'primary.background',
                            borderRadius: 5,
                        }}
                    >
                        <CreateFAQ modalDiv={modalDiv} />
                    </Box>
                </Box>

                <Box>
                    <List>{courseFAQs}</List>
                </Box>
            </Box>
        </>
    );
}

export default FAQComponent;
