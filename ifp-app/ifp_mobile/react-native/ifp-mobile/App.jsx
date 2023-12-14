import React from 'react';
import { WebView } from 'react-native-webview';
import NotificationModule from './NotificationModule';

const lo = console.log;

const ReactNativeApp = () => {
    const handleReceiveMessage = (event) => {
        let data = JSON.parse(event.nativeEvent.data);
        handleSendNotif(data)
    };
    
    NotificationModule.checkApplicationPermission();
    NotificationModule.initNotifications();
    
    const handleSendNotif = (data) => {
        switch(data.type){
            case "sendNotif":
                NotificationModule.showNotification("Nowa", data.msg);
            break;
        }
        console.log('Notyfikacja', data);
    };

    return (
        <WebView
            source={{ uri: 'http://192.168.0.15:1478/app' }}
            onMessage={e => handleReceiveMessage(e)}
        />
    );
}

export default ReactNativeApp;
