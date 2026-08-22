import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import BookDialogContent from './BookDialogContent';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Book, BookEntry, BookResponse } from '../type';
import { Alert, Button, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'
import { updateBook } from '../api/bookapi';
import { getValidationErrorMessage, isForbiddenError } from '../auth/auth';

type FormProps = {
  bookdata: BookResponse;
  onForbidden?: () => void;
}

function EditBook({ bookdata, onForbidden }: FormProps) {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [book, setBook] = useState<Book>({
    title: '',
    genre: '',
    isbn: '',
    publisher: '',
    publicationYear: 0,
    price: 0,
    coverUrl: null
  });

const { mutate } = useMutation({
      mutationFn: updateBook,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['books'] });
        setBook({
          title: '',
          genre: '',
          isbn: '',
          publisher: '',
          publicationYear: 0,
          price: 0,
          coverUrl: null
        });
        setFormError(null);
        setOpen(false);
      },
      onError: (err) => {
        if (isForbiddenError(err)) {
          setOpen(false);
          onForbidden?.();
          return;
        }
        const validationMessage = getValidationErrorMessage(err);
        if (validationMessage) {
          setFormError(validationMessage);
          return;
        }
        console.error(err);
      },
    });

  const handleClickOpen = () => {
    setFormError(null);
    setOpen(true);
    setBook({
      title: bookdata.title,
      genre: bookdata.genre,
      isbn: bookdata.isbn,
      publisher: bookdata.publisher,
      publicationYear: bookdata.publicationYear,
      price: bookdata.price,
      coverUrl: bookdata.coverUrl ?? null
    });
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleSave = () => {
    const bookEntry: BookEntry = { book, url: bookdata._links.self.href };
    mutate(bookEntry);
};

  const handleChange = (event : React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target;
    setBook({ ...book, [name]: type === 'number' ? Number(value) : value });
  }

  const handleCoverFetched = (url: string | null) => {
    setBook({ ...book, coverUrl: url });
  }

  return(
    <>
      <Tooltip title="Edit book">
      <IconButton aria-label='edit' size='small' onClick={handleClickOpen}>
        <EditIcon />
      </IconButton>
      </Tooltip>
      <Dialog 
        open={open}
        onClose={handleClose}
        component="form"
        onSubmit={(e) => { 
          e.preventDefault();
          handleSave(); 
        }} 
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit book</DialogTitle>
        {formError && <Alert severity="error" sx={{ mx: 3 }}>{formError}</Alert>}
        <BookDialogContent book={book} handleChange={handleChange} onCoverFetched={handleCoverFetched}/>
        <DialogActions>
          <Button variant="outlined" color="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="contained" color="primary" type="submit">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EditBook;
