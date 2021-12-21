// OAuth related
export const OAUTH_CLIENT_SECRET = import.meta.env.VITE_APP_OAUTH_CLIENT_SECRET;
export const OAUTH_CLIENT_ID = import.meta.env.VITE_APP_OAUTH_CLIENT_ID;
export const OAUTH_REDIRECT_URL =
  import.meta.env.VITE_APP_OAUTH_REDIRECT_URL ||
  "https://zoom-relay.herokuapp.com";
export const AUTHORIZATION_URL =
  "https://zoom.us/oauth/authorize" +
  `?client_id=${OAUTH_CLIENT_ID}` +
  "&response_type=code" +
  `&redirect_uri=${OAUTH_REDIRECT_URL}`;
export const AUTHENTICATE_URL = "https://zoom.us/oauth/token";
export const AUTHENTICATE_GRANT_TYPE = "authorization_code";

// API Configuration
export const API_HOST =
  import.meta.env.VITE_APP_API_HOST || "http://localhost:8000";

// Local storage keys
export const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
export const REFRESH_TOKEN_KEY = "REFRESH_TOKEN";
export const EXPIRES_IN_KEY = "EXPIRES_IN";
export const EVENTS_KEY = "EVENTS";
export const ZOOM_NAME_KEY = "ZOOM_NAME";
export const ZOOM_ID_KEY = "ZOOM_ID";
export const ZOOM_ACCOUNT_ID_KEY = "ZOOM_ACCOUNT_ID";

// Event URLs
export const ZOOM_EVENT_STREAM_URL = "/api/v1/events/watch";
