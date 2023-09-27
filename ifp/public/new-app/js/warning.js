function logWarningPaste(){
    if(config.debug) return;
    lo("%cZaczekaj!", "font-size:60px;color:gold;");
    lo("%cJeśli ktoś powiedział Ci, żebyś coś skopiował i wkleił tutaj, to istnieje 1"+(new Date().getHours())+"0% szans na to, że próbuje Cię oszukać.", "font-size:20px");
    lo("%cWklejenie tu czegokolwiek może dać komuś dostęp do Twojego konta IFP i twoich wiadomości.", "font-size:20px;color:red");
    lo("%cDopóki nie rozumiesz dokładnie tego, co robisz, zamknij to okno i zachowaj bezpieczeństwo.", "font-size:20px");
}
logWarningPaste();
