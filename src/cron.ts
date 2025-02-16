import nodeSchedule from 'node-schedule';
import {enviaEmail} from './bot/email.js';
import {enviaMensagem} from './bot/telegram.js';
import { readEvents } from './bot/file.js';

//Para a cron rodar a cada 5 min:
const job = nodeSchedule.scheduleJob('*/5 * * * *', function(){
    
    let dados = readEvents();
    dados.then(function(result) {
        for (let key in result) {
            let horaSeparada = result[key].hora.split(':'); //Split para setar a hora no objeto date
            let dataSeparada = result[key].data.split('-'); //Split para setar a data no objeto date
            let dataEvento = new Date(`${dataSeparada[1]}/${dataSeparada[2]}/${dataSeparada[0]}`); //Cria o objeto date com a data do evento
            dataEvento.setHours(horaSeparada[0], horaSeparada[1], 0, 0); //Seta a hora da data do evento no fuso horário de brasilia
            
            let dataAtual = new Date(); //Data atual para comparação
            dataAtual.setSeconds(0); //Necessário setar os segundos para 0 para comparação funcionar
            
            //Deixando preparado para a comparação de 30min e de 1h
            let data30Mmn = new Date();
            data30Mmn.setMinutes(data30Mmn.getMinutes() + 30); //Data atual menos 30min para segunda notificação
            data30Mmn.setSeconds(0); //Necessário setar os segundos para 0 para comparação funcionar
            let data1h = new Date();
            data1h.setHours(data1h.getHours() + 1); //Data atual menos 30min para segunda notificação
            data1h.setSeconds(0); //Necessário setar os segundos para 0 para comparação funcionar
            
            let data1dia = new Date();
            data1dia.setDate(data1dia.getDate() + 1); //Data atual menos 1 dia para primeira notificação
            data1dia.setSeconds(0); //Necessário setar os segundos para 0 para comparação funcionar
            
            if(dataEvento.toString() <= data30Mmn.toString() && dataEvento.toString() >= dataAtual.toString()) { //Primeiro verifica se o evento ocorre em 30min ou menos
                console.log(key, 'Disparo de mensagem 30min antes.', dataEvento.toString());
                enviaEmail();
                enviaMensagem();
            } else if(dataEvento.toString() <= data1dia.toString() && dataEvento.toString() >= dataAtual.toString()) { //Depois verifica se o evento ocorre em 24h ou menos
                console.log(key, 'Disparo de mensagem 1 dia antes.', dataEvento.toString());
                enviaEmail();
                enviaMensagem();
            }
        }
    });
});