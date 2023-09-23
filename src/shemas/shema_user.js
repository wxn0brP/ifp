module.exports = {
    name: {
        type: "string",
        required: true,
    },
    email: {
        type: "string",
        required: true,
        pattern: /^\S+@\S+\.\S+$/,
    },
    password: {
        type: "string",
        required: true,
    },
    friends: {
        type: "object",
        required: false,
        default: [],
    },
    chats: {
        type: "object",
        required: false,
        default: [],
    }
}