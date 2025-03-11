import nodemailer from "nodemailer";

export const enviaEmail = async () => {

    const remetente = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'apagado por questão de segurança',
            pass: 'sjvr baof xpuh iohb'
        }
    });

    const emailASerEnviado = {
        from: 'apagado por questão de segurança',
        to: 'apagado por questão de segurança',
        subject: 'Enviando Email com Node.js',
        text: 'Estou te enviando este email com node.js',
    };

    remetente.sendMail(emailASerEnviado, function (error) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email enviado com sucesso.');
        }
    });

    console.log('enviar email');
}