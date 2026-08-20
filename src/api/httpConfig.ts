import type { AxiosRequestConfig } from "axios";

// No Content-Type here: axios sets it automatically for requests that
// actually have a JSON body (POST/PUT). Setting it unconditionally — even
// on bodyless GETs — turns an otherwise "simple" CORS request into one
// that needs a preflight, which guest (no-Authorization) reads don't
// need at all.
export const getAxiosConfig = (): AxiosRequestConfig => {
  const token = sessionStorage.getItem("jwt");
  return {
    headers: {
      ...(token ? { 'Authorization': token } : {}),
    },
  };
};
