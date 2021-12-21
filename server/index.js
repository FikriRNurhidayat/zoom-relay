const express = require("express");
const morgan = require("morgan");
const path = require("path");
const axios = require("axios");
const cors = require("cors");

// Get port from environment variable
const {
  PORT = 8000,
  ZOOM_AUTHENTICATION_URL = "https://zoom.us/oauth/token",
  ZOOM_GET_USER_URL = "https://api.zoom.us/v2/users/me",
  NODE_ENV = "development",
  VITE_APP_OAUTH_CLIENT_ID: ZOOM_OAUTH_CLIENT_ID,
  VITE_APP_OAUTH_CLIENT_SECRET: ZOOM_OAUTH_CLIENT_SECRET,
  VITE_APP_OAUTH_REDIRECT_URL: ZOOM_OAUTH_REDIRECT_URL,
} = process.env;
const ZOOM_AUTHENTICATION_GRANT_TYPE = "authorization_code";
const ZOOM_AUTHORIZATION_TOKEN_PAYLOAD = `${ZOOM_OAUTH_CLIENT_ID}:${ZOOM_OAUTH_CLIENT_SECRET}`;
const ZOOM_AUTHORIZATION_TOKEN_BUFFER = Buffer.from(
  ZOOM_AUTHORIZATION_TOKEN_PAYLOAD
);
const ZOOM_AUTHORIZATION_TOKEN =
  ZOOM_AUTHORIZATION_TOKEN_BUFFER.toString("base64");
const PUBLIC_DIRECTORY = path.resolve(__dirname, "public");

// Initialize express application
const app = express();

// Allow cors for local development
if (NODE_ENV === "development") app.use(cors());

// Serve static directory
app.use(express.static(PUBLIC_DIRECTORY));

// Use Logger
app.use(morgan("tiny"));

// Use JSON Parser
app.use(express.json());

// POST /api/v1/events
// Receive event from the webhook
app.post("/api/v1/events", (req, res) => {
  console.log("Request Header:", req.headers);
  console.log("Request Body:", req.body);

  res.status(204).end();
});

// POST /api/v1/zoom/oauth/token
// See more: https://marketplace.zoom.us/docs/guides/auth/oauth
app.post("/api/v1/zoom/auth/token", (req, res) => {
  const body = new URLSearchParams();

  console.log("[DEBUG]:", ZOOM_OAUTH_CLIENT_ID);
  console.log("[DEBUG]:", ZOOM_OAUTH_CLIENT_SECRET);
  console.log("[DEBUG]:", ZOOM_AUTHORIZATION_TOKEN);

  body.append("code", req.body.code);
  body.set("grant_type", ZOOM_AUTHENTICATION_GRANT_TYPE);
  body.set("redirect_uri", ZOOM_OAUTH_REDIRECT_URL);

  axios
    .post(ZOOM_AUTHENTICATION_URL, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + ZOOM_AUTHORIZATION_TOKEN,
      },
    })
    .then((response) => {
      console.log("[INFO]:", "Token retrieved!");
      console.debug("[DEBUG]:", response.data);

      res.status(201).json(response.data);
    })
    .catch((err) => {
      console.error("[ERROR]:", err.message);
      console.debug("[DEBUG]:", err.response.status);
      console.debug("[DEBUG]:", err.response.data);
      console.debug("[DEBUG]:", err.stack);

      res.status(401).json(err.response.data);
    });
});

// GET /api/v1/zoom/users/me
// See more: https://marketplace.zoom.us/docs/guides/auth/oauth
app.get("/api/v1/zoom/users/me", (req, res) => {
  console.log(req.headers);

  axios
    .get(ZOOM_GET_USER_URL, {
      headers: {
        Authorization: req.headers.authorization,
      },
    })
    .then((response) => {
      console.log("[INFO]:", "User retrieved!");
      console.debug("[DEBUG]:", response.data);

      res.status(200).json(response.data);
    })
    .catch((err) => {
      console.error("[ERROR]:", err.message);
      console.debug("[DEBUG]:", err.response.status);
      console.debug("[DEBUG]:", err.response.data);
      console.debug("[DEBUG]:", err.stack);

      res.status(401).json(err.response.data);
    });
});

// Default handler
app.use((req, res) => res.redirect("/"));

// Exception handler
app.use((err, req, res, next) =>
  res.status(500).json({
    status: "ERROR",
    data: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
  })
);

app.listen(PORT, () => {
  console.log("Listening on http://localhost:" + PORT);
});
