import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BookResponse } from "../type";
import { DataGrid, type GridCellParams, type GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { Box, Button, IconButton, Snackbar, Stack } from '@mui/material';
import AddBook from './AddBook';
import DeleteIcon from '@mui/icons-material/Delete'
import EditBook from './EditBook';
import { deleteBook, getBooks } from '../api/bookapi';
import { isAdmin, isForbiddenError, PERMISSION_DENIED_MESSAGE } from '../auth/auth';

type BooklistProp = {
    logOut?: () => void;
}

function Booklist({logOut}: BooklistProp) {
    const [open, setOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const admin = isAdmin();
    const queryClient = useQueryClient();
    const { data, error, isSuccess } = useQuery<BookResponse[], Error>({
        queryKey: ["books"],
        queryFn: getBooks
    });

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message);
        setOpen(true);
    };

    const { mutate } = useMutation({
        mutationFn: deleteBook,
        onSuccess: () => {
          showSnackbar("Book deleted");
          queryClient.invalidateQueries({ queryKey: ['books'] });
        },
        onError: (err) => {
          if (isForbiddenError(err)) {
            showSnackbar(PERMISSION_DENIED_MESSAGE);
            return;
          }
          console.error(err);
        }
    });
      

    const baseColumns: GridColDef[] = [
        {field: 'title', headerName: 'Title', width: 200},
        {field: 'genre', headerName: 'Genre', width: 200},
        {field: 'isbn', headerName: 'Isbn', width: 200},
        {field: 'publisher', headerName: 'Publisher', width: 150},
        {field: 'publicationYear', headerName: 'Publication Year', width: 150},
        {field: 'price', headerName: 'Price', width: 150},
    ];

    const adminColumns: GridColDef[] = [
        {
            field: 'edit',
            headerName: '',
            width: 90,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params: GridCellParams) =>
              <EditBook bookdata={params.row} onForbidden={() => showSnackbar(PERMISSION_DENIED_MESSAGE)} />
        },
        {
            field: 'delete',
            headerName: '',
            width: 90,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params: GridCellParams) => (
                <IconButton
                    onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${params.row.title}?`)) {
                            mutate(params.row._links.book.href);
                        }
                    }}
                    color="secondary"
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            )
        }
    ];

    const columns = admin ? [...baseColumns, ...adminColumns] : baseColumns;

    if (error) return <Box>Failed to load books.</Box>;
    if (!isSuccess) return <Box>Loading...</Box>;

    else {
        return (
            <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                {admin ? (
                  <AddBook onForbidden={() => showSnackbar(PERMISSION_DENIED_MESSAGE)} />
                ) : (
                  <Box />
                )}
                <Button variant="outlined" color="secondary" onClick={logOut}>
                Log out
                </Button>
            </Stack>

            <Box>
                <DataGrid
                rows={data}
                columns={columns}
                getRowId={(row) => row._links.self.href}
                />
            </Box>

            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={() => setOpen(false)}
                message={snackbarMessage}
            />
            </Box>
        );
    }
}

export default Booklist;
