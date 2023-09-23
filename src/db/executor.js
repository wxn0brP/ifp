class executorC{
    quote = []
    isExecuting = false

    async addOp(func, ...param){
        return await new Promise((resolve, reject) => {
            this.quote.push({
                func,
                param,
                resolve,
                reject
            });
            this.execute();
        });
    }

    async execute(){
        if(this.isExecuting) return;
        this.isExecuting = true;
        while(this.quote.length > 0){
            var q = this.quote.shift();
            var res = await q.func(...q.param);
            q.resolve(res)
        }
        this.isExecuting = false;
    }
}

module.exports = executorC;
