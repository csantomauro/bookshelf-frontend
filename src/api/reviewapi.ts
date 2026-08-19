import axios from "axios";
import type { BookResponse, Review, ReviewRequest } from "../type";
import { getAxiosConfig } from "./httpConfig";

const reviewsUrl = (bookId: string) => `${import.meta.env.VITE_API_URL}/api/books/${bookId}/reviews`;

export const getBook = async (bookId: string): Promise<BookResponse> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/books/${bookId}`, getAxiosConfig());
  return response.data;
}

export const getReviews = async (bookId: string): Promise<Review[]> => {
  const response = await axios.get(reviewsUrl(bookId), getAxiosConfig());
  return response.data;
}

export const getMyReview = async (bookId: string): Promise<Review | null> => {
  try {
    const response = await axios.get(`${reviewsUrl(bookId)}/me`, getAxiosConfig());
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export const upsertMyReview = async (bookId: string, review: ReviewRequest): Promise<Review> => {
  const response = await axios.put(`${reviewsUrl(bookId)}/me`, review, getAxiosConfig());
  return response.data;
}

export const deleteMyReview = async (bookId: string): Promise<void> => {
  await axios.delete(`${reviewsUrl(bookId)}/me`, getAxiosConfig());
}
