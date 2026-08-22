import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import Booklist from './Booklist';

const mockBook = {
  title: 'Ford',
  genre: 'Fiction',
  isbn: '123',
  publisher: 'Test',
  publicationYear: 2020,
  price: 10,
  _links: {
    self: { href: 'http://localhost:8080/api/books/1' },
    book: { href: 'http://localhost:8080/api/books/1' },
    author: { href: 'http://localhost:8080/api/authors/1' },
  },
};

const { getBooks } = vi.hoisted(() => ({ getBooks: vi.fn() }));

vi.mock('../api/bookapi', () => ({
  getBooks,
  addBook: vi.fn(),
  updateBook: vi.fn(),
  deleteBook: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({children } : { children: React.ReactNode }) => (
    <QueryClientProvider client = {
      queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>);

describe("Booklist tests", () => {
  beforeEach(() => {
    sessionStorage.setItem("jwt", "test-token");
    sessionStorage.setItem("role", "ADMIN");
    queryClient.clear();
    getBooks.mockReset();
    getBooks.mockResolvedValue([mockBook]);
  });

  test("component renders", () => {
    render(<Booklist />, { wrapper });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  })

  test("Book are fetched", async () => {
    render(<Booklist />, { wrapper });
    await waitFor(() => screen.getByText(/New Book/i));
    expect(screen.getByText(/Ford/i)).toBeInTheDocument();
  })

  test("shows a placeholder when a book has no cover, an image when it does", async () => {
    getBooks.mockResolvedValue([mockBook, { ...mockBook, title: 'Zed', coverUrl: 'https://covers/zed.jpg', _links: { self: { href: 'http://localhost:8080/api/books/2' }, book: { href: 'http://localhost:8080/api/books/2' }, author: { href: 'http://localhost:8080/api/authors/1' } } }]);
    render(<Booklist />, { wrapper });
    await waitFor(() => screen.getByText(/Ford/i));

    expect(screen.getByRole('img', { name: /cover of zed/i })).toHaveAttribute('src', 'https://covers/zed.jpg');
    expect(screen.queryByRole('img', { name: /cover of ford/i })).not.toBeInTheDocument();
  })

  test("Open new book modal", async () => {
    render(<Booklist />, { wrapper });
    await waitFor(() => screen.getByText(/New Book/i));
    await userEvent.click(screen.getByText(/New Book/i));
    expect(screen.getByText(/Save/i)).toBeInTheDocument();
  })

  test("Hides write actions for non-admin users", async () => {
    sessionStorage.setItem("role", "USER");
    render(<Booklist />, { wrapper });
    await waitFor(() => screen.getByText(/Ford/i));
    expect(screen.queryByText(/New Book/i)).not.toBeInTheDocument();
  });

  test("shows a real failure once the fetch has actually stopped retrying", async () => {
    getBooks.mockRejectedValue(new Error("network error"));
    render(<Booklist />, { wrapper });
    await waitFor(() => screen.getByText(/Failed to load books/i));
  });

  test("does not flash 'failed' while a background refetch after an earlier error is still in flight", async () => {
    getBooks.mockRejectedValueOnce(new Error("cold start"));
    render(<Booklist />, { wrapper });
    await waitFor(() => screen.getByText(/Failed to load books/i));

    let resolveRetry!: (books: (typeof mockBook)[]) => void;
    getBooks.mockReturnValueOnce(new Promise((resolve) => { resolveRetry = resolve; }));
    queryClient.refetchQueries({ queryKey: ['books'] });

    await waitFor(() => expect(screen.queryByText(/Failed to load books/i)).not.toBeInTheDocument());
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    resolveRetry([mockBook]);
    await waitFor(() => screen.getByText(/Ford/i));
  });
});
