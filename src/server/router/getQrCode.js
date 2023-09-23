var qrcode = require('qrcode-terminal');

module.exports = async (req, res) => {
    const { kt } = req.query;
    if(!kt) return res.status(422).send("");

    qrcode.setErrorLevel('Q');
    var code = await new Promise(f => {
        qrcode.generate(kt, { small: true }, function(qrcode){
            f(qrcode);
        });
    });
    res.send(code);
}