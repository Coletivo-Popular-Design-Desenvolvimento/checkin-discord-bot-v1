import app from "../server.js";

app.use("/health", (req, res) => {
  res.status(200).send("OK");
});
