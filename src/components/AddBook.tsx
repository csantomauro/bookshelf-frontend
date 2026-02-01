import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Book } from "../type";
import BookDialogContent from "./BookDialogContent";
import { addBook } from "../api/bookapi";

function AddBook() {
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
      mutationFn: addBook,
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
    
    const handleChange = (event : React.ChangeEvent<HTMLInputElement>) => {
      setBook({...book, [event.target.name]: event.target.value});
    }
  
    return(
      <>
        <Button variant="outlined" onClick={() => setOpen(true)}>New Book</Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            mutate(book);
          }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>New book</DialogTitle>
            <BookDialogContent book={book} handleChange={handleChange} />
          <DialogActions>
            <Button variant="outlined" color="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" color="primary" type="submit">Save</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
  
  export default AddBook;