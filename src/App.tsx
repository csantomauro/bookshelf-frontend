import { useState } from 'react';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Switch} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Booklist from './components/Booklist';
import BookDetail from './components/BookDetail';
import RequireAuth from './components/RequireAuth';
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
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
              📚 Book Shelf
              </Typography>
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                color="secondary"
              />
            </Toolbar>
          </AppBar>

          <Container maxWidth="xl" sx={{ mt: 3 }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<RequireAuth />}>
                <Route path="/books" element={<Booklist />} />
                <Route path="/books/:id" element={<BookDetail />} />
              </Route>
              <Route path="/" element={<Navigate to="/books" replace />} />
            </Routes>
          </Container>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
