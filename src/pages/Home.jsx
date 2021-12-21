import { useEffect, Fragment } from "react";
import { useSearchParams } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import {
  AUTHORIZATION_URL,
  ACCESS_TOKEN_KEY,
  EXPIRES_IN_KEY,
  REFRESH_TOKEN_KEY,
  ZOOM_NAME_KEY,
  ZOOM_ID_KEY,
  ZOOM_ACCOUNT_ID_KEY,
} from "../config/constant";
import { getAccessToken, getCurrentUser } from "../networks/backend";

export default function App() {
  const [token, setToken] = useLocalStorage(ACCESS_TOKEN_KEY, null);
  const [_refreshToken, setRefreshToken] = useLocalStorage(
    REFRESH_TOKEN_KEY,
    null
  );
  const [_expiresIn, setExpiresIn] = useLocalStorage(EXPIRES_IN_KEY, null);
  const [zoomName, setZoomName] = useLocalStorage(ZOOM_NAME_KEY, null);
  const [zoomId, setZoomId] = useLocalStorage(ZOOM_ID_KEY, null);
  const [zoomAccountId, setZoomAccountId] = useLocalStorage(
    ZOOM_ACCOUNT_ID_KEY,
    null
  );
  const [query] = useSearchParams(location.search);

  // Set token
  useEffect(async () => {
    const code = query.get("code");

    if (!!token) return;
    if (!code) return;

    try {
      const response = await getAccessToken(code);
      const body = response.data;

      setToken(body.access_token);
      setRefreshToken(body.refresh_token);
      setExpiresIn(body.expires_in);
    } catch (err) {
      console.log(err.response.data);
    }
  }, []);

  // Set current user
  useEffect(async () => {
    try {
      const response = await getCurrentUser();
      const body = response.data;

      setZoomId(body.id || null);
      setZoomAccountId(body.account_id || null);
      setZoomName(body.first_name || null);
    } catch (err) {
      console.error(err.response.data.message);
    }
  }, [token]);

  return (
    <Fragment>
      <header>
        <h1>Zoom Relay</h1>
        <p>Just relaying your zoom meeting to this website.</p>
      </header>
      <main>
        {!zoomName ? (
          <Fragment>
            <p>
              In order to make this work, you need to login and connect your
              Zoom account to this website.
            </p>

            <nav>
              <a href={AUTHORIZATION_URL}>Login to Zoom</a>
            </nav>
          </Fragment>
        ) : (
          <Fragment>
            <p>Let's see what we can do here, {zoomName}!</p>
          </Fragment>
        )}
      </main>

      <footer>
        <p>© 2021 Fikri Rahmat Nurhidayat</p>
      </footer>
    </Fragment>
  );
}
