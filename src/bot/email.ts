import nodemailer from "nodemailer";

export const enviaEmail = async () => {

    var remetente = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'uperalta18@gmail.com',
            pass: 'sjvr baof xpuh iohb'
        }
    });

    var emailASerEnviado = {
        from: 'uperalta18@gmail.com',
        to: 'uperalta18@gmail.com',
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