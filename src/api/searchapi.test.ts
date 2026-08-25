import { describe, test, expect, vi, afterEach } from 'vitest';
import axios from 'axios';
import { search } from './searchapi';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

describe("searchapi tests", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test("search passes the query as a param and returns the combined results", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        books: [{ id: 1, title: 'Dune', authorName: 'Frank Herbert', coverUrl: null }],
        users: [{ username: 'alice' }],
      },
    });

    const results = await search('dune');

    expect(results.books).toHaveLength(1);
    expect(results.users).toHaveLength(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/search'),
      expect.objectContaining({ params: { q: 'dune' } })
    );
  });
});
