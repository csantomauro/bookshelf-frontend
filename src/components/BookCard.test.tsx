import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BookCard from './BookCard';

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

const mockBook = {
  title: 'Dune',
  genre: 'Sci-Fi',
  isbn: '999',
  publisher: 'Chilton',
  publicationYear: 1965,
  price: 15,
  _links: {
    self: { href: 'http://localhost:8080/api/books/42' },
    book: { href: 'http://localhost:8080/api/books/42' },
    author: { href: 'http://localhost:8080/api/authors/1' },
  },
};

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

describe("BookCard tests", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  test("shows the book details on the back face", () => {
    render(<BookCard book={mockBook} admin={false} onDelete={vi.fn()} onForbidden={vi.fn()} />, { wrapper });

    expect(screen.getByText('Dune')).toBeInTheDocument();
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument();
    expect(screen.getByText('ISBN 999')).toBeInTheDocument();
  });

  test("clicking the card navigates to the book detail page", async () => {
    render(<BookCard book={mockBook} admin={false} onDelete={vi.fn()} onForbidden={vi.fn()} />, { wrapper });

    await userEvent.click(screen.getByRole('button', { name: /open dune/i }));

    expect(navigateMock).toHaveBeenCalledWith('/books/42');
  });

  test("hides admin actions for non-admins, shows them for admins", () => {
    const { rerender } = render(
      <BookCard book={mockBook} admin={false} onDelete={vi.fn()} onForbidden={vi.fn()} />,
      { wrapper }
    );
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();

    rerender(<BookCard book={mockBook} admin={true} onDelete={vi.fn()} onForbidden={vi.fn()} />);
    expect(screen.getByLabelText('edit')).toBeInTheDocument();
  });

  test("clicking delete does not also navigate", async () => {
    const onDelete = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<BookCard book={mockBook} admin={true} onDelete={onDelete} onForbidden={vi.fn()} />, { wrapper });

    await userEvent.click(screen.getByLabelText('delete'));

    expect(onDelete).toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();

    vi.restoreAllMocks();
  });
});
