import React from 'react';
import { WebView } from 'react-native-webview';

function App(){
    return (
        <WebView
            // source={{ uri: 'https://ifp.ct8.pl/app' }}
            source={{ uri: 'http://192.168.0.15:1478/app' }}
            style={{ flex: 1, backgroundColor: "#333" }}
        />
    )
}

export default App;
