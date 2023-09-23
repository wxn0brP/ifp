function formatText(text){
    //text
    text = changeText(text);
    text = changeEmo(text);

    try{
        var match = text.match(/ic\?id=(\w+-\w+-\w+)/);
        function inv(id){
            var inv = JSON.parse(__.httpReq("/ic/get?id="+id));
            if(inv.err) return;
            var chat = document.getElementById("chat_"+inv.msg.id);
            var name = inv.msg.name;

            text += "<br />";
            if(chat){
                text += `<p>Dołączono już do serwera "${name}"</p>`;
            }else{
                text += `<button class="inviteChatBtn" onclick="inivteAchat('${id}');reloadMsg(3);">Dołącz do servera "${name}"</button>`
            }

        }
        if(match) inv(match[1]);
    }catch{}

    try{
        var rege = document.createElement("span");
        rege.innerHTML = text;
        rege = rege.getElementsByTagName("a");
        for(let i=0; i<rege.length; i++){
            // rege[i].setAttribute("onerror", () => {});
            var regex = rege[i].getAttribute("href");
            var media = changeMedia(regex);
            text += "<br />" + media.outerHTML;
        }
        
        var temp = document.createElement("span");
        temp.innerHTML = text;
        text = temp.outerHTML;
    }catch{}

    return text;
}

function responeMess(msg, res_id){
    var resMsgDiv = document.getElementById(res_id+"_");
    if(!resMsgDiv) return;
    var res_msg = resMsgDiv.getAttribute("_plain");
    if(res_msg.length > 20){
        res_msg.slice(0, 20);
        res_msg += "...";
    }

    var ele = document.createElement("div");
    ele.classList.add("res-msg");
    ele.innerHTML = "-> "+res_msg;
    ele.addEventListener("click", () => {
        __.scrollTo(resMsgDiv);
        setTimeout(() => {
            resMsgDiv.classList.add("res-msg-anim");
            setTimeout(() => resMsgDiv.classList.remove("res-msg-anim"), 1000);
        }, 600);
    })
    msg.appendChild(ele);
    msg.classList.add("res-msg-mess");
}

function changeText(text){
    //ochrona przed znacznikami
    text = text.replace(/</g, '&lt;');
    text = text.replace(/>/g, '&gt;');

    const excludePattern = /```(.*?)```/g;
    const excludeMatches = text.match(excludePattern);
    const exclusions = [];
    if(excludeMatches){
        for(const match of excludeMatches){
            const exclusion = match.slice(3, -3);
            exclusions.push(exclusion);
            const placeholder = `@EXCLUSION${exclusions.length}@`;
            text = text.replace(match, placeholder);
        }
    }

    //zmiana na pogróbienie krusywę przekleślenie podkreślenie
    text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    text = text.replace(/\/\/\/(.*?)\/\/\//g, '<i>$1</i>');
    text = text.replace(/--(.*?)--/g, '<strike>$1</strike>');
    text = text.replace(/__(.*?)__/g, '<u>$1</u>');

    //zmiana link i mail na klikalne
    text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" onclick="linkClick(event)">$1</a>');
    text = text.replace(/(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b)/g, '<a href="mailto:$1">$1</a>');

    //dodanie kolorów
    text = text.replace(/##([0-9A-Fa-f]{3,6})\s(.*?)\s#c/g, '<span style="color:#$1">$2</span>');
    text = text.replace(/#(red|green|blue|yellow|orange|purple|pink|gold|grey)\s(.*?)\s#c/gi, '<span style="color:$1">$2</span>');
    
    //zmina \n na nową linię
    text = text.replaceAll("\n", "<br />");

    for(let i = 0; i < exclusions.length; i++){
        const exclusion = exclusions[i];
        const placeholder = `@EXCLUSION${i + 1}@`;
        text = text.replace(placeholder, exclusion);
    }

    return text;
}

function changeEmo(text){
    for(var emo of getOneInRegex(text, /(?<=:)(.*?)(?=:)/g)){
        var inMap = emocjiMap[emo];
        if(!inMap) continue;
        text = text.replaceAll(":"+emo+":", inMap);
    }
    return text;
}

function changeMedia(link){
    const rozszerzenie = link.substring(link.lastIndexOf('.') + 1);
    var extRegex = /\.(js|html|css|py|c|cpp|java|cs|php|rb|swift|kt|ts|go|rs|pl|sh|sql|r|m|txt)$/i;
    if(['mp3', 'wav', 'ogg'].includes(rozszerzenie)){
        if(!chcek(link)) return null;
        const a = addLink(link);
        const ele = document.createElement('audio');
        ele.src = link;
        ele.controls = true;
        a.appendChild(ele);
        a.appendChild(document.createElement("br"));
        a.appendChild(document.createElement("br"));
        return a;
    }
    else if(['mp4', 'avi', 'mkv'].includes(rozszerzenie)){
        if(!chcek(link)) return null;
        const a = addLink(link);
        const ele = document.createElement('video');
        ele.src = link;
        ele.controls = true;
        ele.style.maxWidth = '65%';
        ele.style.height = 'auto'; 
        ele.style.borderRadius = '2rem';
        a.appendChild(ele);
        a.appendChild(document.createElement("br"));
        a.appendChild(document.createElement("br"));
        return a;
    }
    else if(['png', 'jpg', 'gif', 'ico', 'jpeg'].includes(rozszerzenie)){
        if(!chcek(link)) return null;
        const a = addLink(link);
        const ele = document.createElement('img');
        ele.src = link;
        ele.style.maxWidth = '100%';
        ele.style.height = 'auto';
        a.appendChild(ele);
        a.appendChild(document.createElement("br"));
        return a;
    }
    else if(link.includes("youtube.com")){
        const a = addLink(link);
        const videoId = extractYouTubeVideoId(link);
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.classList.add("s");
        iframe.allowfullscreen = true;
        iframe.style.maxWidth = '100%';
        iframe.style.width = '500px';
        iframe.style.height = '300px';
        iframe.style.borderRadius = '2rem';
        a.appendChild(iframe);
        a.appendChild(document.createElement("br"));
        return a;
    }
    else if(link.includes("github.com")){
        const a = addLink(link);
        const data = extractOwnerAndRepo(link);
        if(!data) return null;
        var api = JSON.parse(__.httpReq(`https://api.github.com/repos/${data.owner}/${data.repo}`));
        var name = api.name;
        var lang = api.language;
        var license = api.license.name;
        var description = api.description;

        var div = document.createElement("div");
        div.classList.add("inter-page");
        div.innerHTML = `nazwa: ${name}<br />język: ${lang}<br />licencja: ${license}<br />opis: ${description}`
        a.appendChild(div);
        a.appendChild(document.createElement("br"));
        return a;
    }
    else if(link.includes("tiktok.com")){
        const a = addLink(link);
        const iframe = document.createElement('iframe');
        const videoId = extractTikTokVideoId(link);
        iframe.src = `https://www.tiktok.com/embed/v2/${videoId}`;
        iframe.allowfullscreen = true;
        iframe.classList.add("s");
        iframe.style.maxWidth = '100%';
        iframe.style.width = '400px';
        iframe.style.height = '700px';
        iframe.style.borderRadius = '2rem';
        a.appendChild(iframe);
        a.appendChild(document.createElement("br"));
        return a;
    }
    else if(link.includes("reddit.com")){
        const a = addLink(link);
        if(!link.endsWith("/")) link += "/";
        var api = JSON.parse(__.httpReq(`${link}.json?limit=2`));
        var post = api[0]?.data.children[0]?.data;

        var title = post.title;
        var author = post.author;
        var div = document.createElement("div");
        div.classList.add("inter-page");
        div.innerHTML = `autor: ${author}<br />tytuł: ${title}`
        a.appendChild(div);
        a.appendChild(document.createElement("br"));
        return a;
    }
    else if(link.includes("instagram.com")){
        return null;
    }
    else if(link.includes("spotify.com")){
        const a = addLink(link);
        const iframe = document.createElement('iframe');
        const videoId = extractSpotifyId(link);
        if(!videoId) return null;
        iframe.src = `https://open.spotify.com/embed/${videoId}`;
        iframe.allowfullscreen = true;
        iframe.classList.add("s");
        iframe.style.maxWidth = '100%';
        iframe.style.width = '400px';
        iframe.style.height = '84px';
        iframe.style.borderRadius = '1rem';
        a.appendChild(iframe);
        a.appendChild(document.createElement("br"));
        return a;
    }
    else if(extRegex.test(link)){
        var language = link.match(extRegex)[0].replace(".","");

        const a = addLink(link);
        var pre = document.createElement("pre");
        pre.classList.add("preCode");
        pre.innerHTML = `<span style="color: green;">${language}</span>:<br /><br />`;
        pre.style.overflow = "auto";
        
        var code = document.createElement("code");
        var file = __.httpReq(link);
        code.innerHTML = hljs.highlight(file, {language}).value;
        if(file.length>500 || file.split("\n").length > 10){
            pre.style.maxHeight = "17rem";
        }

        pre.appendChild(code);
        a.appendChild(pre);
        return a;
    }
    else if(link.startsWith('http')){
        const a = addLink(link);
        var html = __.httpReq(link);

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const titleElement = doc.querySelector('head title');
        const title = titleElement ? titleElement.textContent : false;
        const descriptionElement = doc.querySelector('head meta[name="description"]');
        const description = descriptionElement ? descriptionElement.getAttribute('content') : false;
        // const faviconElement = doc.querySelector('head link[rel="icon"]') || doc.querySelector('head link[rel="shortcut icon"]');
        // const favicon = faviconElement ? faviconElement.getAttribute('href') : false;

        if(favicon || title || description){
            var ele = document.createElement("div");
            ele.classList.add("inter-page");
            var html = "";
            // if(favicon){
            //     var linkIco = "";
            //     linkIco += link.endsWith("/") ? link : link + "/";
            //     linkIco += favicon.startsWith("/") ? favicon.substring(1) : favicon;
            //     html += `<div style="float: left;"><img src="${linkIco}" style="width: 50px; height: 50px;" /></div>`
            // }
            if(title || description){
                html += `<div style="float: left; height: 50px;">`;
                if(title) html += `<span style="font-size: 1.2rem">${title}</span><br />`;
                if(description) html += description;
                html += "</div>";
            }
            html += `<div style="clear: both;"></div>`;
            ele.innerHTML = html;
            a.appendChild(ele);
        }
        a.appendChild(document.createElement("br"));
        return a;
    }else{
        return null;
    }
}

function addLink(link){
    const div = document.createElement("span");
    const a = document.createElement("a");
    a.href = link;
    a.setAttribute("onclick", "linkClick(event)");
    div.appendChild(a);
    return div;
}

function chcek(link){
    var xhr = new XMLHttpRequest();
    xhr.open("HEAD", link, false);
    xhr.send();
    return xhr.status == 200;
}

function extractYouTubeVideoId(link){
    const match = link.match(/(?:\?v=|\/embed\/|\.be\/|\/v\/|\/\d{1,2}\/|\/\d{1,2}\/|\/embed\/|\/v=|\/e\/|watch\?v=|youtube.com\/user\/[^#\/]+#p\/[^#\/]+\/|user\/[^#\/]+#p\/[^#\/]+\/|youtube.com\/(?:v|e|embed)\/|youtu.be\/|youtube.com\/user\/[^#\/]+#p\/[^#\/]+\/|user\/[^#\/]+#p\/[^#\/]+\/|youtube.com\/(?:v|e|embed)\/|youtu.be\/|youtube.com\/user\/[^#\/]+#p\/[^#\/]+\/|user\/[^#\/]+#p\/[^#\/]+\/)([^"&?\/ ]{11})/);
    return (match && match[1]) ? match[1] : null;
}

function extractOwnerAndRepo(link){
    const regex = /github\.com\/([^/]+)\/([^/]+)/;
    const match = link.match(regex);
    if(match && match.length >= 3){
        const owner = match[1];
        const repo = match[2];
        return { owner, repo };
    }
    return null;
}

function extractTikTokVideoId(link){
    const regex = /tiktok\.com\/(?:@[\w.-]+\/video\/|v\/|embed\/v2\/)([\w-]+)/;
    const match = link.match(regex);
    return match ? match[1] : null;
}

function extractSpotifyId(link){
    const trackMatch = link.match(/track\/([a-zA-Z0-9]+)/);
    if(trackMatch && trackMatch[1]){
        return "track/"+trackMatch[1];
    }
    const playlistMatch = link.match(/playlist\/([a-zA-Z0-9]+)/);
    if(playlistMatch && playlistMatch[1]){
        return "playlist/"+playlistMatch[1];
    }
    return null;
}