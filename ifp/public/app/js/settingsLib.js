function settingsBuilder(div, obj, settings){
    obj.forEach(optionDef => {
        const optionDiv = document.createElement("div");

        const label = document.createElement("label");
        label.textContent = optionDef.name;

        if(optionDef.type === "slider"){
            const sliderDiv = document.createElement("div");

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

            optionDiv.appendChild(label);
            optionDiv.appendChild(sliderDiv);
        }else if(optionDef.type === "button"){
            const button = document.createElement("button");
            button.textContent = settings[optionDef.name] ? "Wyłącz" : "Włącz";

            button.addEventListener("click",() => {
                settings[optionDef.name] = !settings[optionDef.name];
                button.textContent = settings[optionDef.name] ? "Wyłącz" : "Włącz";
            });

            optionDiv.appendChild(label);
            optionDiv.appendChild(button);
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

            optionDiv.appendChild(label);
            optionDiv.appendChild(select);
        }

        div.appendChild(optionDiv);
    });
}

function settingsInit(div, obj, settings, callBack){
    function updateObject(obj, newVal){
        for(let key in newVal){
            if(newVal.hasOwnProperty(key)){
                obj[key] = newVal[key];
            }
        }
        return obj;
    }

    function createSettings(){
        div.innerHTML = "";
        settingsBuilder(div, obj, settingsTmp);
        
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