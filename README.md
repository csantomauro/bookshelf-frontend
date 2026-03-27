# BookShelf Frontend

A React + TypeScript frontend for managing a personal book library. Users can log in, browse, add, edit, and delete books from a data grid.

**Live demo:** https://bookshelf-frontend-ten.vercel.app  
**Backend repository:** https://github.com/csantomauro/book-Shelf

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| UI | Material UI (MUI) v5, MUI X DataGrid |
| Data fetching | TanStack Query (React Query) v5 |
| HTTP client | Axios |
| Deployment | Vercel |

## Features

- JWT authentication — token stored in sessionStorage, attached to every API request
- Dark / light mode toggle with persistent MUI theme
- Book list displayed in a sortable, filterable MUI DataGrid
- Add new books via a modal dialog
- Edit existing books inline via a modal dialog
- Delete books with a confirmation prompt
- Snackbar notifications on successful deletion
- Login error feedback via Snackbar

## Project structure
```
src/
├── api/
│   └── bookapi.ts           # All Axios calls (getBooks, addBook, updateBook, deleteBook)
├── components/
│   ├── Login.tsx            # Login form, JWT handling, auth state
│   ├── Booklist.tsx         # DataGrid with edit/delete per row, logout button
│   ├── AddBook.tsx          # New book dialog + mutation
│   ├── EditBook.tsx         # Edit book dialog + mutation
│   └── BookDialogContent.tsx # Shared form fields used by Add and Edit
├── themes/
│   └── theme.tsx            # MUI theme factory (dark/light, blue/brown palette)
├── type.ts                  # TypeScript types: Book, BookResponse, BookEntry
├── App.tsx                  # Root component — ThemeProvider, QueryClient, Login
└── main.tsx                 # Entry point
```

## Running locally

**Prerequisites**
- Node.js ≥ 18
- The backend running locally or deployed (see backend repo)

**1. Clone the repo**
```bash
git clone https://github.com/csantomauro/bookshelf-frontend.git
cd bookshelf-frontend
npm install
```

**2. Create a `.env` file**
```
VITE_API_URL=http://localhost:8080
```

For the deployed backend use:
```
VITE_API_URL=https://book-shelf-2pql.onrender.com
```

**3. Start the dev server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Authentication flow

1. User submits credentials via the login form
2. `POST /login` is called — the backend returns a JWT in the `Authorization` response header
3. The token is stored in `sessionStorage` under the key `jwt`
4. All subsequent API calls attach the token via the `Authorization` request header
5. Logout clears the token from sessionStorage and returns to the login view

## Environment variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the BookShelf backend API |

## Deployment

Deployed on Vercel. The `VITE_API_URL` environment variable is set in the Vercel dashboard pointing to the Render backend. Vercel auto-deploys on every push to `main`.
