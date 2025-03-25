import 'reflect-metadata'; // Biblioteca que organiza as dependências, necessario importar antes de qualquer outra biblioteca.
import "dotenv/config";

import express from "express";
import rotas from "./rotas/index.js";

const app = express();

app.use("/", rotas);

export default app;
