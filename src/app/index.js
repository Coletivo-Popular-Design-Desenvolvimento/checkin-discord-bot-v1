import app from "../server.js";
import client from "../bot/bot.js";

const { PORT } = process.env || 3000;
const { SECRET_KEY } = process.env;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

client.login(SECRET_KEY);
