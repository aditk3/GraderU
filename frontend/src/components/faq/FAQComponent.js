import React from 'react'
import { Container } from '@mui/material'
import FAQItem from './FAQItem'
import AddIcon from '@mui/icons-material/Add';
import { Box, FormControl, IconButton, InputLabel, List, MenuItem, Select } from '@mui/material';
import axios from 'axios';
import PropTypes from "prop-types";
import { useEffect, useId, useState } from 'react';
import Popup from 'reactjs-popup';
import './styles/styles.scss';
import Typography from '@mui/material/Typography';
import CreateFAQ from './createFAQ';


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
                <Typography variant="h5" color="text.primary"
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

                <Box className='createModalFAQ' id={modalId}>
                    <Box className='faqCreateReview' sx={{
                        backgroundColor: 'primary.background',
                        borderRadius: 5
                    }}>
                        <CreateFAQ modalDiv={modalDiv} />
                    </Box>
                </Box>

                <Box>
                    <List>
                        {courseFAQs}
                    </List>
                </Box>
            </Box>
        </>);
}


export default FAQComponent