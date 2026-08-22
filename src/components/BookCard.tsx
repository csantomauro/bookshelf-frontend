import { Box, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import type { BookResponse } from '../type';
import BookCover from './BookCover';
import EditBook from './EditBook';

const CARD_WIDTH = 160;
const CARD_HEIGHT = 240;

const extractId = (href: string): string => href.substring(href.lastIndexOf('/') + 1);

type BookCardProps = {
  book: BookResponse;
  admin: boolean;
  onDelete: () => void;
  onForbidden: () => void;
};

function BookCard({ book, admin, onDelete, onForbidden }: BookCardProps) {
  const navigate = useNavigate();

  return (
    <Box
      role="button"
      aria-label={`Open ${book.title}`}
      onClick={() => navigate(`/books/${extractId(book._links.self.href)}`)}
      sx={{ width: CARD_WIDTH, height: CARD_HEIGHT, perspective: '1000px', cursor: 'pointer' }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          '&:hover': { transform: 'rotateY(180deg)' },
        }}
      >
        {/* Front: just the cover, sized to the card. */}
        <Box sx={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 1, overflow: 'hidden' }}>
          <BookCover coverUrl={book.coverUrl} title={book.title} height="100%" />
        </Box>

        {/* Back: details, revealed on hover. */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.25,
            overflow: 'hidden',
          }}
        >
          <Typography variant="caption" fontWeight="bold" noWrap>{book.title}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>{book.genre}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>ISBN {book.isbn}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>{book.publisher} · {book.publicationYear}</Typography>
          <Typography variant="caption">€{book.price}</Typography>

          {admin && (
            <Box
              sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <EditBook bookdata={book} onForbidden={onForbidden} />
              <IconButton
                aria-label="delete"
                size="small"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${book.title}?`)) {
                    onDelete();
                  }
                }}
                color="secondary"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default BookCard;
