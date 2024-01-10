var channelMgmt = {
    categories: [],

    arrayMove(arr, fromIndex, toIndex){
        if(toIndex >= 0 && toIndex < arr.length){
            const element = arr.splice(fromIndex, 1)[0];
            arr.splice(toIndex, 0, element);
        }
    },
    
    renderCategories(){
        const container = document.querySelector('#category-container');
        container.innerHTML = '';
        this.categories.forEach((category, index) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            categoryDiv.innerHTML = `
                <h3>${category.name}</h3>
                <button onclick="channelMgmt.moveCategory(${index}, -1)">↑</button>
                <button onclick="channelMgmt.moveCategory(${index}, 1)">↓</button>
                <button onclick="channelMgmt.removeCategory(${index})">Usuń Kategorię</button>
                <button onclick="channelMgmt.addChannel(${index}), 'text'">Dodaj Kanał Tekstowy</button>
                <button onclick="channelMgmt.addChannel(${index}, 'voice')">Dodaj Kanał Głosowy</button>
                <button onclick="channelMgmt.changeName(${index}, -1)">Zmień nazwę</button>
                <div class="channel-container">
                    ${
                        category.channels ? category.channels.map((channel, channelIndex) => `
                            <div class="channel">
                                ${channel.name} (${channel.type})
                                <button onclick="channelMgmt.moveChannel(${index}, ${channelIndex}, -1)">↑</button>
                                <button onclick="channelMgmt.moveChannel(${index}, ${channelIndex}, 1)">↓</button>
                                <button onclick="channelMgmt.removeChannel(${index}, ${channelIndex})">Usuń Kanał</button>
                                <button onclick="channelMgmt.changeName(${index}, ${channelIndex})">Zmień nazwę</button>
                            </div>
                        `).join('') : ''
                    }
                </div>
            `;
            container.appendChild(categoryDiv);
        });
    },
    
    moveCategory(index, direction){
        const newIndex = index + direction;
        this.arrayMove(this.categories, index, newIndex);
        this.renderCategories();
    },
    
    moveChannel(categoryIndex, channelIndex, direction){
        const newChannelIndex = channelIndex + direction;
        const category = this.categories[categoryIndex];
    
        if(newChannelIndex < 0){
            if(this.categories[categoryIndex-1]?.channels){
                let channel = category.channels[channelIndex];
                this.categories[categoryIndex-1].channels.push(channel);
                this.removeChannel(categoryIndex, channelIndex);
            }
        }else
        if(newChannelIndex >= category.channels.length){
            if(this.categories[categoryIndex+1]?.channels){
                let channel = category.channels[channelIndex];
                this.categories[categoryIndex+1].channels.push(channel);
                this.removeChannel(categoryIndex, channelIndex);
            }
        }else
        if(category.channels){
            this.arrayMove(category.channels, channelIndex, newChannelIndex);
        }
        this.renderCategories();
    },
    
    removeCategory(index){
        let chck = confirm("Czy napewno chcesz usunąć kategorię *"+this.categories[index].name+"*");
        if(!chck) return;
        this.categories.splice(index, 1);
        this.renderCategories();
    },
    
    addChannel(categoryIndex, type="text"){
        this.categories[categoryIndex].channels.push({
            name: "nowy kanał",
            id: genId(),
            type
        })
        this.renderCategories();
    },
    
    addCategory(){
        this.categories.push({
            name: "nowa kategoria",
            id: genId(),
            channels: []
        })
        this.renderCategories();
    },
    
    removeChannel(categoryIndex, channelIndex){
        let chnl = this.categories[categoryIndex].channels[channelIndex];
        let chck = confirm(
            "Czy napewno chcesz usunąć kanał *"+chnl.name+" ("+chnl.type+")*"
        );
        if(!chck) return;
        this.categories[categoryIndex].channels.splice(channelIndex, 1);
        this.renderCategories();
    },

    async changeName(catI, chnl){
        let cat = this.categories[catI];
        let namel = (chnl != -1 ? cat.channels[chnl] : cat).name;
        let name = await getPrompt("Zmień nazwę "+(chnl == -1 ? "kategorii" : "kanału"), namel);
        if(chnl == -1) this.categories[catI].name = name;
        else this.categories[catI].channels[chnl].name = name;
        this.renderCategories();
    }
}