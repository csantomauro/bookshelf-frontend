import DialogContent from '@mui/material/DialogContent';
import type { Book } from '../type';
import { Stack, TextField } from '@mui/material';

type DialogFormProps = {
  book: Book;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function BookDialogContent({ book, handleChange }: DialogFormProps) {
  return (
    <>
      <DialogContent>
        <Stack spacing={1.5} mt={1}>
            <TextField label="Title" name="title"
                value={book.title} onChange={handleChange}/>
            <TextField label="Genre" name="genre"
                value={book.genre} onChange={handleChange}/>
            <TextField label="Isbn" name="isbn"
                value={book.isbn} onChange={handleChange}/>
            <TextField label="Publisher" name="publisher"
                value={book.publisher} onChange={handleChange}/>
            <TextField label="PublicationYear" name="publicationYear"
                value={book.publicationYear} onChange={handleChange}/>
            <TextField label="Price" name="price"
                value={book.price} onChange={handleChange}/>
          </Stack>
        
      </DialogContent>  
    </>
  );
}
export default BookDialogContent;