import { describe, test, expect, vi, afterEach } from 'vitest';
import axios from 'axios';
import { deleteMyShelfEntry, getMyShelf, getMyShelfEntry, upsertMyShelfEntry } from './shelfapi';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

describe("shelfapi tests", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test("getMyShelfEntry returns the entry on success", async () => {
    mockedAxios.get.mockResolvedValue({ data: { id: 1, bookId: 42, bookTitle: 'Dune', bookCoverUrl: null, status: 'READING', addedAt: '2026-01-01T00:00:00Z' } });

    const entry = await getMyShelfEntry('42');

    expect(entry?.status).toBe('READING');
  });

  test("getMyShelfEntry returns null on 404", async () => {
    vi.mocked(axios.isAxiosError).mockReturnValue(true);
    mockedAxios.get.mockRejectedValue({ response: { status: 404 } });

    const entry = await getMyShelfEntry('42');

    expect(entry).toBeNull();
  });

  test("upsertMyShelfEntry sends the status in the body", async () => {
    mockedAxios.put.mockResolvedValue({ data: { id: 1, bookId: 42, bookTitle: 'Dune', bookCoverUrl: null, status: 'READ', addedAt: '2026-01-01T00:00:00Z' } });

    await upsertMyShelfEntry('42', 'READ');

    expect(mockedAxios.put).toHaveBeenCalledWith(
      expect.stringContaining('/api/books/42/shelf/me'),
      { status: 'READ' },
      expect.anything()
    );
  });

  test("deleteMyShelfEntry calls the delete endpoint", async () => {
    mockedAxios.delete.mockResolvedValue({});

    await deleteMyShelfEntry('42');

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/api/books/42/shelf/me'),
      expect.anything()
    );
  });

  test("getMyShelf passes the status filter as a query param", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    await getMyShelf('READ');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/shelf/me'),
      expect.objectContaining({ params: { status: 'READ' } })
    );
  });
});
