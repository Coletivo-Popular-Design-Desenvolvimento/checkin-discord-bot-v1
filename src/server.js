import "dotenv/config";

import express from "express";

const app = express();

app // Cria uma rota para manter o servidor ativo
  .get("/health", (req, res) => {
    res.status(200).send("OK");
  });

export default app;
