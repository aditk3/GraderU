import React from 'react';
import { useNavigate } from 'react-router-dom';
import './homeScreenItem.css';

function HomeScreenSearchItem(props) {
    const navigate = useNavigate();

    return (
        <div
            className="homescreen-search-item-container"
            onClick={() => navigate(`/professors?profName=${props.name}`)}
        >
            <p>{props.name}</p>
        </div>
    );
}

export default HomeScreenSearchItem;
