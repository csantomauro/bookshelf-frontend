import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Button, IconButton, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { ReadingStatus } from '../type';
import { deleteMyShelfEntry, getMyShelf } from '../api/shelfapi';
import { useIsAuthenticated } from '../auth/auth';
import LoadingState from '../components/LoadingState';
import BookCover from '../components/BookCover';

const TABS: { label: string; status?: ReadingStatus }[] = [
  { label: 'All' },
  { label: 'Want to read', status: 'WANT_TO_READ' },
  { label: 'Reading', status: 'READING' },
  { label: 'Read', status: 'READ' },
];

function MyShelf() {
  const authed = useIsAuthenticated();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const status = TABS[tab].status;

  const { data: entries, isSuccess, error, isFetching } = useQuery({
    queryKey: ['myShelf', status ?? 'ALL'],
    queryFn: () => getMyShelf(status),
    enabled: authed,
  });

  const { mutate: removeEntry } = useMutation({
    mutationFn: (bookId: number) => deleteMyShelfEntry(String(bookId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myShelf'] });
    },
  });

  if (!authed) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography color="text.secondary">Log in to see your shelf.</Typography>
        <Button size="small" onClick={() => navigate('/login')}>Log in</Button>
      </Stack>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>My Shelf</Typography>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
        {TABS.map((t) => (
          <Tab key={t.label} label={t.label} />
        ))}
      </Tabs>

      {!!error && !isFetching && <Box>Failed to load your shelf.</Box>}
      {!isSuccess && !error && <LoadingState />}

      {isSuccess && entries.length === 0 && (
        <Typography color="text.secondary">Nothing here yet — add a book from its page.</Typography>
      )}

      {isSuccess && (
        <Stack spacing={1.5}>
          {entries.map((entry) => (
            <Paper
              key={entry.id}
              sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
              onClick={() => navigate(`/books/${entry.bookId}`)}
            >
              <Box sx={{ width: 48, flexShrink: 0 }}>
                <BookCover coverUrl={entry.bookCoverUrl} title={entry.bookTitle} height={64} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1">{entry.bookTitle}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {TABS.find((t) => t.status === entry.status)?.label}
                </Typography>
              </Box>
              <IconButton
                aria-label="remove from shelf"
                onClick={(e) => {
                  e.stopPropagation();
                  removeEntry(entry.bookId);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default MyShelf;
