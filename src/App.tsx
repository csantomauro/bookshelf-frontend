import { useState } from 'react';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Switch} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './components/Login';
import theme from './themes/theme';

const queryClient = new QueryClient();

function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme(darkMode)}>
        <CssBaseline />
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
            📚 Book Shop
            </Typography>
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              color="secondary"
            />
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 3 }}>
          <Login />
        </Container>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
