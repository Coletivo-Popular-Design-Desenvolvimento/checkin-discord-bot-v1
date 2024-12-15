import 'dotenv/config';
import Telegraf from "telegraf";

const { BOT_TOKEN, CHAT_ID } = process.env;
 
const bot = new Telegraf.Telegraf(BOT_TOKEN);
bot.telegram.sendMessage(CHAT_ID, "<pre>Monospace</pre>, <b>Bold</b>, <i>italic</i>, and <u>underlines</u>!", { parse_mode: "HTML" }); //Mensagem com formatação HTML