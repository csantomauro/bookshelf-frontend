import { useState } from 'react';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Switch, Button, IconButton} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Booklist from './pages/Booklist';
import BookDetail from './pages/BookDetail';
import MyShelf from './pages/MyShelf';
import UserProfile from './pages/UserProfile';
import SearchResults from './pages/SearchResults';
import AuthButton from './components/AuthButton';
import { getUsername, useIsAuthenticated } from './auth/auth';
import theme from './themes/theme';

const queryClient = new QueryClient();

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const authed = useIsAuthenticated();
  const username = getUsername();

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
              <IconButton color="inherit" component={Link} to="/search" aria-label="search">
                <SearchIcon />
              </IconButton>
              {authed && (
                <Button color="inherit" component={Link} to="/shelf">
                  My Shelf
                </Button>
              )}
              {authed && username && (
                <Button color="inherit" component={Link} to={`/users/${username}`}>
                  {username}
                </Button>
              )}
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
              <Route path="/shelf" element={<MyShelf />} />
              <Route path="/users/:username" element={<UserProfile />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/" element={<Navigate to="/books" replace />} />
            </Routes>
          </Container>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
