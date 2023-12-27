import { Notifications } from 'react-native-notifications';
import { PermissionsAndroid } from 'react-native';

const initNotifications = () => {
    const channelId = 'channel_ifp';
    const channelName = 'ifp channel';
    const channelDescription = 'ifp mobile channel';

    Notifications.getInitialNotification([
        {
            channelId,
            channelName,
            channelDescription,
            soundName: 'default',
            importance: 4, // IMPORTANCE_HIGH
            vibrate: true,
        },
    ]);

    Notifications.events().registerNotificationReceivedForeground(
        (notification, completion) => {
            console.log('Notification Received - Foreground', notification.payload);
            completion({ alert: true, sound: true, badge: false });
        }
    );

    Notifications.events().registerNotificationOpened(
        (notification, completion) => {
            console.log('Notification opened', notification.payload);
            completion();
        }
    );
};

const showNotification = (title, body) => {
    const notification = {
        title, body,
        category: "IFP_CATEGORY",
        userInfo: {},
        fireDate: new Date(),
    };

    Notifications.postLocalNotification(notification);
};

const checkApplicationPermission = async () => {
    if(Platform.OS === 'android'){
        try{
            await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            );
        }catch(error){
            lo(e)
        }
    }
};

export default {
    initNotifications,
    showNotification,
    checkApplicationPermission
};
