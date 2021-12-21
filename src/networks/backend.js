import { get, post } from "axios";
import { API_HOST, ACCESS_TOKEN_KEY } from "../config/constant";

export const API_OAUTH_TOKEN_URL = "/api/v1/zoom/auth/token";
export const API_GET_ZOOM_USER_URL = "/api/v1/zoom/users/me";

export function getAccessToken(code) {
  return post(API_HOST + API_OAUTH_TOKEN_URL, { code: code });
}

export function getCurrentUser() {
  return get(API_HOST + API_GET_ZOOM_USER_URL, {
    headers: {
      Authorization: `Bearer ${JSON.parse(
        localStorage.getItem(ACCESS_TOKEN_KEY)
      )}`,
    },
  });
}
