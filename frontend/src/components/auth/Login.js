import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import api from '../../utils/api';
import { redirectTimeout } from '../../utils/constants';

const Login = () => {
    const [errState, setErrState] = useState('');
    const [successState, setSuccessState] = useState('');
    const navigate = useNavigate();

    const onLogin = async (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        try {
            await api.post('/users/login', {
                email: data.get('email'),
                password: data.get('password'),
            });
            setErrState('');
            setSuccessState('Logged in succesfully! Redirecting you home.');
            setTimeout(() => {
                navigate('/');
            }, redirectTimeout);
        } catch (err) {
            setErrState(err.response.data.message);
            setSuccessState('');
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    padding: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: 'primary.background',
                    color: 'primary.contrastText',
                    borderRadius: 2,
                }}
            >
                <Typography component="h1" variant="h4">
                    Login
                </Typography>
                <div>Sign in to your account</div>
                <Box
                    component="form"
                    onSubmit={onLogin}
                    noValidate
                    sx={{ mt: 1 }}
                >
                    <TextField
                        error={errState}
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        sx={{
                            '& label.Mui-focused': {
                                color: 'primary.contrastText',
                            },
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: 'primary.contrastText',
                                },
                            },
                        }}
                    />
                    <TextField
                        error={errState}
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        sx={{
                            '& label.Mui-focused': {
                                color: 'primary.contrastText',
                            },
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: 'primary.contrastText',
                                },
                            },
                        }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Login
                    </Button>
                    {errState ? (
                        <Alert severity="error">{errState}</Alert>
                    ) : null}
                    {successState ? (
                        <Alert severity="success">{successState}</Alert>
                    ) : null}
                    <div align="center">
                        <Link
                            href="#/forgot-password"
                            variant="contained"
                            sx={{ color: 'primary.contrastText' }}
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div align="center">
                        <Link
                            href="#/register"
                            variant="contained"
                            sx={{ color: 'primary.contrastText' }}
                        >
                            Create an Account
                        </Link>
                    </div>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;
