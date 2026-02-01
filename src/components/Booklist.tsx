import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BookResponse } from "../type";
import { DataGrid, type GridCellParams, type GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { Box, Button, IconButton, Snackbar, Stack } from '@mui/material';
import AddBook from './AddBook';
import DeleteIcon from '@mui/icons-material/Delete'
import EditBook from './EditBook';
import { deleteBook, getBooks } from '../api/bookapi';

type BooklistProp = {
    logOut?: () => void;
}

function Booklist({logOut}: BooklistProp) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const { data, error, isSuccess } = useQuery<BookResponse[], Error>({
        queryKey: ["books"],
        queryFn: getBooks
    });

    const { mutate } = useMutation({
        mutationFn: deleteBook,
        onSuccess: () => {
          setOpen(true);
          queryClient.invalidateQueries({ queryKey: ['books'] });
        },
        onError: (err) => {
          console.error(err);
        }
    });
      

    const columns: GridColDef[] = [
        {field: 'title', headerName: 'Title', width: 200},
        {field: 'genre', headerName: 'Genre', width: 200},
        {field: 'isbn', headerName: 'Isbn', width: 200},
        {field: 'publisher', headerName: 'Publisher', width: 150},
        {field: 'publicationYear', headerName: 'Publication Year', width: 150},
        {field: 'price', headerName: 'Price', width: 150},
        {
            field: 'edit',
            headerName: '',
            width: 90,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params: GridCellParams) =>
              <EditBook bookdata={params.row} />
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

    if (error) return <Box>Failed to load books.</Box>;
    if (!isSuccess) return <Box>Loading...</Box>;

    else {
        return (
            <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <AddBook />
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
                autoHideDuration={2000}
                onClose={() => setOpen(false)}
                message="Book deleted"
            />
            </Box>
        );
    }
}

export default Booklist;