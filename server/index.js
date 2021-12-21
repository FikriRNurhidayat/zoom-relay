const express = require("express");
const morgan = require("morgan");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
const EventEmitter = require("events");

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
const WEBHOOK_EVENT_NAME = "webhook.received";

// Initialize express application
const app = express();
const event = new EventEmitter();

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
  console.log("[DEBUG]:", req.headers);
  console.log("[DEBUG]:", req.body);

  const eventName = createEventName(
    WEBHOOK_EVENT_NAME,
    req.body?.payload?.account_id
  );
  event.emit(eventName, req.body);
  res.status(204).end();
});

// GET /api/v1/events/watch
// Subscribe to zoom events
app.get("/api/v1/events/watch", authorize, (req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  const eventName = createEventName(WEBHOOK_EVENT_NAME, req.user.account_id);

  event.on(eventName, (e) => {
    console.log("[DEBUG]:", `${e.event} received!`);
    res.write(`data: ${JSON.stringify(e)}\n\n`);
  });

  // Stop sending event on connection closed
  res.on("close", () => {
    event.removeAllListeners(eventName);
    res.end();
  });
});

// POST /api/v1/zoom/oauth/token
// See more: https://marketplace.zoom.us/docs/guides/auth/oauth
app.post("/api/v1/zoom/auth/token", (req, res) => {
  const body = new URLSearchParams();

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
      res.status(201).json(response.data);
    })
    .catch((err) => {
      console.error("[ERROR]:", err.message);
      res.status(401).json(err.response.data);
    });
});

// GET /api/v1/zoom/users/me
// See more: https://marketplace.zoom.us/docs/guides/auth/oauth
app.get("/api/v1/zoom/users/me", authorize, (req, res) => {
  console.log("[INFO]:", "User retrieved!");
  res.status(200).json(req.user);
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

// Start server
app.listen(PORT, () => {
  console.log("Listening on http://localhost:" + PORT);
});

// Some logic goes here
function createEventName(name, accountId) {
  return `${name}:${accountId}`;
}

// Middlewares
function authorize(req, res, next) {
  const authorizationHeader =
    req.headers.authorization || `Bearer ${req.query.token}`;
  axios
    .get(ZOOM_GET_USER_URL, {
      headers: {
        Authorization: authorizationHeader,
      },
    })
    .then((response) => {
      req.user = response.data;
      next();
    })
    .catch((err) => {
      console.error("[ERROR]:", err.message);
      res.status(401).json(err.response.data);
    });
}
