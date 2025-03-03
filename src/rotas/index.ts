import { Router } from "express";

import { dbHealth, health } from "./health.js";

const rotas = Router();

rotas.get("/health", health);

rotas.get("dbhealth", dbHealth)

export default rotas;
