function settingsBuilder(div, categories, settings){
    categories.forEach(category => {
        const categoryDiv = document.createElement("div");
        categoryDiv.innerHTML = `<h1>${category.name}</h1>`;

        category.cat.forEach(optionDef => {
            const optionDiv = document.createElement("div");
            optionDiv.clA("setting_ele");

            if(typeof optionDef == "string"){
                optionDiv.innerHTML = optionDef;
            }else if(typeof optionDef == "object"){
                const label = document.createElement("label");
                label.textContent = optionDef.name;
                optionDiv.appendChild(label);
    
                if(optionDef.type === "slider"){
                    const sliderDiv = document.createElement("span");
    
                    const slider = document.createElement("input");
                    slider.type = "range";
                    slider.min = optionDef.min || 0;
                    slider.max = optionDef.max || 100;
                    slider.value = settings[optionDef.name];
    
                    slider.addEventListener("input",(event) => {
                        settings[optionDef.name] = parseFloat(event.target.value);
                        valueLabel.textContent = `${settings[optionDef.name]} / ${slider.max}`
                    });
    
                    const valueLabel = document.createElement("span");
                    valueLabel.textContent = `${settings[optionDef.name]} / ${slider.max}`;
    
                    sliderDiv.appendChild(slider);
                    sliderDiv.appendChild(valueLabel);
    
                    optionDiv.appendChild(sliderDiv);
                }else if(optionDef.type === "checkbox"){
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.checked = settings[optionDef.name];
                    checkbox.addEventListener("change", () => {
                        settings[optionDef.name] = checkbox.checked;
                    });
    
                    optionDiv.appendChild(checkbox);
                }else if(optionDef.type === "list"){
                    const select = document.createElement("select");
    
                    optionDef.options.forEach(optionValue => {
                        const option = document.createElement("option");
                        option.value = optionValue;
                        option.textContent = optionValue;
                        if(optionValue === settings[optionDef.name]){
                            option.selected = true;
                        }
                        select.appendChild(option);
                    });
    
                    select.addEventListener("change",(event) => {
                        settings[optionDef.name] = event.target.value;
                    });
    
                    optionDiv.appendChild(select);
                }else if(optionDef.type === "input"){
                    const input = document.createElement("input");
                    input.type = "text";
                    input.value = settings[optionDef.name] || "";
                    input.addEventListener("change", () => {
                        settings[optionDef.name] = input.value;
                    })
                    optionDiv.appendChild(input);
                }
    
            }

            categoryDiv.appendChild(optionDiv);
            div.appendChild(categoryDiv);
        });
    });
}

function settingsInit(div, categories, settings, callBack){
    function createSettings(){
        div.innerHTML = "";
        settingsBuilder(div, categories, settingsTmp);
        
        const optionDiv = document.createElement("div");
        
        const buttonReset = document.createElement("button");
        buttonReset.classList.add("settings-btn");
        buttonReset.innerHTML = "Reset";
        buttonReset.addEventListener("click", () => {
            settingsTmp = Object.assign({}, settings);
            createSettings();
        })
        optionDiv.appendChild(buttonReset);
        
        const buttonSave = document.createElement("button");
        buttonSave.classList.add("settings-btn");
        buttonSave.innerHTML = "Save";
        buttonSave.addEventListener("click", () => {
            settings = updateObject(settings, settingsTmp);
            callBack();
        });
        optionDiv.appendChild(buttonSave);
        div.appendChild(document.createElement("br"));
        div.appendChild(optionDiv);
    }

    var settingsTmp = Object.assign({}, settings);
    createSettings();
}