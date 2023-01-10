import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import React from 'react';

function FAQItem(props) {
    return (
        <>
            <ListItem alignItems="flex-start">
                <div>
                    <ListItemAvatar>
                        <QuestionAnswerIcon />
                    </ListItemAvatar>
                </div>

                <ListItemText
                    primary={`Question: ${props.data.question}`}
                    secondary={`Answer: ${props.data.answer}`}
                />
            </ListItem>
        </>
    );
}

export default FAQItem;
