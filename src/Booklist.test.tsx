import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import Booklist from './components/Booklist';

vi.mock('./api/bookapi', () => ({
  getBooks: vi.fn().mockResolvedValue([
    {
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
    },
  ]),
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
  });

  test("component renders", () => {
    render(<Booklist />, { wrapper });
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  })

  test("Book are fetched", async () => {
    render(<Booklist />, { wrapper });
    await waitFor(() => screen.getByText(/New Book/i));
    expect(screen.getByText(/Ford/i)).toBeInTheDocument();
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
});
