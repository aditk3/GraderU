import { React, useState } from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import api from '../../utils/api';

const ForgotPassword = () => {
    const [errState, setErrState] = useState('');
    const [successState, setSuccessState] = useState('');
    const navigate = useNavigate();

    const onForgotPassword = async (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        try {
            await api.post('/users/forgotPassword', {
                email: data.get('email'),
            });
            setErrState('');
            setSuccessState('Reset code sent!');
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
                    Forgot Password
                </Typography>
                <div>Reset your password</div>
                <Box
                    component="form"
                    onSubmit={onForgotPassword}
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
                    {successState ? (
                        <Alert severity="success">{successState}</Alert>
                    ) : null}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {successState ? 'Resend reset code' : 'Send reset code'}
                    </Button>
                    {errState ? (
                        <Alert severity="error">{errState}</Alert>
                    ) : null}
                    {successState ? (
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ mb: 2 }}
                            onClick={() => navigate('/reset-password')}
                        >
                            Continue
                        </Button>
                    ) : null}
                </Box>
            </Box>
        </Container>
    );
};

export default ForgotPassword;
