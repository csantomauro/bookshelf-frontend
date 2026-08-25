import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Paper, Stack, TextField, Typography } from '@mui/material';
import { search } from '../api/searchapi';
import LoadingState from '../components/LoadingState';
import BookCover from '../components/BookCover';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

function SearchResults() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const [inputValue, setInputValue] = useState(urlQuery);

  // Keep the input in sync when the URL changes from outside typing (e.g.
  // browser back/forward), without an effect: same render-time "adjust
  // state when a prop changes" pattern used in BookDetail/BookCover.
  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery);
  if (urlQuery !== lastUrlQuery) {
    setLastUrlQuery(urlQuery);
    setInputValue(urlQuery);
  }

  // Push what's typed into the URL only after a pause, instead of firing a
  // request (and a history entry) on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams(inputValue ? { q: inputValue } : {}, { replace: true });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputValue, setSearchParams]);

  const trimmedQuery = urlQuery.trim();
  const queryReady = trimmedQuery.length >= MIN_QUERY_LENGTH;

  const { data, isSuccess, error, isFetching } = useQuery({
    queryKey: ['search', trimmedQuery],
    queryFn: () => search(trimmedQuery),
    enabled: queryReady,
  });

  const noResults = isSuccess && data.books.length === 0 && data.users.length === 0;

  return (
    <Box>
      <TextField
        autoFocus
        fullWidth
        label="Search books or users"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        sx={{ mb: 3 }}
      />

      {!queryReady && (
        <Typography color="text.secondary">Type at least {MIN_QUERY_LENGTH} characters to search.</Typography>
      )}

      {queryReady && !!error && !isFetching && <Box>Search failed.</Box>}
      {queryReady && !isSuccess && !error && <LoadingState />}

      {queryReady && noResults && (
        <Typography color="text.secondary">No matches for "{trimmedQuery}".</Typography>
      )}

      {queryReady && isSuccess && data.books.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Books</Typography>
          <Stack spacing={1.5}>
            {data.books.map((book) => (
              <Paper
                key={book.id}
                sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                onClick={() => navigate(`/books/${book.id}`)}
              >
                <Box sx={{ width: 48, flexShrink: 0 }}>
                  <BookCover coverUrl={book.coverUrl} title={book.title} height={64} />
                </Box>
                <Box>
                  <Typography variant="subtitle1">{book.title}</Typography>
                  {book.authorName && (
                    <Typography variant="body2" color="text.secondary">{book.authorName}</Typography>
                  )}
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {queryReady && isSuccess && data.users.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>Users</Typography>
          <Stack spacing={1.5}>
            {data.users.map((user) => (
              <Paper
                key={user.username}
                sx={{ p: 1.5, cursor: 'pointer' }}
                onClick={() => navigate(`/users/${user.username}`)}
              >
                <Typography variant="subtitle1">{user.username}</Typography>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

export default SearchResults;
