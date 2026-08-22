import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BookResponse } from "../type";
import { useState } from 'react';
import { Box, Snackbar, Stack } from '@mui/material';
import { deleteBook, getBooks } from '../api/bookapi';
import { isForbiddenError, PERMISSION_DENIED_MESSAGE, useIsAdmin } from '../auth/auth';
import LoadingState from '../components/LoadingState';
import AddBook from '../components/AddBook';
import BookCard from '../components/BookCard';

function Booklist() {
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

        <Box display="flex" flexWrap="wrap" gap={2}>
            {data.map((book) => (
                <BookCard
                    key={book._links.self.href}
                    book={book}
                    admin={admin}
                    onDelete={() => mutate(book._links.book.href)}
                    onForbidden={() => showSnackbar(PERMISSION_DENIED_MESSAGE)}
                />
            ))}
        </Box>

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
