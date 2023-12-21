new Vue({
    el: '#app',
    data: {
        dbName: "",
        arg: "",
        headers: [],
        editingCell: null,
        original: [],
        editedData: [],
        socket: null,
        undoStack: [],
    },
    mounted(){
        let name = prompt("name");
        let pass = prompt("pass");
        this.socket = io('/admin', {
            query: {
                name, pass
            },
            transports: ['websocket'],
            autoConnect: false
        });
        this.socket.on("connect_error", (err) => {
            lo(err)
        });
        this.socket.on("err", (err) => {
            lo(err)
        });
        this.socket.on("get", this.initDb);
        this.socket.connect();
    },
    methods: {
        initDb(data){
            this.headers = this.extractHeaders(data);
            this.original = JSON.parse(JSON.stringify(data));
            this.editedData = JSON.parse(JSON.stringify(data));
        },
        editCell(rowIndex, field){
            this.editingCell = { rowIndex, field };
        },
        edit(rowIndex, field, evt){
            this.editingCell = null;
            const _id = this.editedData[rowIndex]._id;
            this.editedData[rowIndex][field] = evt.target.value;
            const updatedFields = { [field]: this.editedData[rowIndex][field] };

            this.addToUndoStack({ _id, originalFields: { ...this.original[rowIndex] }, updatedFields });
        },
        addToUndoStack(change){
            this.undoStack.push(change);
        },
        undo(){
            if(this.undoStack.length > 0){
                const change = this.undoStack.pop();
                const rowIndex = this.editedData.findIndex(item => item._id === change._id);

                if(rowIndex !== -1){
                    Vue.set(this.editedData, rowIndex, { ...change.originalFields });
                }
            }
        },
        setUpdates(){
            const updatesMap = new Map();
            for(let i=this.undoStack.length-1; i>=0; i--){
                const change = this.undoStack[i];
                let data = {};
                if(updatesMap.has(change._id)){
                    data = updatesMap.get(change._id);
                };
                data = { ...data, ...change.updatedFields };
                updatesMap.set(change._id, data);
            }
            const updates = Array.from(updatesMap, ([_id, updatedFields]) => ({ _id, ...updatedFields }));
            return updates;
        },
        saveEdit(){
            let undos = this.setUpdates();
            this.undoStack = [];
            this.socket.emit("edit", this.dbName, undos);
        },
        changeDb(){
            let arg;
            try{
                arg = JSON.parse(this.arg);
            }catch{
                arg = this.arg;
            }
            this.socket.emit('get', this.dbName, arg);
        },
        extractHeaders(data){
            const allKeys = data.reduce((keys, item) => {
                Object.keys(item).forEach(key => {
                    if(!keys.includes(key))
                        keys.push(key);
                });
                return keys;
            }, []);
            data.forEach(item => {
                allKeys.forEach(key => {
                    if(!item.hasOwnProperty(key)) {
                        Vue.set(item, key, null);
                    }
                });
            });

            return allKeys;
        },
        addItem(){
            this.socket.emit("add", this.dbName);
            setTimeout(() => {
                this.socket.emit("get", this.dbName);
            }, 100);
        },
        removeItem(){
            const itemId = prompt("Enter _id to remove:");
            if(!itemId) return;
            this.socket.emit('remove', this.dbName, itemId);
            setTimeout(() => {
                this.socket.emit("get", this.dbName);
            }, 100);
        },
        formatInput(data){
            if(typeof data == "object"){
                data = JSON.stringify(data);
            }else
            if(Array.isArray(data)){
                data = JSON.stringify(data);
            }
            if(data == null || data == "null") data = "";
            return data;
        }
    },
});