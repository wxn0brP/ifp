const gen = require("../../db/gen");

module.exports = (req, res) => {
    res.send(gen());
};