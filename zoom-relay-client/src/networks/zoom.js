import {
  AUTHENTICATE_URL,
  AUTHENTICATE_GRANT_TYPE,
  AUTHORIZATION_URL,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
} from "../config/constant";

export function getAccessToken(code) {
  const payload = `${OAUTH_CLIENT_ID}:${OAUTH_CLIENT_SECRET}`;
  const token = btoa(payload);

  const body = new URLSearchParams();

  body.set("code", code);
  body.set("grant_type", AUTHENTICATE_GRANT_TYPE);
  body.set("redirect_uri", AUTHORIZATION_URL);

  return fetch(AUTHENTICATE_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${token}`,
    },
    body: body.toString(),
  });
}
