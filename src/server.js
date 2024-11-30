import "dotenv/config";

import express from "express";
import rotas from "./rotas/index.js";

const app = express();

app.use("/", rotas);

export default app;
