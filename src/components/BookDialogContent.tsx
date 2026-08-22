import DialogContent from '@mui/material/DialogContent';
import type { Book } from '../type';
import { Avatar, Button, Stack, TextField } from '@mui/material';
import { buildCoverUrl } from '../api/bookCoverApi';

type DialogFormProps = {
  book: Book;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverFetched: (url: string | null) => void;
}

function BookDialogContent({ book, handleChange, onCoverFetched }: DialogFormProps) {
  const handleFetchCover = () => {
    onCoverFetched(buildCoverUrl(book.isbn));
  };

  return (
    <>
      <DialogContent>
        <Stack spacing={1.5} mt={1}>
            <TextField label="Title" name="title"
                value={book.title} onChange={handleChange}/>
            <TextField label="Genre" name="genre"
                value={book.genre} onChange={handleChange}/>
            <Stack direction="row" spacing={1}>
              <TextField label="Isbn" name="isbn" fullWidth
                  value={book.isbn} onChange={handleChange}/>
              <Button
                onClick={handleFetchCover}
                disabled={!book.isbn}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Fetch cover
              </Button>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar variant="rounded" src={book.coverUrl ?? undefined} sx={{ width: 48, height: 64 }}>
                📚
              </Avatar>
              <TextField label="Cover URL (optional)" name="coverUrl" fullWidth
                  value={book.coverUrl ?? ''} onChange={handleChange}/>
            </Stack>
            <TextField label="Publisher" name="publisher"
                value={book.publisher} onChange={handleChange}/>
            <TextField label="PublicationYear" name="publicationYear" type="number"
                value={book.publicationYear} onChange={handleChange}/>
            <TextField label="Price" name="price" type="number"
                value={book.price} onChange={handleChange}/>
          </Stack>

      </DialogContent>
    </>
  );
}
export default BookDialogContent;
