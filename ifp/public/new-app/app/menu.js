
function copyMess(){
    let id = document.getElementById('messMenu').getAttribute('w_id');
    const messageDiv = document.getElementById(id + "_mess");
    const messageContent = messageDiv.getAttribute("_plain");
    navigator.clipboard.writeText(messageContent);
}

function editMess(){
    let id = document.getElementById('messMenu').getAttribute('w_id');
    const messageDiv = document.getElementById(id + "_mess");
    const messageContent = messageDiv.getAttribute("_plain");
    messageDiv.innerHTML = `<input type="text" class="editMess" id="editMessageInput${id}" value="${messageContent}">`;
    messageDiv.insertAdjacentHTML('beforeend', `<button class="editMessB" id="confirmButton${id}">Zatwierdź</button>`);
    const editMessageInput = document.getElementById(`editMessageInput${id}`);
    const confirmButton = document.getElementById(`confirmButton${id}`);
    confirmButton.addEventListener("click", () => handleEditEnd(id, messageContent));
    editMessageInput.addEventListener("keydown", (event) => {
        if(event.key !== "Enter") return;
        event.preventDefault();
        handleEditEnd(id, messageContent);
    });
    editMessageInput.focus();
    editMessageInput.setSelectionRange(editMessageInput.value.length, editMessageInput.value.length);
}

function handleEditEnd(id, messageContent){
    const editedMessage = document.getElementById(`editMessageInput${id}`).value;
    const messageDiv = document.getElementById(id + "_mess");
    if(editedMessage != messageContent){
        // messageDiv.innerHTML = editedMessage;
        socket.emit("editMess", toChat, id, editedMessage);
    }else{
        messageDiv.innerHTML = formatText(messageContent);
    }
    focusInp();
}

function delMess(){
    if(!confirm("Napewno chcesz usunąć wiadomość? Tej operacji nie można cofnąć")) return;
    let id = document.getElementById('messMenu').getAttribute('w_id');
    socket.emit("delMess", toChat, id);
}

function responeMsgE(){
    resMsgId = document.querySelector("#messMenu").atrib("w_id");
    document.querySelector("#resMsgX").css("");
}

function sendFile(){
    var input = document.createElement("input");
    input.type = "file";
    input.click();

    input.addEventListener("change", function(event) {
        var file = event.target.files[0];
        if(file.size > 8 * 1024 * 1024){
            alert('File size exceeds 8MB limit.');
            return;
        }
        if(file.name > 40){
            alert('File name exceeds 40 char limit.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const fileData = {
                name: file.name,
                size: file.size,
                data: event.target.result
            };
            socket.emit('file', { fileData });
        };

        reader.readAsArrayBuffer(file);
    });
}