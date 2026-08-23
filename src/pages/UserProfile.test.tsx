import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import UserProfile from './UserProfile';

const mockProfile = { username: 'alice', followerCount: 3, followingCount: 1, followedByMe: false };
const mockReviews = [{ id: 1, username: 'alice', rating: 5, text: 'Loved it', createdAt: '2026-01-01T00:00:00Z', updatedAt: null }];
const mockShelf = [{ id: 1, bookId: 42, bookTitle: 'Dune', bookCoverUrl: null, status: 'READING', addedAt: '2026-01-01T00:00:00Z' }];

const { getProfile, followUser, unfollowUser, getReviewsByUser, getShelfByUser } = vi.hoisted(() => ({
  getProfile: vi.fn(),
  followUser: vi.fn(),
  unfollowUser: vi.fn(),
  getReviewsByUser: vi.fn(),
  getShelfByUser: vi.fn(),
}));

vi.mock('../api/userapi', () => ({ getProfile, followUser, unfollowUser, getReviewsByUser, getShelfByUser }));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/users/alice']}>
      <Routes>
        <Route path="/users/:username" element={children} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>
);

describe("UserProfile tests", () => {
  beforeEach(() => {
    sessionStorage.clear();
    queryClient.clear();
    getProfile.mockReset();
    followUser.mockReset();
    unfollowUser.mockReset();
    getReviewsByUser.mockReset();
    getShelfByUser.mockReset();

    getProfile.mockResolvedValue(mockProfile);
    followUser.mockResolvedValue(undefined);
    unfollowUser.mockResolvedValue(undefined);
    getReviewsByUser.mockResolvedValue(mockReviews);
    getShelfByUser.mockResolvedValue(mockShelf);
  });

  test("shows the profile's counts, reviews and shelf", async () => {
    render(<UserProfile />, { wrapper });

    await waitFor(() => screen.getByText('alice'));

    expect(screen.getByText('3', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Loved it')).toBeInTheDocument();
    expect(screen.getByText('Dune')).toBeInTheDocument();
  });

  test("guests see a login prompt instead of a follow button", async () => {
    render(<UserProfile />, { wrapper });
    await waitFor(() => screen.getByText('alice'));

    expect(screen.getByText(/Log in to follow/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /follow/i })).not.toBeInTheDocument();
  });

  test("an authenticated visitor can follow the profile", async () => {
    sessionStorage.setItem('jwt', 'test-token');
    sessionStorage.setItem('username', 'bob');

    render(<UserProfile />, { wrapper });
    await waitFor(() => screen.getByText('alice'));

    await userEvent.click(screen.getByRole('button', { name: 'Follow' }));

    expect(followUser).toHaveBeenCalledWith('alice');
  });

  test("an authenticated visitor already following can unfollow", async () => {
    sessionStorage.setItem('jwt', 'test-token');
    sessionStorage.setItem('username', 'bob');
    getProfile.mockResolvedValue({ ...mockProfile, followedByMe: true });

    render(<UserProfile />, { wrapper });
    await waitFor(() => screen.getByRole('button', { name: 'Unfollow' }));

    await userEvent.click(screen.getByRole('button', { name: 'Unfollow' }));

    expect(unfollowUser).toHaveBeenCalledWith('alice');
  });

  test("hides the follow button on your own profile", async () => {
    sessionStorage.setItem('jwt', 'test-token');
    sessionStorage.setItem('username', 'alice');

    render(<UserProfile />, { wrapper });
    await waitFor(() => screen.getByText('alice'));

    expect(screen.queryByRole('button', { name: /follow/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Log in to follow/i)).not.toBeInTheDocument();
  });
});
