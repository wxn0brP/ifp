/**
 * Veryfication bot
 * @module socket/bot
 */

/**
 * Evaluates HTTP headers based on specific criteria and returns the percentage of compliance.
 *
 * @param {Object} headers - An object containing HTTP headers.
 * @returns {number} The percentage of header compliance.
 */
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

/**
 * Verifies the existence of a token in the "bot" database collection.
 *
 * @param {string} token - The token to verify.
 * @returns {Promise<Object|boolean>} If the token exists, returns an object with token data; otherwise, returns false.
 */
async function tokenVery(token){
    var tokenD = await global.db.data.findOne("bot", { token });
    if(!tokenD) return false;
    return tokenD;
}

module.exports = {
    connect,
    tokenVery
}