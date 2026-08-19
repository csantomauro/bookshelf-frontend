import type { AxiosRequestConfig } from "axios";

export const getAxiosConfig = (): AxiosRequestConfig => {
  const token = sessionStorage.getItem("jwt");
  return {
    headers: {
      ...(token ? { 'Authorization': token } : {}),
      'Content-Type': 'application/json',
    },
  };
};
