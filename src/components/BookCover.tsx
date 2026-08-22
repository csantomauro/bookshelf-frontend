import { useState } from 'react';
import { Box } from '@mui/material';

type BookCoverProps = {
  coverUrl?: string | null;
  title: string;
  height?: number | string;
};

function BookCover({ coverUrl, title, height = 160 }: BookCoverProps) {
  const [loadFailed, setLoadFailed] = useState(false);

  // Reset the failure flag when the URL itself changes (e.g. after
  // re-fetching a different cover), without an effect: same render-time
  // "adjust state when a prop changes" pattern used in BookDetail.
  const [lastCoverUrl, setLastCoverUrl] = useState(coverUrl);
  if (coverUrl !== lastCoverUrl) {
    setLastCoverUrl(coverUrl);
    setLoadFailed(false);
  }

  if (coverUrl && !loadFailed) {
    return (
      <Box
        sx={{
          width: '100%',
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
        }}
      >
        <Box
          component="img"
          src={coverUrl}
          alt={`Cover of ${title}`}
          onError={() => setLoadFailed(true)}
          // "contain" keeps the cover's real proportions (Open Library
          // covers vary in aspect ratio) instead of cropping it to fill
          // a fixed box.
          sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        bgcolor: 'action.hover',
      }}
    >
      📚
    </Box>
  );
}

export default BookCover;
