import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import MyShelf from './MyShelf';

const mockEntries = [
  { id: 1, bookId: 42, bookTitle: 'Dune', bookCoverUrl: null, status: 'READING', addedAt: '2026-01-01T00:00:00Z' },
  { id: 2, bookId: 43, bookTitle: '1984', bookCoverUrl: null, status: 'READ', addedAt: '2026-01-02T00:00:00Z' },
];

const { getMyShelf, deleteMyShelfEntry } = vi.hoisted(() => ({
  getMyShelf: vi.fn(),
  deleteMyShelfEntry: vi.fn(),
}));

vi.mock('../api/shelfapi', () => ({ getMyShelf, deleteMyShelfEntry }));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe("MyShelf tests", () => {
  beforeEach(() => {
    sessionStorage.clear();
    queryClient.clear();
    getMyShelf.mockReset();
    getMyShelf.mockResolvedValue(mockEntries);
    deleteMyShelfEntry.mockReset();
    deleteMyShelfEntry.mockResolvedValue(undefined);
  });

  test("shows a login prompt for guests, never calling the API", async () => {
    render(<MyShelf />, { wrapper });

    expect(screen.getByText(/Log in to see your shelf/i)).toBeInTheDocument();
    expect(getMyShelf).not.toHaveBeenCalled();
  });

  test("shows the authenticated user's shelf entries", async () => {
    sessionStorage.setItem('jwt', 'test-token');

    render(<MyShelf />, { wrapper });

    await waitFor(() => screen.getByText('Dune'));
    expect(screen.getByText('1984')).toBeInTheDocument();
  });

  test("removing an entry calls deleteMyShelfEntry with the book id", async () => {
    sessionStorage.setItem('jwt', 'test-token');

    render(<MyShelf />, { wrapper });
    await waitFor(() => screen.getByText('Dune'));

    const removeButtons = screen.getAllByLabelText('remove from shelf');
    await userEvent.click(removeButtons[0]);

    expect(deleteMyShelfEntry).toHaveBeenCalledWith('42');
  });
});
