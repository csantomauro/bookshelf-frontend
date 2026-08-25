import axios from "axios";
import type { SearchResponse } from "../type";
import { getAxiosConfig } from "./httpConfig";

export const search = async (q: string): Promise<SearchResponse> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/search`, {
    ...getAxiosConfig(),
    params: { q },
  });
  return response.data;
}
