import CloseIcon from '@mui/icons-material/Close';
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    IconButton,
    Input,
    InputLabel,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import './styles/styles.scss';

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

async function handleSubmitFAQ(faqDispatcher, question, answer) {
    // Generate output packet
    let packet = {};
    packet['question'] = question;
    packet['answer'] = answer;

    // Send it to the dispatcher
    await faqDispatcher('create', packet);
}

function CreateFAQ(props) {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [error, changeError] = useState(true);
    const [tooltipMessage, changeTooltipMessage] = useState(
        'Min character limit is 1'
    );

    let tooltip =
        error === true ? (
            <FormHelperText>{tooltipMessage}</FormHelperText>
        ) : (
            <></>
        );

    return (
        <>
            <Box
                className="createReviewHeadingDiv"
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                }}
            >
                <Typography variant="h4">Write an FAQ!</Typography>
                <IconButton
                    aria-label="addReview"
                    className="ratingsAddButton"
                    onClick={() => {
                        props.modalDiv.style.display = 'none';
                    }}
                    sx={{
                        justifyContent: 'flex-end',
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>

            <Box className="createReviewTextBoxDiv">
                <FormControl
                    variant="standard"
                    error={error}
                    className="reviewTextBox"
                >
                    <InputLabel>Enter Question</InputLabel>
                    <Input
                        value={question}
                        onChange={(e) => {
                            handleTextChange(
                                e,
                                changeError,
                                setQuestion,
                                changeTooltipMessage
                            );
                        }}
                        multiline
                        fullWidth
                    />
                    {tooltip}
                </FormControl>
            </Box>
            <Box className="createReviewTextBoxDiv">
                <FormControl
                    variant="standard"
                    error={error}
                    className="reviewTextBox"
                >
                    <InputLabel>Enter Answer</InputLabel>
                    <Input
                        value={answer}
                        onChange={(e) => {
                            handleTextChange(
                                e,
                                changeError,
                                setAnswer,
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
                        await handleSubmitFAQ(
                            props.faqDispatcher,
                            question,
                            answer
                        );
                    }}
                >
                    Submit
                </Button>
            </Box>
        </>
    );
}

export default CreateFAQ;
