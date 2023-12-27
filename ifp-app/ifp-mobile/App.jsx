import React, { useEffect } from 'react';
import { AppState, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import NotificationModule from './NotificationModule';
import messaging from '@react-native-firebase/messaging';
import axios from "axios";
import ExitApp from 'react-native-exit-app';

const lo = console.log;
const url = 
// "http://192.168.0.15:1478";
"https://ifp.ct8.pl";

const ReactNativeApp = () => {
    var webviewUrl;

    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if(nextAppState !== 'background') return;
            if(webviewUrl.endsWith('/app/')) ExitApp.exitApp();
        };
        const handleBackButton = () => {
            ExitApp.exitApp();
            return true;
        };
        AppState.addEventListener('change', handleAppStateChange);
        BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    }, []);

    async function requestUserPermission(){
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
        if(enabled) console.log('Authorization status:', authStatus);
    }

    const getToken = async () => {
        const token = await messaging().getToken();
        return token;
    }

    const registerApp = async (id, user) => {
        const token = await getToken();
        const res = await axios.post(url+"/notif-reg", {
            token,
            id,
            user
        });
        lo(res.data);
    }

    useEffect(() => {
        requestUserPermission();
    }, [])

    const handleReceiveMessage = (event) => {
        let data = JSON.parse(event.nativeEvent.data);
        switch(data.type){
            case "notif":
                handleSendNotif(data)
            break;
            case "firebase":
                registerApp(data._id, data.user);
            break;
        }
    };
    
    NotificationModule.checkApplicationPermission();
    NotificationModule.initNotifications();
    
    const handleSendNotif = (data) => {
        NotificationModule.showNotification(data.title, data.msg);
    };

    return (
        <WebView
            source={{ uri: url+'/app' }}
            onMessage={e => handleReceiveMessage(e)}
            onNavigationStateChange={(navState) => {
                webviewUrl = navState.url;
            }}
        />
    );
}

export default ReactNativeApp;
