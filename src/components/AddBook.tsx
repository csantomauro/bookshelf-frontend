import { Alert, Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Book } from "../type";
import BookDialogContent from "./BookDialogContent";
import { addBook } from "../api/bookapi";
import { getValidationErrorMessage, isForbiddenError } from "../auth/auth";

type AddBookProps = {
  onForbidden?: () => void;
};

function AddBook({ onForbidden }: AddBookProps) {
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
      mutationFn: addBook,
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

    const handleChange = (event : React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type } = event.target;
      setBook({...book, [name]: type === 'number' ? Number(value) : value});
    }

    const handleCoverFetched = (url: string | null) => {
      setBook({...book, coverUrl: url});
    }
  
    return(
      <>
        <Button variant="outlined" onClick={() => { setFormError(null); setOpen(true); }}>New Book</Button>
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
            {formError && <Alert severity="error" sx={{ mx: 3 }}>{formError}</Alert>}
            <BookDialogContent book={book} handleChange={handleChange} onCoverFetched={handleCoverFetched} />
          <DialogActions>
            <Button variant="outlined" color="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" color="primary" type="submit">Save</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
  
  export default AddBook;
