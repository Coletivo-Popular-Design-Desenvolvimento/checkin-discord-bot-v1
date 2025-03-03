import { PrismaClient } from "@prisma/client";
import { Response } from "express";

export const health = (_req, res: Response) => {
  res.status(200).send("OK");
};

export const dbHealth = async (_req, res: Response) => {
  const prisma = new PrismaClient();
  try {
    console.log('Iniciando teste de sanidade...');

    await prisma.$queryRaw`SELECT 1`;

    console.log('Teste concluído: Banco de dados funcionando.');
  } catch (error) {
    console.error('Erro de conexão com banco de dados:', error);
    res.status(503).json({ status: 'ERROR', message: 'Conexão com banco de dados falhou.' });
  }
}
