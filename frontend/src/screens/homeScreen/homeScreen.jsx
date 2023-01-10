import { Alert } from '@mui/material';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';
import Header from '../../components/header/header';
import HomeScreenCourseItem from '../../components/homeScreen/homeScreenCourseItem';
import HomeScreenProfItem from '../../components/homeScreen/homeScreenProfItem';
import './homeScreen.css';

function HomeScreen() {
    const [data, setData] = useState({ data: [] });
    const [filter, setFilter] = React.useState('Professor');
    const [err, setErr] = useState('');

    const handleProfAPICall = async (name) => {
        try {
            const response = await fetch(
                'https://graderu.herokuapp.com/api/v1/professors?name=' + name,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Error! status: ${response.status}`);
            }

            const result = await response.json();

            setData(result);
        } catch (err) {
            setErr('No results found');
        }
    };

    const handleCourseAPICall = async (input) => {
        try {
            const words = input.split(' ');
            const response = await fetch(
                'https://graderu.herokuapp.com/api/v1/courses?subject=' +
                    words[0] +
                    '&number=' +
                    words[1],
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.data.length === 0) {
                setErr('No results found');
            } else {
                setErr('');
            }

            setData(result);
        } catch (err) {
            setErr('No results found');
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && event.target.value !== '') {
            if (filter === 'Professor') {
                setData({ data: [] });
                handleProfAPICall(event.target.value);
            } else if (filter === 'Course') {
                setData({ data: [] });
                handleCourseAPICall(event.target.value);
            }
        }
    };

    const handleChangeFilter = (event) => {
        setFilter(event.target.value);
        setData({ data: [] });
    };

    return (
        <div>
            <Header />
            <Container
                className="homescreen-container"
                sx={{
                    backgroundColor: 'primary.background',
                    display: 'flex',
                    flexDirection: 'column',
                    paddingBottom: '100%',
                }}
            >
                <div className="homescreen-search">
                    <TextField
                        id="search-bar"
                        className="homescreen-searchbox"
                        variant="outlined"
                        placeholder={
                            filter === 'Professor'
                                ? 'Caesar, Matthew...'
                                : 'CS 374...'
                        }
                        onKeyDown={handleKeyDown}
                    />

                    <div className="homescreen-search-params">
                        <FormControl>
                            <InputLabel id="home-search-filter-label">
                                Search Filter
                            </InputLabel>
                            <Select
                                labelId="home-search-filter-label"
                                id="demo-simple-select"
                                value={filter}
                                label="Search Filter"
                                className="homescreen-filters"
                                onChange={handleChangeFilter}
                            >
                                <MenuItem value={'Professor'}>
                                    Professor
                                </MenuItem>
                                <MenuItem value={'Course'}>Course</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </div>

                {filter === 'Professor' ? (
                    <div
                        className="homescreen-results"
                        style={
                            data.data.length > 0
                                ? {
                                      border: '3px solid black',
                                      boxShadow: '5px 5px',
                                      overflowY: 'scroll',
                                  }
                                : {}
                        }
                    >
                        <ul className="homescreen-results-list">
                            {data.data.map((item) => (
                                <li key={item._id}>
                                    <HomeScreenProfItem name={item.name} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div
                        className="homescreen-results"
                        style={
                            data.data.length > 0
                                ? {
                                      border: '3px solid black',
                                      boxShadow: '5px 5px',
                                      overflowY: 'scroll',
                                  }
                                : {}
                        }
                    >
                        <div className="homescreen-results-list">
                            {data.data.length > 0 ? (
                                <HomeScreenCourseItem data={data.data[0]} />
                            ) : err !== '' ? (
                                <Alert severity="error">No results found</Alert>
                            ) : null}
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
}

export default HomeScreen;
