import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import api from '../../utils/api';
import { redirectTimeout } from '../../utils/constants';

const ResetPassword = () => {
    const [errState, setErrState] = useState('');
    const [successState, setSuccessState] = useState('');
    const navigate = useNavigate();

    const onResetPassword = async (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        try {
            await api.patch('/users/resetPassword', {
                email: data.get('email'),
                OTP: data.get('resetCode'),
                password: data.get('password'),
                passwordConfirm: data.get('passwordConfirm'),
            });
            setErrState('');
            setSuccessState(
                'Password successfully reset! Redirecting you home.'
            );
            setTimeout(() => {
                navigate('/');
            }, redirectTimeout);
        } catch (err) {
            setErrState(err.response.data.message);
            setSuccessState('');
        }
    };

    return (
        <Container component="main" maxWidth="sm">
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
                <Typography component="h1" variant="h4" noWrap={true}>
                    Reset Password
                </Typography>
                <div>Reset your password</div>
                <Box
                    component="form"
                    onSubmit={onResetPassword}
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
                        id="resetCode"
                        label="Reset Code"
                        name="resetCode"
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
                    <TextField
                        error={errState}
                        margin="normal"
                        required
                        fullWidth
                        name="passwordConfirm"
                        label="Password Confirm"
                        type="password"
                        id="passwordConfirm"
                        autoComplete="current-passwordConfirm"
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
                    {successState ? (
                        <Alert severity="success">{successState}</Alert>
                    ) : (
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Reset
                        </Button>
                    )}
                    {errState ? (
                        <Alert severity="error">{errState}</Alert>
                    ) : null}
                </Box>
            </Box>
        </Container>
    );
};

export default ResetPassword;
