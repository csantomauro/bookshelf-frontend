import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BookResponse } from "../type";
import { useState } from 'react';
import { Box, Button, Card, CardActionArea, CardActions, CardContent, Grid, IconButton, Snackbar, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddBook from './AddBook';
import DeleteIcon from '@mui/icons-material/Delete'
import EditBook from './EditBook';
import { deleteBook, getBooks } from '../api/bookapi';
import { clearAuth, isAdmin, isForbiddenError, PERMISSION_DENIED_MESSAGE } from '../auth/auth';

const extractId = (href: string): string => href.substring(href.lastIndexOf('/') + 1);

function Booklist() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const admin = isAdmin();
    const queryClient = useQueryClient();
    const { data, error, isSuccess } = useQuery<BookResponse[], Error>({
        queryKey: ["books"],
        queryFn: getBooks
    });

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message);
        setOpen(true);
    };

    const handleLogout = () => {
        clearAuth();
        // Otherwise the next user to log in on this tab sees stale
        // per-user data (e.g. "your review") from the previous session.
        queryClient.clear();
        navigate('/login');
    };

    const { mutate } = useMutation({
        mutationFn: deleteBook,
        onSuccess: () => {
          showSnackbar("Book deleted");
          queryClient.invalidateQueries({ queryKey: ['books'] });
        },
        onError: (err) => {
          if (isForbiddenError(err)) {
            showSnackbar(PERMISSION_DENIED_MESSAGE);
            return;
          }
          console.error(err);
        }
    });

    if (error) return <Box>Failed to load books.</Box>;
    if (!isSuccess) return <Box>Loading...</Box>;

    return (
        <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            {admin ? (
              <AddBook onForbidden={() => showSnackbar(PERMISSION_DENIED_MESSAGE)} />
            ) : (
              <Box />
            )}
            <Button variant="outlined" color="secondary" onClick={handleLogout}>
            Log out
            </Button>
        </Stack>

        <Grid container spacing={2}>
            {data.map((book) => (
                <Grid key={book._links.self.href} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Card>
                        <CardActionArea onClick={() => navigate(`/books/${extractId(book._links.self.href)}`)}>
                            <CardContent>
                                <Typography variant="h6" noWrap>{book.title}</Typography>
                                <Typography variant="body2" color="text.secondary">{book.genre}</Typography>
                                <Typography variant="body2" color="text.secondary">ISBN {book.isbn}</Typography>
                                <Typography variant="body2" color="text.secondary">{book.publisher} · {book.publicationYear}</Typography>
                                <Typography variant="body2">€{book.price}</Typography>
                            </CardContent>
                        </CardActionArea>
                        {admin && (
                            <CardActions>
                                <EditBook bookdata={book} onForbidden={() => showSnackbar(PERMISSION_DENIED_MESSAGE)} />
                                <IconButton
                                    onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete ${book.title}?`)) {
                                            mutate(book._links.book.href);
                                        }
                                    }}
                                    color="secondary"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </CardActions>
                        )}
                    </Card>
                </Grid>
            ))}
        </Grid>

        <Snackbar
            open={open}
            autoHideDuration={3000}
            onClose={() => setOpen(false)}
            message={snackbarMessage}
        />
        </Box>
    );
}

export default Booklist;
