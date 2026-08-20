import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const SLOW_HINT_DELAY_MS = 3000;

// The backend runs on a free tier that spins down when idle, so the very
// first request after a while can take much longer than a normal one.
// Rather than let a bare spinner look broken, explain the wait once it
// drags on.
function LoadingState() {
  const [showSlowHint, setShowSlowHint] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSlowHint(true), SLOW_HINT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} sx={{ mt: 4 }}>
      <CircularProgress />
      {showSlowHint && (
        <Typography color="text.secondary" align="center">
          📖 Waking up the librarian — hosting takes a little nap when nobody's around 🥱. Back in less than 60 seconds!
        </Typography>
      )}
    </Box>
  );
}

export default LoadingState;
