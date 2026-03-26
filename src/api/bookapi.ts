import axios, { type AxiosRequestConfig } from "axios";
import type { Book, BookEntry, BookResponse } from "../type";

const getAxiosConfig = (): AxiosRequestConfig => {
    const token = sessionStorage.getItem("jwt");
    return {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    };
  };
  
  export const getBooks = async (): Promise<BookResponse[]> => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/books`, getAxiosConfig());
    return response.data._embedded.books;
  }
  
  export const deleteBook = async (link: string): Promise<BookResponse> => {
    const response = await axios.delete(link, getAxiosConfig());
    return response.data
  }
  
  export const addBook = async (book: Book): Promise<BookResponse> => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/books`, book, getAxiosConfig());
    return response.data;
  }
  
  export const updateBook = async (bookEntry: BookEntry): Promise<BookResponse> => {
    const response = await axios.put(bookEntry.url, bookEntry.book, getAxiosConfig());
    return response.data;
  }