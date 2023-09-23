const canvas = document.getElementById("matrixCanvas");
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const columns = [];
for(let i=0; i<canvas.width/20; i++){
    columns[i] = 1;
}
function drawMatrix(){
    context.fillStyle = "rgba(0, 0, 0, 0.05)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#0F0";
    context.font = "15px monospace";
    for(let i=0; i<columns.length; i++){
        const randomChar = characters[Math.floor(Math.random() * characters.length)];
        context.fillText(randomChar, i * 20, columns[i] * 20);
        if(columns[i] * 20 > canvas.height && Math.random() > 0.975){
            columns[i] = 0;
        }
        columns[i]++;
    }
    setTimeout(drawMatrix, 20);
}
drawMatrix();