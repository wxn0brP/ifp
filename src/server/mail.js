const mailer = require('nodemailer');

module.exports = (type, to, subject, ...params) => {
    try{
        var smtpProtocol = mailer.createTransport({
            host: "s1.ct8.pl",
            port: 465,
            auth: {
                user: "ifp@ifp.projektares.tk",
                pass: "!=e-.P6H7L)57c%"
            }
        });

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
            from: "ifp@ifp.projektares.tk",
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