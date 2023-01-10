import { Box, ListItem, ListItemAvatar, ListItemText, Rating, ToggleButton, ToggleButtonGroup } from "@mui/material";
import PropTypes from "prop-types";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import FaceIcon from '@mui/icons-material/Face';
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { padding } from "@mui/system";

function stringSearch(array, str) {
    if (str === null || str === undefined) return -1;

    let len = array.length - 1;
    let m = 0;
    while (m <= len) {
        let k = (len + m) >> 1;
        let cmp_val = str.localeCompare(array[k]);
        if (cmp_val < 0) {
            m = k - 1;
        } else if (cmp_val > 0) {
            m = k + 1;
        } else {
            return k;
        }
    }
    return -m - 1;
}
export default function ReviewItem(props) {
    const [likeDislikeButton, changeLikeDislikeValue] = useState(null);
    const [likeDislikeRatio, changeLikeDislikeRatio] = useState(0.0);
    const [mUserId, changeUserId] = useState(undefined);

    useEffect(() => {
        const totalLength = (props.data["likes"].length + props.data["dislikes"].length) === 0 ? 1 : props.data["likes"].length + props.data["dislikes"].length;
        changeLikeDislikeRatio(Math.floor((props.data["likes"].length / totalLength) * 100));
    }, [props.data]);

    let profName = '';
    let courseTerm = '';
    let courseYear = '';
    
    for (let i = 0; i < props.profData.length; i++) {
        let val = props.profData[i];
        if (val["profId"] === props.data.professor) {
            for (let j = 0; j < val.courseData.length; j++) {
                let course = val.courseData[j];
                if (course["courseId"] === props.data.course) {
                    profName = val["profName"];
                    courseTerm = course["term"];
                    courseYear = course["year"];
                    break;
                }
            }
            break;
        } 
    }

    const getUserId = async function () {
        try {
            const res = await api.get(`/users/me`);
            console.log(res.data.data._id);
            return `${res.data.data._id}`;
        } catch (e) {
            console.log(e);
            return undefined;
        }
    };

    useEffect(() => {
        const searchIds = async function() {
            let userId = undefined;
            if (mUserId === undefined) {
                userId = await getUserId();
                changeUserId(userId);
            } else {
                userId = mUserId;
            }

            if (userId === undefined) return;
            for (let i = 0; i < props.data.likes.length; i++) {
                if (props.data.likes[i] === userId) {
                    changeLikeDislikeValue(1);
                    return;
                }
            }

            for (let i = 0; i < props.data.dislikes.length; i++) {
                if (props.data.dislikes[i] === userId) {
                    changeLikeDislikeValue(-1);
                    return;
                }
            }
            changeLikeDislikeValue(null);
        };
        
        searchIds();
    }, [props.data, mUserId]);

    return (
        <>
        <ListItem alignItems="flex-start">
            <Box sx={{
                alignItems:"flex-start",
                display: 'flex',
                justifyContent: 'space-evenly',
                alignContent: 'center',
                width: "100%",
                backgroundColor: '#282828',
                padding: 1,
                borderRadius: 5,
                boxShadow: "0px 5px 10px 0px rgba(0, 0, 0, 0.5)",
            }}>
                <Box sx={{
                    width: "20%",
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'center'
                }}>
                    <ListItemAvatar sx={{
                        textAlign: 'center'
                    }}>
                        <FaceIcon/>
                    </ListItemAvatar>
                    <Rating value={props.data.rating} readOnly/>
                </Box>
                <Box sx={{
                    width: "60%",
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'left',
                    justifyContent: 'center',
                    alignSelf: 'center'
                }}>
                    <ListItemText 
                        primary={`Review for ${profName} (${courseTerm} ${courseYear}): `}
                        secondary={props.data.text}
                    />
                </Box>
                <Box sx={{
                    width: "20%",
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'center'
                }}>
                    <ListItemText primary={`${likeDislikeRatio}% liked this`} />
                    <ToggleButtonGroup exclusive value={likeDislikeButton} onChange={(_, newValue) => {
                        // Normalize value
                        let tempValue = (newValue === null) ? 0 : newValue;
                        // Send it to the dispatcher. State will be updated using useEffect hook.
                        props.reviewDataDispatcher('update', {like: tempValue}, props.data["_id"]);
                        if (newValue === null) changeLikeDislikeValue(null);
                    }}>
                        <ToggleButton value={1}><ThumbUpIcon/></ToggleButton>
                        <ToggleButton value={-1}><ThumbDownIcon/></ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>
        </ListItem>
        </>
    );
}

// Define prop types for RatingsComponent
ReviewItem.propTypes = {
    data: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        author: PropTypes.string.isRequired,
        rating: PropTypes.number.isRequired,
        text: PropTypes.string.isRequired,
        likes: PropTypes.arrayOf(PropTypes.string.isRequired),
        dislikes: PropTypes.arrayOf(PropTypes.string.isRequired),
        professor: PropTypes.string.isRequired,
        course: PropTypes.string.isRequired,
    }).isRequired,
    profData: PropTypes.arrayOf(PropTypes.shape({
        profName: PropTypes.string,
        profId: PropTypes.string,
        courseData: PropTypes.arrayOf(PropTypes.shape({
            courseId: PropTypes.string,
            term: PropTypes.string,
            year: PropTypes.number
        }))
    })),
    reviewDataDispatcher: PropTypes.func.isRequired
}