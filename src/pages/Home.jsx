import { useEffect, Fragment } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import style from "./Home.module.css";
import useLocalStorage from "../hooks/useLocalStorage";
import {
  AUTHORIZATION_URL,
  ACCESS_TOKEN_KEY,
  EXPIRES_IN_KEY,
  REFRESH_TOKEN_KEY,
  ZOOM_NAME_KEY,
  ZOOM_ID_KEY,
  ZOOM_ACCOUNT_ID_KEY,
  EVENTS_KEY,
} from "../config/constant";
import { getAccessToken, getCurrentUser, listen } from "../networks/backend";

dayjs.extend(relativeTime);

function getAction(action) {
  return action.replace(/_/g, " ");
}

function getObject(resource) {
  return resource.replace(/_/g, " ");
}

function getMailToURL(email) {
  return "mailto:" + email;
}

function getRelativeDate(timestamp) {
  return dayjs(timestamp).fromNow();
}

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
  const [events, setEvents] = useLocalStorage(EVENTS_KEY, []);
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

  // Setup event listener
  useEffect(() => {
    const event = listen();
    event.onmessage = onMessage;

    return event.close;
  }, []);

  function onMessage(e) {
    const { event, event_ts: timestamp, payload } = JSON.parse(e.data);
    const [resource, action] = event.split(".");

    setEvents([
      ...events,
      {
        object: getObject(resource),
        action: getAction(action),
        actor: payload.operator,
        timestamp,
      },
    ]);
  }

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

        <ul>
          {events.map(({ actor, action, object, timestamp }, index) => (
            <li key={index}>
              <div className={style.timelineContainer}>
                <div className={style.timelineContent}>
                  <a href={getMailToURL(actor)}>{actor}</a> <b>{action}</b>{" "}
                  <span>{object}</span>
                </div>
                <div className={style.timelineDate}>
                  {getRelativeDate(timestamp)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>

      <footer>
        <p>© 2021 Fikri Rahmat Nurhidayat</p>
      </footer>
    </Fragment>
  );
}
