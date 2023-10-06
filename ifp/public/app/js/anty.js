const _anty = {};

_anty.robotsDetector = function(){
    const detectMUA = (userAgent) =>{
        const robots = /bot|spider|crawl|APIs-Google|AdsBot|Googlebot|mediapartners|Google Favicon|FeedFetcher|Google-Read-Aloud|DuplexWeb-Google|googleweblight|bing|yandex|baidu|duckduck|yahoo|ecosia|ia_archiver|facebook|instagram|pinterest|reddit|slack|twitter|whatsapp|youtube|semrush/i;
        return robots.test(userAgent);
    };

    const vars = () => {
        const windowVar = ['webdriver', '_Selenium_IDE_Recorder', 'callSelenium', '_selenium', 'callPhantom', '_phantom', 'phantom', '__nightmare'];
        const navigatorVar = ['__webdriver_script_fn', '__driver_evaluate', '__webdriver_evaluate', '__selenium_evaluate', '__fxdriver_evaluate', '__driver_unwrapped', '__webdriver_unwrapped', '__selenium_evaluate', '__fxdriver_evaluate', '__driver_unwrapped', '__webdriver_unwrapped', '__selenium_unwrapped', '__fxdriver_unwrapped', '__webdriver_script_func'];
        const attrib = ['webdriver', 'selenium', 'driver'];

        for(let i = 0; i < windowVar.length; i++){
            if(windowVar[i] in window) return true;
        }

        for(let i = 0; i < navigatorVar.length; i++){
            if(navigatorVar[i] in navigator) return true;
        }

        for(let i = 0; i < attrib.length; i++){
            if(document.documentElement.getAttribute(attrib[i]) !== null) return true;
        }

        try{
            if(!navigator.language || navigator.languages.length === 0) return true;
        }catch{}

        return false;
    };

    const userAgent = navigator.userAgent;

    if(detectMUA(userAgent)) return true;

    // if(userAgent.match(/Mobile|Tablet|Android|iPhone|iPad|iPod/i)){
    //     if(navigator.maxTouchPoints < 1 || !this.touchSupport()) return true;
    // }

    if(window.outerWidth === 0 && window.outerHeight === 0){
        return true;
    }

    if(vars()){
        return true;
    }

    return false;
}

_anty.addBlockerDetector = async function(){
    let adBlockEnabled = false;
    const googleAdUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

    try{
        await fetch(new Request(googleAdUrl)).catch(_ => adBlockEnabled = true);
    }catch(e){
        return true;
    }

    return adBlockEnabled;
}