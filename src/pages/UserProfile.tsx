import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Divider, Paper, Rating, Stack, Typography } from '@mui/material';
import type { ReadingStatus } from '../type';
import { followUser, getProfile, getReviewsByUser, getShelfByUser, unfollowUser } from '../api/userapi';
import { getUsername, useIsAuthenticated } from '../auth/auth';
import LoadingState from '../components/LoadingState';
import BookCover from '../components/BookCover';

const SHELF_STATUS_LABELS: Record<ReadingStatus, string> = {
  WANT_TO_READ: 'Want to read',
  READING: 'Reading',
  READ: 'Read',
};

const formatDate = (iso: string): string => new Date(iso).toLocaleDateString();

function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authed = useIsAuthenticated();
  const isOwnProfile = authed && getUsername() === username;

  const { data: profile, isSuccess: profileLoaded, error: profileError, isFetching: profileFetching } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => getProfile(username as string),
  });

  const { data: reviews, isSuccess: reviewsLoaded } = useQuery({
    queryKey: ['userReviews', username],
    queryFn: () => getReviewsByUser(username as string),
  });

  const { data: shelf, isSuccess: shelfLoaded } = useQuery({
    queryKey: ['userShelf', username],
    queryFn: () => getShelfByUser(username as string),
  });

  const invalidateProfile = () => {
    queryClient.invalidateQueries({ queryKey: ['profile', username] });
  };

  const { mutate: follow, isPending: following } = useMutation({
    mutationFn: () => followUser(username as string),
    onSuccess: invalidateProfile,
  });

  const { mutate: unfollow, isPending: unfollowing } = useMutation({
    mutationFn: () => unfollowUser(username as string),
    onSuccess: invalidateProfile,
  });

  if (profileError && !profileFetching) {
    return <Box>User not found.</Box>;
  }
  if (!profileLoaded) {
    return <LoadingState />;
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h4">{profile.username}</Typography>
        {!isOwnProfile && (authed ? (
          <Button
            variant={profile.followedByMe ? 'outlined' : 'contained'}
            disabled={following || unfollowing}
            onClick={() => (profile.followedByMe ? unfollow() : follow())}
          >
            {profile.followedByMe ? 'Unfollow' : 'Follow'}
          </Button>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography color="text.secondary">Log in to follow</Typography>
            <Button size="small" onClick={() => navigate('/login')}>Log in</Button>
          </Stack>
        ))}
      </Stack>

      <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
        <Typography color="text.secondary">
          <strong>{profile.followerCount}</strong> followers
        </Typography>
        <Typography color="text.secondary">
          <strong>{profile.followingCount}</strong> following
        </Typography>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="h6" sx={{ mb: 1 }}>Shelf</Typography>
      {!shelfLoaded && <LoadingState />}
      {shelfLoaded && shelf.length === 0 && (
        <Typography color="text.secondary" sx={{ mb: 3 }}>Nothing on the shelf yet.</Typography>
      )}
      {shelfLoaded && shelf.length > 0 && (
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          {shelf.map((entry) => (
            <Paper
              key={entry.id}
              sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
              onClick={() => navigate(`/books/${entry.bookId}`)}
            >
              <Box sx={{ width: 48, flexShrink: 0 }}>
                <BookCover coverUrl={entry.bookCoverUrl} title={entry.bookTitle} height={64} />
              </Box>
              <Box>
                <Typography variant="subtitle1">{entry.bookTitle}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {SHELF_STATUS_LABELS[entry.status]}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}

      <Divider sx={{ mb: 3 }} />

      <Typography variant="h6" sx={{ mb: 1 }}>Reviews</Typography>
      {!reviewsLoaded && <LoadingState />}
      {reviewsLoaded && reviews.length === 0 && (
        <Typography color="text.secondary">No reviews yet.</Typography>
      )}
      {reviewsLoaded && reviews.length > 0 && (
        <Stack spacing={2}>
          {reviews.map((r) => (
            <Paper key={r.id} sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Rating value={r.rating} readOnly size="small" />
                <Typography variant="caption" color="text.secondary">{formatDate(r.createdAt)}</Typography>
              </Stack>
              {r.text && <Typography variant="body2" sx={{ mt: 1 }}>{r.text}</Typography>}
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default UserProfile;
