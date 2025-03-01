import app from "../server.js";
import client from "../bot/bot.js";
import path from 'path';
import * as dotenv from 'dotenv';

// .env agora esta um nível acima na arvore de pastas, por isso uma configuração diferente é necessaria. 
dotenv.config();

const PORT = process.env.PORT || "3000";
const { SECRET_KEY } = process.env;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

client.login(SECRET_KEY);
