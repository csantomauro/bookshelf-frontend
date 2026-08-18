import { useState } from 'react';
import { Box, Button, Paper, Snackbar, Stack, TextField } from '@mui/material';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { isAuthenticated, storeAuthToken } from '../auth/auth';

type User = {
    username: string;
    password: string;
}

function Login() {
    const navigate = useNavigate();

    const [user, setUser] = useState<User>({
        username: '',
        password: ''
    });

    const [open, setOpen] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setUser({ ...user, [name]: value });
    }

    const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        axios.post(`${import.meta.env.VITE_API_URL}/login`, user, {
          headers: { 'Content-Type': 'application/json' }
        })
          .then(res => {
            const jwtToken = res.headers['authorization'];
            if (jwtToken) {
              storeAuthToken(jwtToken);
              navigate('/books');
            }
          })
          .catch(() => setOpen(true));
      };

    if (isAuthenticated()) {
        return <Navigate to="/books" replace />;
    }

    return (
        <Box display="flex" justifyContent="center">
        <Paper sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: 3 }}>
          <form onSubmit={handleLogin}>
            <Stack spacing={3}>
              <TextField
                name="username"
                label="Username"
                fullWidth
                onChange={handleChange}
              />
              <TextField
                name="password"
                label="Password"
                type="password"
                fullWidth
                onChange={handleChange}
              />
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Login
              </Button>
            </Stack>
          </form>
          <Snackbar
            open={open}
            autoHideDuration={3000}
            onClose={() => setOpen(false)}
            message="Login failed: Check your username and password"
          />
        </Paper>
      </Box>
    );
}

export default Login;
