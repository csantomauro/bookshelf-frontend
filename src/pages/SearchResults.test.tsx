import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import SearchResults from './SearchResults';

const mockResults = {
  books: [{ id: 1, title: 'Dune', authorName: 'Frank Herbert', coverUrl: null }],
  users: [{ username: 'alice' }],
};

const { search } = vi.hoisted(() => ({ search: vi.fn() }));
vi.mock('../api/searchapi', () => ({ search }));

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/search']}>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe("SearchResults tests", () => {
  beforeEach(() => {
    queryClient.clear();
    search.mockReset();
    search.mockResolvedValue(mockResults);
    navigateMock.mockReset();
  });

  test("shows a hint and never calls the API before the minimum query length", async () => {
    render(<SearchResults />, { wrapper });

    expect(screen.getByText(/Type at least 2 characters/i)).toBeInTheDocument();

    const input = screen.getByLabelText(/Search books or users/i);
    fireEvent.change(input, { target: { value: 'd' } });

    // Give the debounce timer a chance to fire; still below the minimum.
    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(search).not.toHaveBeenCalled();
  });

  test("does not search immediately after typing, only after the debounce delay", () => {
    render(<SearchResults />, { wrapper });

    const input = screen.getByLabelText(/Search books or users/i);
    fireEvent.change(input, { target: { value: 'dune' } });

    expect(search).not.toHaveBeenCalled();
  });

  test("searches after the debounce delay and renders book and user results", async () => {
    render(<SearchResults />, { wrapper });

    const input = screen.getByLabelText(/Search books or users/i);
    fireEvent.change(input, { target: { value: 'dune' } });

    await waitFor(() => expect(search).toHaveBeenCalledWith('dune'), { timeout: 2000 });
    await waitFor(() => screen.getByText('Dune'), { timeout: 2000 });

    expect(screen.getByText('Frank Herbert')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
  });

  test("shows a no-results message when nothing matches", async () => {
    search.mockResolvedValue({ books: [], users: [] });

    render(<SearchResults />, { wrapper });
    const input = screen.getByLabelText(/Search books or users/i);
    fireEvent.change(input, { target: { value: 'zzznomatch' } });

    await waitFor(() => screen.getByText(/No matches for/i), { timeout: 2000 });
  });

  test("clicking a book result navigates to the book detail page", async () => {
    render(<SearchResults />, { wrapper });
    const input = screen.getByLabelText(/Search books or users/i);
    fireEvent.change(input, { target: { value: 'dune' } });

    await waitFor(() => screen.getByText('Dune'), { timeout: 2000 });
    await userEvent.click(screen.getByText('Dune'));

    expect(navigateMock).toHaveBeenCalledWith('/books/1');
  });

  test("clicking a user result navigates to their profile", async () => {
    render(<SearchResults />, { wrapper });
    const input = screen.getByLabelText(/Search books or users/i);
    fireEvent.change(input, { target: { value: 'dune' } });

    await waitFor(() => screen.getByText('alice'), { timeout: 2000 });
    await userEvent.click(screen.getByText('alice'));

    expect(navigateMock).toHaveBeenCalledWith('/users/alice');
  });
});
