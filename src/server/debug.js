module.exports = {
    getSockets: (path) => {
        return [...global.io.of(path).sockets].length;
    }
}