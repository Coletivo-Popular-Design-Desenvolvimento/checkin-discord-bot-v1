import express from 'express';

const app = express();

// Cria uma rota para manter o servidor ativo
app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

export default app;
