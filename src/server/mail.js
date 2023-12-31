const mailer = require('nodemailer');
const cfg = require("../../config/mailConfig.json");

module.exports = (type, to, subject, ...params) => {
    try{
        var smtpProtocol = mailer.createTransport(cfg);

        var pod = "";
        switch(type){
            case "kod":
                pod = "<h1>Kod: "+params[0]+"</h1>";
            break;
        }
        var html = `
<!DOCTYPE html>
<html lang="pl">
    <head>
        <meta charset="UTF-8">
        <title>ifp</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            *{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body{
                background-color: #161a1e;
                color: #a0bddd;
                text-align: center;
            }
            a{
                color: #a0bddd;
            }
            a:hover{
                color: #38baaf;
            }
        </style>
    </head>
    <body>
        ${pod}
    </body>
</html>
        `.trim();
        
        var mailoption = {
            from: cfg.from,
            to,
            subject,
            html
        }

        smtpProtocol.sendMail(mailoption, function(err, res){
            if(err){
                lo(err);
            } 
            lo("E-mail Sent", to);
            smtpProtocol.close();
        });
    }catch{}
}