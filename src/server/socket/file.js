const MAX_FILES_PER_USER = 5;
const MAX_TOTAL_FILES = 100;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB
const fs = require("fs");
const path = require("path");
const gen = require("../../db/gen");

var totalFileCount = 0;
const userFileCounts ={};

const uploadsDirectory = "./uploads";
fs.rmSync(uploadsDirectory, { recursive: true, force: true });
if(!fs.existsSync(uploadsDirectory)){
    fs.mkdirSync(uploadsDirectory);
}

module.exports = (socket) => {
    const userUploadsDirectory = path.join(uploadsDirectory, socket.user._id);
    if(!fs.existsSync(userUploadsDirectory)){
        fs.mkdirSync(userUploadsDirectory);
    }

    socket.on("file", (data) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");
        if(!userFileCounts[socket.user._id]){
            userFileCounts[socket.user._id] = 0;
        }

        if(userFileCounts[socket.user._id] >= MAX_FILES_PER_USER){
            socket.emit("fileRes", { err: "Maximum files reached for this user." });
            return;
        }

        if(totalFileCount >= MAX_TOTAL_FILES){
            socket.emit("fileRes", { err: "Maximum total files reached on the server." });
            return;
        }

        const fileData = data.fileData;

        if(fileData.size > MAX_FILE_SIZE){
            socket.emit("fileRes", { err: "File size exceeds limit." });
            return;
        }

        if(fileData.name > 40){
            socket.emit("fileRes", { err: "File name exceeds 40 char limit." });
            return;
        }

        const filePath = path.join(userUploadsDirectory, `${gen()}-${fileData.name}`);

        try{
            fs.writeFileSync(filePath, fileData.data);
            userFileCounts[socket.user._id]++;
            totalFileCount++;
            socket.emit("fileRes", { err: false, msg: filePath.replaceAll("\\","/") });
        } catch(err){
            console.error(err);
            socket.emit("fileRes", { err: true });
        }
    });

    socket.on("disconnect", async () => {
        await global.delay(10000);
        var sockets = global.getSocket(socket.user._id);
        if(sockets.length > 0) return;

        if(fs.existsSync(userUploadsDirectory)){
            const files = fs.readdirSync(userUploadsDirectory);

            files.forEach((file) => {
                const filePath = path.join(userUploadsDirectory, file);
                try{
                    fs.unlinkSync(filePath);
                }catch(err){
                    console.error(err);
                }
            });

            try{
                fs.rmdirSync(userUploadsDirectory);
            }catch(err){
                console.error(err);
            }

            userFileCounts[socket.user._id] = 0;
            totalFileCount -= files.length;
        }
    });
};
