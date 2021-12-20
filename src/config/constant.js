export const OAUTH_CLIENT_SECRET = import.meta.env.OAUTH_CLIENT_SECRET;
export const OAUTH_CLIENT_ID = import.meta.env.OAUTH_CLIENT_ID;
export const OAUTH_REDIRECT_URL =
  import.meta.env.OAUTH_REDIRECT_URL || "https://zoom-relay.herokuapp.com";
export const AUTHORIZATION_URL =
  "https://zoom.us/oauth/authorize" +
  `?client_id=${OAUTH_CLIENT_ID}` +
  "&response_type=code" +
  `&redirect_uri=${OAUTH_REDIRECT_URL}`;
export const AUTHENTICATE_URL = "https://zoom.us/oauth/token";
export const AUTHENTICATE_GRANT_TYPE = "authorization_code";
