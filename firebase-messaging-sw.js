importScripts('https://www.gstatic.com/firebasejs/8.3.2/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/8.3.2/firebase-messaging.js');
importScripts('./firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyDq5Soku5RJjqYdwjIb9H0RIWf1cm5PLqw",
    authDomain: "crud-firebase-c180a.firebaseapp.com",
    databaseURL: "https://crud-firebase-c180a-default-rtdb.firebaseio.com",
    projectId: "crud-firebase-c180a",
    storageBucket: "crud-firebase-c180a.appspot.com",
    messagingSenderId: "400291194148",
    appId: "1:400291194148:web:848564d512bfa89ed7ffb1",
    measurementId: "G-TQZ3ET62VG"
});
const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(function(payload) {
    const notificationData = JSON.parse(payload.data.notification);
    var options = {
        body: notificationData.body,
        icon: notificationData.icon,
        vibrate: notificationData.vibrate,
        requireInteraction: notificationData.requireInteraction,
        data: {
            url: notificationData.actions.find(action => action.action === 'open').url,
        },
        dir: notificationData.dir,
        actions: notificationData.actions ?? [{
            action: 'open',
            title: 'Mở',
            url: window.location.href
        },
        {
            action: 'close',
            title: 'Hủy',
        }],
    };
    return self.registration.showNotification(notificationData.title, options);
});

self.addEventListener('push', function(event) {
    const pushData = event.data.json();
    const notificationData = JSON.parse(pushData.data.notification);
    var options = {
        body: notificationData.body,
        icon: notificationData.icon,
        vibrate: notificationData.vibrate,
        requireInteraction: notificationData.requireInteraction,
        data: {
            url: notificationData.actions.find(action => action.action === 'open').url,
        },
        dir: notificationData.dir,
        actions: notificationData.actions ?? [{
            action: 'open',
            title: 'Mở',
        },
        {
            action: 'close',
            title: 'Hủy',
        }],
    };
    event.waitUntil(
        self.registration.showNotification(notificationData.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
        try {
            const action = event.action;
            switch (action) {
                case 'close':
                    closeNotification();
                    break;
                case 'open':
                    openNotification();
                    break;
            }
        
            function openNotification(){
                const notificationDataString = event.notification.data;
                if (notificationDataString) {
                    const url = notificationDataString.url;
                    event.waitUntil(
                        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientsArr => {
                            const isWebOpen = clientsArr.some(client => client.url === url);
                            if (isWebOpen) {
                                clientsArr.forEach(client => {
                                    if (client.url === url) {
                                        return client.focus();
                                    }
                                });
                            } else {
                                return clients.openWindow(url);
                            }
                        })
                    );
                    event.notification.close();
                } 
            }

            function closeNotification(){
                event.notification.close();
            }
        } catch (error) {
    }
});

