import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import BookDialogContent from './BookDialogContent';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Book, BookEntry, BookResponse } from '../type';
import { Button, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'
import { updateBook } from '../api/bookapi';

type FormProps = {
  bookdata: BookResponse;
}

function EditBook({ bookdata }: FormProps) {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [book, setBook] = useState<Book>({
    title: '',
    genre: '',
    isbn: '',
    publisher: '',
    publicationYear: 0,
    price: 0
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
          price: 0
        });
        setOpen(false);
      },
      onError: (err) => {
        console.error(err);
      },
    }); 

  const handleClickOpen = () => {
    setOpen(true);
    setBook({
      title: bookdata.title,
      genre: bookdata.genre,
      isbn: bookdata.isbn,
      publisher: bookdata.publisher,
      publicationYear: bookdata.publicationYear,
      price: bookdata.price
    });
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleSave = () => {
    const bookEntry: BookEntry = { book, url: bookdata._links.self.href };
    mutate(bookEntry); // `onSuccess` already closes dialog and resets state
};

  const handleChange = (event : React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setBook({ ...book, [name]: value });
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
        <BookDialogContent book={book} handleChange={handleChange}/>
        <DialogActions>
          <Button variant="outlined" color="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="contained" color="primary" type="submit">Save</Button>
        </DialogActions>
      </Dialog>    
    </>
  );
}

export default EditBook;