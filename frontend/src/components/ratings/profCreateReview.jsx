import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    Input,
    InputLabel,
    MenuItem,
    Rating,
    Select,
    Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

function handleTextChange(
    e,
    changeError,
    changeTextValue,
    changeTooltipMessage
) {
    changeTextValue(e.target.value);
    if (e.target.value.length === 0 || e.target.value.length > 240) {
        changeError(true);
        if (e.target.value.length > 240) {
            changeTooltipMessage(
                `Max character limit is 240. Current Length: ${e.target.value.length}`
            );
        } else {
            changeTooltipMessage('Min character limit is 1');
        }
    } else {
        changeError(false);
    }
}

async function handleSubmitReview(
    reviewDispatcher,
    filterField,
    filterId,
    constantField,
    constantId,
    ratings,
    text
) {
    // Generate output packet
    let packet = {};
    packet[filterField] = filterId;
    packet[constantField] = constantId;
    packet['rating'] = ratings;
    packet['text'] = text;

    // Send it to the dispatcher
    await reviewDispatcher('create', packet);
}

export default function ProfCreateReviewComponent(props) {
    // States for things
    const [rating, changeRatingValue] = useState(5);
    const [textValue, changeTextValue] = useState('');
    const [error, changeError] = useState(true);
    const [tooltipMessage, changeTooltipMessage] = useState(
        'Min character limit is 1'
    );

    // States for each of the dropdown
    const [filterValue, changeFilterValue] = useState('');
    const [termYearValue, changeTermYearValue] = useState('');

    // Dropdown lists for each of the filters
    const [filterDropdownList, changeFilterDropdownList] = useState([]);
    const [termYearDropdownList, changeTermYearDropdownList] = useState([]);

    // Update main filter dropdown list
    useEffect(() => {
        let tempList = [];
        props.filterList.forEach((val, idx) => {
            tempList.push(
                <MenuItem value={`${val.subject} ${val.number}`} key={idx}>
                    {`${val.subject} ${val.number}`}
                </MenuItem>
            );
        });
        changeFilterDropdownList(tempList);
    }, [props.filterList]);

    // Update year and term dropdown
    useEffect(() => {
        let termYearList = [];
        for (let i = 0; i < props.filterList.length; i++) {
            let val = props.filterList[i];
            if (`${val.subject} ${val.number}` === filterValue) {
                val.courseData.forEach((data, idx) => {
                    termYearList.push(
                        <MenuItem value={data['courseId']} key={idx}>
                            {`${data.term} ${data.year}`}
                        </MenuItem>
                    );
                });
                break;
            }
        }

        // Update Dropdowns
        changeTermYearDropdownList(termYearList);
    }, [filterValue]);

    let tooltip =
        error === true ? (
            <FormHelperText>{tooltipMessage}</FormHelperText>
        ) : (
            <></>
        );
    return (
        <>
            <Box className="createReviewHeadingDiv">
                <Typography variant="h4">Write a Review!</Typography>
            </Box>
            <Box className="createReviewToolsDiv">
                <Box className="ratingsDiv">
                    <Typography>Choose Rating</Typography>
                    <Rating
                        className="ratingsTool"
                        value={rating}
                        onChange={(_, newValue) => {
                            if (newValue !== null) {
                                changeRatingValue(newValue);
                            }
                        }}
                    />
                </Box>

                <FormControl className="createFilterFormControl">
                    <InputLabel>{`Choose ${props.filterField}`}</InputLabel>
                    <Select
                        label={`Choose ${props.filterField}`}
                        value={filterValue}
                        onChange={(e) => {
                            changeFilterValue(e.target.value);
                            changeTermYearValue('');
                        }}
                        autoWidth
                    >
                        {filterDropdownList}
                    </Select>
                </FormControl>
                <FormControl className="createYearTermFormControl">
                    <InputLabel>{`Choose Term-Year`}</InputLabel>
                    <Select
                        label={`Choose Term-Year`}
                        value={termYearValue}
                        onChange={(e) => {
                            changeTermYearValue(e.target.value);
                        }}
                        autoWidth
                    >
                        {termYearDropdownList}
                    </Select>
                </FormControl>
            </Box>
            <Box className="createReviewTextBoxDiv">
                <FormControl
                    variant="standard"
                    error={error}
                    className="reviewTextBox"
                >
                    <InputLabel>Enter Review</InputLabel>
                    <Input
                        value={textValue}
                        onChange={(e) => {
                            handleTextChange(
                                e,
                                changeError,
                                changeTextValue,
                                changeTooltipMessage
                            );
                        }}
                        multiline
                        fullWidth
                    />
                    {tooltip}
                </FormControl>
            </Box>
            <Box className="createReviewSubmitButtonDiv">
                <Button
                    variant="contained"
                    className="reviewCloseButton"
                    disabled={error}
                    onClick={async () => {
                        await handleSubmitReview(
                            props.reviewDispatcher,
                            props.filterField,
                            filterValue,
                            props.constantField,
                            termYearValue,
                            rating,
                            textValue,
                            props.closePopup
                        );
                    }}
                >
                    Submit
                </Button>
            </Box>
        </>
    );
}

ProfCreateReviewComponent.propTypes = {
    filterField: PropTypes.string.isRequired,
    constantField: PropTypes.string.isRequired,
    filterList: PropTypes.arrayOf(
        PropTypes.shape({
            subject: PropTypes.string.isRequired,
            number: PropTypes.number.isRequired,
            courseData: PropTypes.arrayOf(
                PropTypes.shape({
                    courseId: PropTypes.string.isRequired,
                    year: PropTypes.number.isRequired,
                    term: PropTypes.string.isRequired,
                })
            ).isRequired,
        })
    ).isRequired,
    reviewDispatcher: PropTypes.func.isRequired,
};
