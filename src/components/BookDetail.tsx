import { useState } from 'react';
import type { Review } from '../type';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Divider, Paper, Rating, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { deleteMyReview, getBook, getMyReview, getReviews, upsertMyReview } from '../api/reviewapi';
import { isForbiddenError, PERMISSION_DENIED_MESSAGE } from '../auth/auth';

function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const bookId = id as string;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setOpen(true);
  };

  const { data: book, isSuccess: bookLoaded } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => getBook(bookId),
  });

  const { data: reviews, isSuccess: reviewsLoaded } = useQuery({
    queryKey: ['reviews', bookId],
    queryFn: () => getReviews(bookId),
  });

  const { data: myReview } = useQuery({
    queryKey: ['myReview', bookId],
    queryFn: () => getMyReview(bookId),
  });

  const [rating, setRating] = useState<number | null>(0);
  const [text, setText] = useState('');

  // Pre-fill the form once "my review" loads, without an effect: React's
  // documented pattern for adjusting state during render when a query
  // result changes (react-query keeps `myReview` referentially stable
  // across renders unless the data actually changes).
  const [loadedReview, setLoadedReview] = useState<Review | null | undefined>(undefined);
  if (myReview !== loadedReview) {
    setLoadedReview(myReview);
    if (myReview) {
      setRating(myReview.rating);
      setText(myReview.text ?? '');
    }
  }

  const invalidateReviewQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['reviews', bookId] });
    queryClient.invalidateQueries({ queryKey: ['myReview', bookId] });
  };

  const { mutate: saveReview } = useMutation({
    mutationFn: () => upsertMyReview(bookId, { rating: rating ?? 0, text }),
    onSuccess: () => {
      showSnackbar('Review saved');
      invalidateReviewQueries();
    },
    onError: (err) => {
      if (isForbiddenError(err)) {
        showSnackbar(PERMISSION_DENIED_MESSAGE);
        return;
      }
      console.error(err);
    },
  });

  const { mutate: removeReview } = useMutation({
    mutationFn: () => deleteMyReview(bookId),
    onSuccess: () => {
      showSnackbar('Review deleted');
      setRating(0);
      setText('');
      invalidateReviewQueries();
    },
    onError: (err) => console.error(err),
  });

  if (!bookLoaded || !reviewsLoaded) {
    return <Box>Loading...</Box>;
  }

  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  return (
    <Box>
      <Button onClick={() => navigate('/books')} sx={{ mb: 2 }}>&larr; Back to books</Button>

      <Typography variant="h4">{book.title}</Typography>
      <Typography variant="body1" color="text.secondary">
        {book.genre} · {book.publisher} · {book.publicationYear}
      </Typography>

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1, mb: 3 }}>
        <Rating name="average-rating" value={averageRating ?? 0} precision={0.5} readOnly />
        <Typography variant="body2">
          {averageRating !== null ? `${averageRating.toFixed(1)} (${reviews.length})` : 'No ratings yet'}
        </Typography>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="h6" sx={{ mb: 1 }}>Your review</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={(e) => { e.preventDefault(); saveReview(); }}>
          <Stack spacing={2}>
            <Rating
              name="my-rating"
              value={rating}
              onChange={(_, newValue) => setRating(newValue)}
            />
            <TextField
              label="Your thoughts (optional)"
              multiline
              minRows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained" disabled={!rating}>Save</Button>
              {myReview && (
                <Button variant="outlined" color="secondary" onClick={() => removeReview()}>Delete</Button>
              )}
            </Stack>
          </Stack>
        </form>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="h6" sx={{ mb: 1 }}>All reviews</Typography>
      {reviews.length === 0 && <Typography color="text.secondary">No reviews yet — be the first.</Typography>}
      <Stack spacing={2}>
        {reviews.map((r) => (
          <Paper key={r.id} sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">{r.username}</Typography>
              <Rating value={r.rating} readOnly size="small" />
            </Stack>
            {r.text && <Typography variant="body2" sx={{ mt: 1 }}>{r.text}</Typography>}
          </Paper>
        ))}
      </Stack>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}

export default BookDetail;
