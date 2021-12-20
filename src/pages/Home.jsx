import { useEffect, Fragment } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AUTHORIZATION_URL,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
} from "../config/constant";
import { getAccessToken } from "../networks/zoom";

export default function App() {
  const [query] = useSearchParams();
  const code = query.get("code");

  useEffect(async () => {
    if (!code) return;

    const response = await getAccessToken(code);
    console.log(response);
    console.log(code);
  }, [code]);

  return (
    <Fragment>
      <header>
        <h1>Zoom Relay</h1>
        <p>Just relaying your zoom meeting to this website.</p>
      </header>
      <main>
        <p>
          In order to make this work, you need to login and connect your Zoom
          account to this website.
        </p>

        <nav>
          <a href={AUTHORIZATION_URL}>Login to Zoom</a>
        </nav>
      </main>

      <footer>
        <p>© 2021 Fikri Rahmat Nurhidayat</p>
      </footer>
    </Fragment>
  );
}
