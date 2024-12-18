import nodeSchedule from 'node-schedule';
import {enviaEmail} from './bot/email.js';
import {enviaMensagem} from './bot/telegram.js';

//Para a cron rodar a cada 5 min:
const job = nodeSchedule.scheduleJob('*/1 * * * *', function(){
    console.log('The answer to life, the universe, and everything!');
    enviaEmail();
    enviaMensagem();
});