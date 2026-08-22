import { useState } from 'react';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Switch} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Booklist from './pages/Booklist';
import BookDetail from './pages/BookDetail';
import AuthButton from './components/AuthButton';
import theme from './themes/theme';

const queryClient = new QueryClient();

function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme(darkMode)}>
        <CssBaseline />
        <BrowserRouter>
          <AppBar position="static" color="primary">
            <Toolbar>
              <Typography
                variant="h6"
                component={Link}
                to="/books"
                sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
              >
              📚 Book Shelf
              </Typography>
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                color="secondary"
              />
              <AuthButton />
            </Toolbar>
          </AppBar>

          <Container maxWidth="xl" sx={{ mt: 3 }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/books" element={<Booklist />} />
              <Route path="/books/:id" element={<BookDetail />} />
              <Route path="/" element={<Navigate to="/books" replace />} />
            </Routes>
          </Container>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
