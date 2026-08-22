import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import BookDetail from './BookDetail';

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

const mockReviews = [
  { id: 1, username: 'alice', rating: 5, text: 'Loved it', createdAt: '2026-01-01T00:00:00Z', updatedAt: null },
  { id: 2, username: 'bob', rating: 3, text: null, createdAt: '2026-01-02T00:00:00Z', updatedAt: null },
];

const { getBook, getReviews, getMyReview, upsertMyReview, deleteMyReview } = vi.hoisted(() => ({
  getBook: vi.fn(),
  getReviews: vi.fn(),
  getMyReview: vi.fn(),
  upsertMyReview: vi.fn(),
  deleteMyReview: vi.fn(),
}));

vi.mock('../api/reviewapi', () => ({ getBook, getReviews, getMyReview, upsertMyReview, deleteMyReview }));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/books/42']}>
      <Routes>
        <Route path="/books/:id" element={children} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>
);

describe("BookDetail tests", () => {
  beforeEach(() => {
    sessionStorage.clear();
    queryClient.clear();
    getBook.mockResolvedValue(mockBook);
    getReviews.mockResolvedValue(mockReviews);
    getMyReview.mockResolvedValue(null);
    upsertMyReview.mockResolvedValue({ id: 3, username: 'me', rating: 4, text: 'Nice', createdAt: '2026-01-03T00:00:00Z', updatedAt: null });
    deleteMyReview.mockResolvedValue(undefined);
  });

  test("renders book title, reviews, computed average rating and review dates", async () => {
    render(<BookDetail />, { wrapper });

    await waitFor(() => screen.getByText('Dune'));

    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('Loved it')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(screen.getByText('4.0 (2)')).toBeInTheDocument();
    expect(screen.getByText(new Date(mockReviews[1].createdAt).toLocaleDateString())).toBeInTheDocument();
  });

  test("shows a placeholder when the book has no cover", async () => {
    render(<BookDetail />, { wrapper });
    await waitFor(() => screen.getByText('Dune'));

    expect(screen.queryByRole('img', { name: /cover of dune/i })).not.toBeInTheDocument();
  });

  test("shows the cover image when the book has one", async () => {
    getBook.mockResolvedValue({ ...mockBook, coverUrl: 'https://covers/dune.jpg' });

    render(<BookDetail />, { wrapper });
    await waitFor(() => screen.getByText('Dune'));

    expect(screen.getByRole('img', { name: /cover of dune/i })).toHaveAttribute('src', 'https://covers/dune.jpg');
  });

  test("hides the logged-in user's own review from the public list, but keeps it in the average", async () => {
    sessionStorage.setItem('username', 'alice');

    render(<BookDetail />, { wrapper });
    await waitFor(() => screen.getByText('Dune'));

    expect(screen.queryByText('Loved it')).not.toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(screen.getByText('4.0 (2)')).toBeInTheDocument();
  });

  test("hides the write-review form for guests and shows a login prompt instead", async () => {
    render(<BookDetail />, { wrapper });
    await waitFor(() => screen.getByText('Dune'));

    expect(screen.getByText(/Log in to write a review/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Your thoughts/i)).not.toBeInTheDocument();
    expect(getMyReview).not.toHaveBeenCalled();
  });

  test("submitting the review form calls upsertMyReview with the form payload", async () => {
    sessionStorage.setItem('jwt', 'test-token');

    const { container } = render(<BookDetail />, { wrapper });
    await waitFor(() => screen.getByText('Dune'));

    const fourStars = container.querySelector('input[name="my-rating"][value="4"]');
    expect(fourStars).not.toBeNull();
    // MUI Rating's radio inputs are visually hidden; userEvent's pointer-events
    // visibility check can't "see" them, so we dispatch the click directly.
    fireEvent.click(fourStars as Element);

    const textarea = screen.getByLabelText(/Your thoughts/i);
    await userEvent.type(textarea, 'Nice');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await waitFor(() => expect(saveButton).toBeEnabled());
    await userEvent.click(saveButton);

    await waitFor(() => expect(upsertMyReview).toHaveBeenCalledWith('42', { rating: 4, text: 'Nice' }));
  });

  test("shows delete button and calls deleteMyReview when a review already exists", async () => {
    sessionStorage.setItem('jwt', 'test-token');
    getMyReview.mockResolvedValue({ id: 9, username: 'me', rating: 5, text: 'Great', createdAt: '2026-01-01T00:00:00Z', updatedAt: null });

    render(<BookDetail />, { wrapper });
    await waitFor(() => screen.getByRole('button', { name: /delete/i }));

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => expect(deleteMyReview).toHaveBeenCalledWith('42'));
  });
});
