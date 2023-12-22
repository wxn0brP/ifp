new Vue({
    el: '#app',
    data: {
        dbName: "",
        selectedOperation: 'find',
        finder: null,
        arg1: null,
        headers: [],
        editedData: [],
        socket: null,
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
        this.socket.on("get", data => {
            switch(this.selectedOperation){
                case "find":
                    this.initDb(data);
                break;
                case "findOne":
                    this.initDb([data]);
                break;
                default:
                    alert(JSON5.stringify(data));
            }
        })
        this.socket.connect();
    },
    computed: {
        showFinder(){
            return ['find', 'findOne', 'update', 'updateOne', 'remove', 'removeOne'].includes(this.selectedOperation);
        },
        showArg1(){
            return ['update', 'updateOne', 'add'].includes(this.selectedOperation);
        },
    },
    methods: {
        initDb(data){
            this.headers = this.extractHeaders(data);
            this.editedData = JSON.parse(JSON.stringify(data));
        },
        extractHeaders(data){
            const allKeys = data.reduce((keys, item) => {
                Object.keys(item).forEach(key => {
                    if(!keys.includes(key))
                        keys.push(key);
                });
                return keys;
            }, []);
            // data.forEach(item => {
            //     allKeys.forEach(key => {
            //         if(!item.hasOwnProperty(key)) {
            //             Vue.set(item, key, null);
            //         }
            //     });
            // });

            return allKeys;
        },
        exe(){
            let finder;
            if(this.showFinder){
                try{
                    finder = JSON5.parse("{"+this.finder+"}");
                }catch{
                    finder = this.finder;
                }
            }else{
                finder = {}
            }
            let arg1;
            if(this.showArg1){
                try{
                    arg1 = JSON5.parse("{"+this.arg1+"}");
                }catch{
                    alert("err arg1 obj")
                    return;
                }
            }else{
                arg1 = {}
            }
            this.socket.emit("exe",
                this.dbName,
                this.selectedOperation,
                finder,
                arg1
            );
        }
    },
});