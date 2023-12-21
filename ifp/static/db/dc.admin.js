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
        edit(rowIndex, field){
            this.editingCell = null;
            const _id = this.editedData[rowIndex]._id;
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
    
                if(updatesMap.has(change._id)) continue;
                updatesMap.set(change._id, change.updatedFields);
            }
            const updates = Array.from(updatesMap, ([_id, updatedFields]) => ({ _id, ...updatedFields }));
            return updates;
        },
        saveEdit(){
            let undos = this.setUpdates();
            this.undoStack = [];
            lo(undos);
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
                    if (!item.hasOwnProperty(key)) {
                        Vue.set(item, key, null);
                    }
                });
            });

            return allKeys;
        },
    },
});