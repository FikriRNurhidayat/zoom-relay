const express = require("express");
const morgan = require("morgan");
const path = require("path");

// Get port from environment variable
const { PORT = 8000 } = process.env;
const PUBLIC_DIRECTORY = path.resolve(__dirname, "public");

const app = express();

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
