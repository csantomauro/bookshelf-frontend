import axios from "axios";
import type { ReadingStatus, ShelfEntry } from "../type";
import { getAxiosConfig } from "./httpConfig";

const shelfUrl = (bookId: string) => `${import.meta.env.VITE_API_URL}/api/books/${bookId}/shelf`;

export const getMyShelfEntry = async (bookId: string): Promise<ShelfEntry | null> => {
  try {
    const response = await axios.get(`${shelfUrl(bookId)}/me`, getAxiosConfig());
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export const upsertMyShelfEntry = async (bookId: string, status: ReadingStatus): Promise<ShelfEntry> => {
  const response = await axios.put(`${shelfUrl(bookId)}/me`, { status }, getAxiosConfig());
  return response.data;
}

export const deleteMyShelfEntry = async (bookId: string): Promise<void> => {
  await axios.delete(`${shelfUrl(bookId)}/me`, getAxiosConfig());
}

export const getMyShelf = async (status?: ReadingStatus): Promise<ShelfEntry[]> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/shelf/me`, {
    ...getAxiosConfig(),
    params: status ? { status } : undefined,
  });
  return response.data;
}
