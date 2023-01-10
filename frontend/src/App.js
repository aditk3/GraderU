import { createTheme, ThemeProvider } from '@mui/material';
import { React } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import ForgotPassword from './components/auth/ForgotPassword';
import Login from './components/auth/Login';
import ResetPassword from './components/auth/ResetPassword';
import Signup from './components/auth/Signup';
import Verify from './components/auth/Verify';
import CoursePage from './components/CoursePage/CoursePage';
import GpaPage from './components/gpaCalculator/gpaPage';
import ProfessorPage from './components/ProfessorPage/profPage';
import HomeScreen from './screens/homeScreen/homeScreen';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            background: '#404258',
            light: '#9575cd',
            main: '#5e35b1',
            dark: '#311b92',
            contrastText: '#fff',
        },
        secondary: {
            light: '#ff7961',
            main: '#f44336',
            dark: '#ba000d',
            contrastText: '#000',
        },
    },
    typography: {
        fontFamily: 'Courier Prime',
        button: {
            textTransform: 'none',
        },
    },
});

export default function App(props) {
    return (
        <ThemeProvider theme={theme}>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<HomeScreen />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Signup />} />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/verify" element={<Verify />} />
                    <Route path="/courses" element={<CoursePage />} />
                    <Route path="/professors" element={<ProfessorPage />} />
                    <Route path="/GPA-calculator" element={<GpaPage />} />
                </Routes>
            </HashRouter>
        </ThemeProvider>
    );
}

// export default App = App;
