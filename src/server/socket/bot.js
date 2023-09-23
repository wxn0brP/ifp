function connect(headers){
    var tests = [];
    tests.push(headers['user-agent'] != 'node-XMLHttpRequest');
    tests.push(!!headers['accept-language']);
    tests.push(!!headers['accept-encoding']);
    tests.push(!!headers['referer']);
    tests.push(!!headers['cookie']);
    var trueCount = tests.filter((test) => test).length;

    var percentage = (trueCount / tests.length) * 100;
    return percentage;
}

async function tokenVery(token){
    var tokenD = await global.db.bot.findOne({ token });
    if(!tokenD) return false;
    return tokenD;
}

module.exports = {
    connect,
    tokenVery
}