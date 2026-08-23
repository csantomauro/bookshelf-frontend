import { describe, test, expect, vi, afterEach } from 'vitest';
import axios from 'axios';
import { followUser, getProfile, getReviewsByUser, getShelfByUser, unfollowUser } from './userapi';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

describe("userapi tests", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test("getProfile returns the profile", async () => {
    mockedAxios.get.mockResolvedValue({ data: { username: 'alice', followerCount: 2, followingCount: 1, followedByMe: true } });

    const profile = await getProfile('alice');

    expect(profile.username).toBe('alice');
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/alice'),
      expect.anything()
    );
  });

  test("followUser calls the follow endpoint", async () => {
    mockedAxios.put.mockResolvedValue({});

    await followUser('alice');

    expect(mockedAxios.put).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/alice/follow'),
      undefined,
      expect.anything()
    );
  });

  test("unfollowUser calls the delete endpoint", async () => {
    mockedAxios.delete.mockResolvedValue({});

    await unfollowUser('alice');

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/alice/follow'),
      expect.anything()
    );
  });

  test("getReviewsByUser fetches the user's reviews", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    await getReviewsByUser('alice');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/alice/reviews'),
      expect.anything()
    );
  });

  test("getShelfByUser passes the status filter as a query param", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    await getShelfByUser('alice', 'READ');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/alice/shelf'),
      expect.objectContaining({ params: { status: 'READ' } })
    );
  });
});
