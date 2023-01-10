import { React, useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import api from '../../utils/api';
import { redirectTimeout } from '../../utils/constants';

const Verify = () => {
    const [render, setRender] = useState('');
    const [errState, setErrState] = useState('');
    const [successState, setSuccessState] = useState({
        requestVerification: '',
        verify: '',
    });
    const navigate = useNavigate();

    async function checkVerify() {
        try {
            const res = await api.get('/users/me');
            if (res.data.data.verified) setRender('You are already verified!');
        } catch (err) {
            setRender(err.response.data.message);
        }
    }

    useEffect(() => {
        checkVerify();
    }, []);

    const onVerify = async (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        try {
            await api.patch('/users/verify', {
                email: data.get('email'),
                OTP: data.get('verifyCode'),
            });
            setErrState('');
            setSuccessState({
                requestVerification: '',
                verify: 'Account succesfully verified!',
            });
            setTimeout(() => {
                navigate('/');
            }, redirectTimeout);
        } catch (err) {
            setErrState(err.response.data.message);
            setSuccessState({
                requestVerification: '',
                verify: '',
            });
        }
    };

    const renderVerification = (
        <Box component="form" onSubmit={onVerify} noValidate sx={{ mt: 1 }}>
            {successState.requestVerification ? (
                <div>
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
                        id="verifyCode"
                        label="Verification Code"
                        name="verifyCode"
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
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 2 }}
                    >
                        Verify
                    </Button>
                </div>
            ) : null}
            <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 2 }}
                onClick={async () => {
                    try {
                        await api.post('/users/requestVerification');
                        setErrState('');
                        setSuccessState({
                            ...setSuccessState,
                            requestVerification:
                                'Verification code sent succesfully!',
                        });
                    } catch (err) {
                        setErrState(err.response.data.message);
                        setSuccessState({
                            ...setSuccessState,
                            requestVerification: '',
                        });
                    }
                }}
            >
                {successState.requestVerification
                    ? 'Resend verification code'
                    : 'Send verification code'}
            </Button>
            {errState ||
            successState.verify ||
            successState.requestVerification ? (
                <Alert severity={errState ? 'error' : 'success'}>
                    {errState ||
                        successState.verify ||
                        successState.requestVerification}
                </Alert>
            ) : null}
        </Box>
    );

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
                    Verify
                </Typography>
                <div>Verify your account</div>
                {render ? (
                    <div>
                        <Alert severity="warning">{render}</Alert>
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ mt: 2, mb: 2 }}
                            onClick={() => navigate('/')}
                        >
                            {' '}
                            Take me home!
                        </Button>
                    </div>
                ) : (
                    renderVerification
                )}
            </Box>
        </Container>
    );
};

export default Verify;
