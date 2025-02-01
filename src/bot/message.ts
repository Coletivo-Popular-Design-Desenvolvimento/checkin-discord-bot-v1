export const enviaEmail = async () => {

    const remetente = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'uperalta18@gmail.com',
            pass: 'sjvr baof xpuh iohb'
        }
    });