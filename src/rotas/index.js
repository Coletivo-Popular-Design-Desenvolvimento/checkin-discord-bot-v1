import { Router } from "express";

import { health } from "./health.js";

const rotas = Router();

rotas.get("/health", health);

export default rotas;
