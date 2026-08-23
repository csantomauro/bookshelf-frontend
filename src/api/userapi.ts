import axios from "axios";
import type { ReadingStatus, Review, ShelfEntry, UserProfile } from "../type";
import { getAxiosConfig } from "./httpConfig";

const userUrl = (username: string) => `${import.meta.env.VITE_API_URL}/api/users/${username}`;

export const getProfile = async (username: string): Promise<UserProfile> => {
  const response = await axios.get(userUrl(username), getAxiosConfig());
  return response.data;
}

export const followUser = async (username: string): Promise<void> => {
  await axios.put(`${userUrl(username)}/follow`, undefined, getAxiosConfig());
}

export const unfollowUser = async (username: string): Promise<void> => {
  await axios.delete(`${userUrl(username)}/follow`, getAxiosConfig());
}

export const getReviewsByUser = async (username: string): Promise<Review[]> => {
  const response = await axios.get(`${userUrl(username)}/reviews`, getAxiosConfig());
  return response.data;
}

export const getShelfByUser = async (username: string, status?: ReadingStatus): Promise<ShelfEntry[]> => {
  const response = await axios.get(`${userUrl(username)}/shelf`, {
    ...getAxiosConfig(),
    params: status ? { status } : undefined,
  });
  return response.data;
}
