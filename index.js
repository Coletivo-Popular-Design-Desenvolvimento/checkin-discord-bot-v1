import app from './server.js';
import client from './bot.js';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

client.login(process.env.SECRET_KEY);
