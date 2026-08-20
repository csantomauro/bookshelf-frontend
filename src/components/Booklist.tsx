import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BookResponse } from "../type";
import { useState } from 'react';
import { Box, Card, CardActionArea, CardActions, CardContent, Grid, IconButton, Snackbar, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddBook from './AddBook';
import DeleteIcon from '@mui/icons-material/Delete'
import EditBook from './EditBook';
import { deleteBook, getBooks } from '../api/bookapi';
import { isForbiddenError, PERMISSION_DENIED_MESSAGE, useIsAdmin } from '../auth/auth';
import LoadingState from './LoadingState';

const extractId = (href: string): string => href.substring(href.lastIndexOf('/') + 1);

function Booklist() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const admin = useIsAdmin();
    const queryClient = useQueryClient();
    const { data, error, isSuccess, isFetching } = useQuery<BookResponse[], Error>({
        queryKey: ["books"],
        queryFn: getBooks
    });

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message);
        setOpen(true);
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

    // A prior attempt failing doesn't mean the current one has: react-query
    // keeps showing the last error while it quietly retries in the
    // background (e.g. after the free-tier backend was asleep), so only
    // treat it as a real failure once that retry has actually stopped.
    if (error && !isFetching) return <Box>Failed to load books.</Box>;
    if (!isSuccess) return <LoadingState />;

    return (
        <Box>
        {admin && (
            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
                <AddBook onForbidden={() => showSnackbar(PERMISSION_DENIED_MESSAGE)} />
            </Stack>
        )}

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
