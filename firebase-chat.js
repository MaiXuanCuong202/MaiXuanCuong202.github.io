import icons from "./icons.js";
import stickers from "./stickers.js";
import background from "./background.js";

(function ($) {
    "use strict"
    let AppChat = function AppChat(element, options, callback) {
        let appChat = this;
        this.element = element;
        this.$element = $(element);
        this.firebase = firebase;
        this.user;
        this.friend;
        this.serverKey = 'AAAAXTM25SQ:APA91bGUMi-K3DZ1gldEhDDIkvx9wnk8vhgTIsC5cfKhwxJduVijqxTQjsRON4ueiXCSDTLC7c5JxvRTxitM8WD7qF8KR6TSLQCnPfoc512o_S8aK_rwkmgLp6pE5RvC0VWHRO5db3Y0';
        this.uploadFileInput;
        this.messBlock = '';
        this.dataBody;
        this.actionAccount;
        this.actionListUsers;
        this.send;
        this.insertFeelingToMessage;
        this.lastMessage;
        this.listUserAction;
        this.listBackground;
        this.urlAvt;
        this.nameAvt;
        this.group;
        this.nameHeader;
        this.statusHeader;
        this.detailStatusHeaderUser = "Đang hoạt động";
        this.detailStatusHeaderGroup = "Đang hoạt động";
        this.avtFriend;
        this.listUsers;
        this.deviceTokenCurrent;
        this.opacity;
        this.render;
        this.messagesDbRef;
        this.groupDbRef;
        this.groupMessagesDbRef;
        this.usersDbRef;
        this.messagesAttachmentsRef;
        this.checkUploadFile;
        this.checkDeleteFile;
        this.dataIdReply;
        this.cssBackground;
        this.messageReply;
        this.intervalActiveStatus;
        this.intervalActiveStatusFriend;
        this.timeIntervalActiveStatus = (1000 * 60);
        this.checkReply = false;
        this.checkChatFriend = false;
        this.checkChatGroup = false;
        this.checkSendMess = true;
        this.arrayUsers = [];
        this.arrayGroup = [];
        this.arrayGroupAddUsers = [];
        this.arrayRemoveMemberFromGroup = [];
        this.arrayAddMemberFromGroup = [];
        this.arrayDeviceTokenGroup = [];
        this.chatListenersAdd = {};
        this.chatListenersChange = {};
        this.chatListenersRemove = {};
        this.chatGroupListenersAdd = {};
        this.chatGroupListenersChange = {};
        this.chatGroupListenersRemove = {};
    }
    AppChat.prototype = {
        _init: function _init() {
            let self = this;
            if (self.checkLogin()) {
                self.startListeningToChatUsers(function (chatItem) {
                    self.showListUser(chatItem);
                    self.showListGroupUsers(chatItem);
                });
                self.confirmPageReload();
                self.initChatApp();
                self.search();
                self.searchGroup();
                self.searchGroupUsers();
                self.initAddGroup();
                self.initRemoveMemberFromGroup();
                self.initAddMemberFromGroup();
                self.activeGroup();
                self.postButtonHandler();
                self.handelAddGroup();
                self.openFileDialog();
                self.showListIcons();
                self.showListSticker();
                self.initActionMessage();
                self.initActionGroup();
                self.initActionFriend();
                self.changeClassification();
                self.initPasteImage();
                self.showAvatar();
                self.initMusicSeenMessages();
                // self.initLanguage();
                self.removeElementHost000webhost();
                self.startListeningToGroup(function (chatItem) {
                    self.showListGroup(chatItem);
                });
            }
        },
        confirmPageReload: function () {
            let self = this;
            window.addEventListener('beforeunload', function (e) {
                (e || window.event).preventDefault();
                (e || window.event).returnValue = true;
                if (self.intervalActiveStatus) {
                    clearInterval(self.intervalActiveStatus);
                }
                if (self.intervalActiveStatusFriend) {
                    clearInterval(self.intervalActiveStatusFriend);
                }
                return true;
            });
        },
        checkLogin: function () {
            let self = this;
            self.user = JSON.parse(localStorage.getItem('userLogin'));
            if (!self.user) {
                window.location.href = 'login.html';
            } else {
                try {
                    let dataWithExpiration = self.user;
                    if (dataWithExpiration) {
                        var currentTime = new Date().getTime();
                        if (currentTime > dataWithExpiration.expirationDate) {
                            localStorage.removeItem('userLogin');
                            self.checkLogin();
                            return null;
                        }
                    }
                    self.initFirebase();
                    const query = self.usersDbRef.child(dataWithExpiration.data.id);
                    query.once('value', (snapshot) => {
                        if (snapshot.exists()) {
                            const user = snapshot.val();
                            user.id = snapshot.key;
                            self.user = user;
                            self.friend = user;
                            self.updateUserDeviceToken();
                            self.updateUserActiveStatus(self.user.id);
                            self.activeUser();
                        } else {
                            window.location.href = 'login.html';
                        }
                    });
                    return true;
                } catch (error) {
                    window.location.href = 'login.html';
                }
            }
        },
        removeElementHost000webhost: function () {
            var elements = document.querySelectorAll('div');
            elements.forEach(function (element) {
                if (element.innerHTML.includes('Hosted on free web hosting 000webhost.com')) {
                    element.remove();
                }
            });
        },
        initFirebase: function () {
            let config = {
                apiKey: "AIzaSyDq5Soku5RJjqYdwjIb9H0RIWf1cm5PLqw",
                authDomain: "crud-firebase-c180a.firebaseapp.com",
                databaseURL: "https://crud-firebase-c180a-default-rtdb.firebaseio.com",
                projectId: "crud-firebase-c180a",
                storageBucket: "crud-firebase-c180a.appspot.com",
                messagingSenderId: "400291194148",
                appId: "1:400291194148:web:848564d512bfa89ed7ffb1",
                measurementId: "G-TQZ3ET62VG"
            }
            this.firebase.initializeApp(config);
            this.usersDbRef = this.firebase.database().ref('users');
            this.messagesAttachmentsRef = this.firebase.storage().ref('attachments/');
        },
        startListeningToChatMessages: function (callback, user, friend) {
            let self = this;
            let chatId = this.generateChatId(user, friend);
            this.messagesDbRef = firebase.database().ref(`messages/${chatId}`);
            let listenerAdd = this.messagesDbRef.on('child_added', function (snapshot) {
                $('.user-sending').remove();
                let chatItem = snapshot.val();
                chatItem.id = snapshot.key;
                self.lastMessage = chatItem;
                if (chatItem.to == self.user.id) {
                    $('.user-sending').remove();
                    self.updateSendingMessage()
                }
                callback.call(this, chatItem);
            }.bind(this));
            self.chatListenersAdd[chatId] = listenerAdd;

            let listenerChange = this.messagesDbRef.on('child_changed', function (snapshot) {
                let chatItem = snapshot.val();
                chatItem.id = snapshot.key;
                self.lastMessage = chatItem;
                chatItem.feeling ? self.updateMessage(chatItem) : self.userSending();
                if (self.lastMessage.from == self.user.id) {
                    let text = `${self.friend.name} đã xem tin nhắn`;
                    self.readText(text);
                }
            });
            self.chatListenersChange[chatId] = listenerChange;
            let listenerRemove = this.messagesDbRef.on('child_removed', function (snapshot) {
                let chatItem = snapshot.val();
                chatItem.id = snapshot.key;
                if (self.dataIdReply == snapshot.key) {
                    $('#container-reply').remove();
                    self.dataIdReply = undefined;
                }
                self.deleteMessage(chatItem);
            });
            self.chatListenersRemove[chatId] = listenerRemove;
        },
        startListeningToGroup: function (callback) {
            let self = this;
            self.groupDbRef = self.firebase.database().ref(`groups`);
            self.groupDbRef.on('child_added', function (snapshot) {
                let group = snapshot.val();
                group.id = snapshot.key;
                callback.call(self, group);
            }.bind(self));

            this.groupDbRef.on('child_changed', function (snapshot) {
                let group = snapshot.val();
                group.id = snapshot.key;
                if (self.group?.id == snapshot.key) {
                    self.group = group;
                    self.arrayGroup[snapshot.key] = group;
                }
                if ($.inArray(self.user.id, group.members) >= 0) {
                    if ($(`#${group.id}`).length <= 0) {
                        self.arrayGroup[group.id] = group;
                        self.showListGroup(group);
                    }
                } else if ($.inArray(self.user.id, group.members) == -1) {
                    self.group = undefined;
                    if ($(`#${group.id}`).length > 0) {
                        self.deleteGroup(group);
                        self.resetChatRemoveGroup();
                    }
                }
            });
            this.groupDbRef.on('child_removed', function (snapshot) {
                let group = snapshot.val();
                group.id = snapshot.key;
                self.deleteGroup(group);
                self.offGroupDbRef(true);
                self.resetChatRemoveGroup();
            });
        },
        startListeningMessagesToGroup: function (callback, idChannel) {
            let self = this;
            self.groupMessagesDbRef = self.firebase.database().ref(`groups-messages/${idChannel}`);
            let listenerAdd = self.groupMessagesDbRef.on('child_added', function (snapshot) {
                let chatItem = snapshot.val();
                chatItem.id = snapshot.key;
                callback.call(self, chatItem);
            }.bind(self));
            self.chatGroupListenersAdd[idChannel] = listenerAdd;

            let listenerChange = this.groupMessagesDbRef.on('child_changed', function (snapshot) {
                let chatItem = snapshot.val();
                chatItem.id = snapshot.key;
                self.updateMessage(chatItem)
            });
            self.chatGroupListenersChange[idChannel] = listenerChange;
            let listenerRemove = this.groupMessagesDbRef.on('child_removed', function (snapshot) {
                let chatItem = snapshot.val();
                chatItem.id = snapshot.key;
                if (self.dataIdReply == snapshot.key) {
                    $('#container-reply').remove();
                    self.dataIdReply = undefined;
                }
                self.deleteMessage(chatItem);
            });
            self.chatGroupListenersRemove[idChannel] = listenerRemove;
        },
        generateChatId: function (user, friend) {
            let sortedIds = [user, friend].sort();
            return sortedIds.join('');
        },
        startListeningToChatUsers: function (callback) {
            let self = this;
            this.usersDbRef.on('child_added', function (snapshot) {
                let user = snapshot.val();
                user.id = snapshot.key;
                callback(user);
            }.bind(this));
            this.usersDbRef.on('child_changed', function (snapshot) {
                let user = snapshot.val();
                user.id = snapshot.key;
                // let deviceToken = snapshot.child('deviceToken').val();
                self.arrayUsers[snapshot.key] = user;
                if (self.user?.id == snapshot.key) {
                    self.user = user;
                    // localStorage.setItem('userLogin', JSON.stringify(user));
                    var expirationDate = new Date();
                    expirationDate.setDate(expirationDate.getDate() + 1);
                    var dataWithExpiration = {
                        data: user,
                        expirationDate: expirationDate.getTime()
                    };
                    localStorage.setItem('userLogin', JSON.stringify(dataWithExpiration));
                }
                if (self.friend?.id == snapshot.key) {
                    self.friend = user;
                    self.detailStatusHeaderUser = self.checkActiveStatus(self.friend.timeout);
                    self.statusHeader.html(self.detailStatusHeaderUser);
                }
                self.checkChangeSetting();
                self.checkBlockFriend();
                self.changeUser(snapshot.key, user.name);
            });
        },
        checkChangeSetting: function () {
            let self = this;
            if (self.user?.offNotifications) {
                if ($.inArray(self.friend.id, self.user.offNotifications) >= 0) {
                    $('#friend-notification-on').addClass('active');
                    $('#friend-notification-off').removeClass('active');
                } else {
                    $('#friend-notification-on').removeClass('active');
                    $('#friend-notification-off').addClass('active');
                }
            } else {
                $('#friend-notification-on').removeClass('active');
                $('#friend-notification-off').addClass('active');
            }
            if (self.user?.blockFriend) {
                if ($.inArray(self.friend.id, self.user.blockFriend) >= 0) {
                    $('#friend-block-off').addClass('active');
                    $('#friend-block-on').removeClass('active');
                } else {
                    $('#friend-block-off').removeClass('active');
                    $('#friend-block-on').addClass('active');
                }
            } else {
                $('#friend-block-off').removeClass('active');
                $('#friend-block-on').addClass('active');
            }
        },
        changeUser: function (id, name) {
            let self = this;
            $(`[data-id="${id}"] .name-friend`).html(name);
            if (self.friend?.id == id) {
                $('#name-header').html(name);
            }
        },
        pushChatItem: function (chatItem) {
            let self = this;
            this.messagesDbRef.push(chatItem);
            if (this.friend.deviceToken) {
                self.pushNotifications(chatItem);
            }
            $('#container-reply').remove();
            self.checkSendMess = true;
        },
        pushChatGroup: function (chatItem) {
            let self = this;
            this.groupMessagesDbRef.push(chatItem);
            if (self.group?.members && self.group.offNotifications) {
                self.group.members.forEach(function (member) {
                    if ($.inArray(member, self.group.offNotifications) < 0) {
                        if (self.arrayUsers[member] && self.arrayUsers[member].deviceToken) {
                            self.arrayDeviceTokenGroup = self.arrayDeviceTokenGroup.concat(Object.values(self.arrayUsers[member].deviceToken));
                        }
                    }
                });
            } else if (self.group?.members) {
                self.group.members.forEach(function (member) {
                    if (self.arrayUsers[member] && self.arrayUsers[member].deviceToken) {
                        self.arrayDeviceTokenGroup = self.arrayDeviceTokenGroup.concat(Object.values(self.arrayUsers[member].deviceToken));
                    }
                });
            }
            if (self.arrayDeviceTokenGroup) {
                self.pushNotificationsGroup(chatItem);
            }
            $('#container-reply').remove();
            self.checkSendMess = true;
        },
        pushGroup: function (group) {
            let self = this;
            $('#add-group').click();
            $('.add-to-group').html('Thêm').removeClass('active');
            self.arrayGroupAddUsers = [];
            self.groupDbRef.push(group);
        }
        ,
        uploadFileToStorage: function (file, callback) {
            let self = this;
            if (self.checkChatFriend && self.checkBlockFriend()) {
                alert(self.messBlock);
                return
            }
            if (!Array.isArray(file)) {
                file = [file];
            }
            let uploadTasks = [];
            function uploadItem(item) {
                return new Promise((resolve, reject) => {
                    let fileName = Math.random().toString(36).substring(10) + `.` + item.name.split('.').pop();
                    let filePath = 'Developer' + '/' + fileName;

                    if (self.checkChatGroup) {
                        filePath = `${self.group.id}/${fileName}`;
                    }

                    let uploadTask = self.messagesAttachmentsRef.child(filePath).put(item);
                    uploadTasks.push(uploadTask);

                    uploadTask.on(
                        self.firebase.storage.TaskEvent.STATE_CHANGED,
                        (snapshot) => {
                            let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            switch (snapshot.state) {
                                case self.firebase.storage.TaskState.PAUSED:
                                    break;
                                case self.firebase.storage.TaskState.RUNNING:
                                    break;
                            }
                        },
                        (error) => {
                            reject(error);
                        },
                        () => {
                            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                                callback(fileName, downloadURL);
                                resolve();
                            }).catch((error) => {
                                reject(error);
                            }).finally(() => {
                                let index = uploadTasks.indexOf(uploadTask);
                                if (index !== -1) {
                                    uploadTasks.splice(index, 1);
                                }
                            });
                        }
                    );
                });
            }

            let promises = file.map(uploadItem);

            Promise.all(promises)
                .then(() => {
                })
                .catch((error) => {

                })
                .finally(() => {
                    uploadTasks = [];
                });
        },
        uploadAvatarGroupToStorage: function (file) {
            let self = this;
            let fileName = Math.random().toString(36).substring(10) + `.` + file.name.split('.').pop();
            let filePath = 'avatar-group' + '/' + fileName;
            if (self.checkUploadFile) {
                self.checkUploadFile.cancel();
                self.checkUploadFile = null;
            }
            return new Promise(resolve => {
                self.checkUploadFile = self.messagesAttachmentsRef.child(filePath).put(file);
                self.checkUploadFile.on(
                    this.firebase.storage.TaskEvent.STATE_CHANGED,
                    (snapshot) => {
                        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        switch (snapshot.state) {
                            case self.firebase.storage.TaskState.PAUSED:
                                break;
                            case self.firebase.storage.TaskState.RUNNING:
                                break;
                        }
                    },
                    (error) => {
                        switch (error.code) {
                            case 'storage/unauthorized':
                                break;
                            case 'storage/canceled':
                                break;
                            case 'storage/unknown':
                                break;
                        }
                    },
                    () => {
                        self.checkUploadFile.snapshot.ref.getDownloadURL().then((downloadURL) => {
                            self.urlAvt = downloadURL;
                            self.nameAvt = fileName;
                            resolve();
                        }).catch((error) => {
                            //   console.log('Error getting download URL: ', error);
                        }).finally(() => {
                            self.checkUploadFile = null;
                        });
                    }
                );
            })
        },

        initChatApp: function () {
            let self = this;
            this.dataBody = $('#data-body');
            this.actionAccount = $('#action-logout, #logout');
            this.listUsers = $('#show-list');
            this.listGroupUsers = $('#list-group-users');
            this.listGroups = $('#show-list-group');
            this.nameHeader = $('#name-header');
            this.statusHeader = $('#status-header');
            this.avtFriend = $('#avt-friend');
            this.actionListUsers = $('#action-list-users');
            this.opacity = $('.opacity');
            this.listUserAction = $('.list-users-action');
            this.listBackground = $('.list-background');

            this.actionAccount.click(this.logout);
            this.opacity.click(this.showListUsers);
            this.actionListUsers.click(this.showListUsers);
            this.showListFeelings();

            $(document).on('click', '#show-list-icon .em', function (e) {
                self.insertElement(this);
            })
            $(document).on('click', '#show-list-sticker .stickers', function (e) {
                self.insertElementSticker(this);
            })
            $(document).on('click', '#show-list-feelings .em, .opacity-feeling', function (e) {
                self.insertFeelings(this);
            })
            $(document).on('click', '#add-group', function (e) {
                $('.add-group').toggleClass('active');
                self.actionListUsers.click();
            })
            $(document).on('click', '#close-add-group', function (e) {
                $('.add-group').removeClass('active');
                self.actionListUsers.click();
            })

        },
        renderChatItem: function (chatItem) {
            let el = this;
            if (chatItem.from == this.user.id) {
                this.renderFromMessage(chatItem)
            }
            else {
                this.renderToMessage(chatItem)
            }
            $('#data-body').ready(function () {
                clearTimeout(el.render)
                el.render = setTimeout(() => {
                    // $('#data-body').animate({ scrollTop: document.querySelector("#data-body").scrollHeight + 1000 }, "slow");
                    $('#data-body').scrollTop($('#data-body')[0].scrollHeight);
                }, 1000);
            })
        },
        renderFromMessage: function (messages, action = 'append') {
            let row = `<div id="location-mess${messages.id}" class="me uk-grid-small uk-flex-bottom uk-flex-right uk-text-right ${messages.id}" data-id="${messages.id}" uk-grid>
            <div class="uk-width-auto">
                <div  class="uk-card ${messages.file ? "" : 'uk-card-body uk-card-small uk-card-primary'} uk-border-rounded">
                
                    <p class="uk-margin-remove" >${messages.msg?.trim()}</p>
                    <div class="feelings-right feelings${messages.id}">
                    ${messages.feeling ? messages.feeling : ""}
                    </div>
                </div>
            </div>
            <div class="timestamp">${messages.timestamp}</div>
        </div>
        `
            action == 'prepend' ? this.dataBody.prepend(row) : this.dataBody.append(row);
        },
        renderToMessage: function (messages, action = 'append') {
            let row = `<div id="location-mess${messages.id}" class="guest uk-grid-small uk-flex-bottom uk-flex-left ${messages.id}" data-id="${messages.id}" uk-grid>
            <div class="uk-width-auto">
                <img class="uk-border-circle" width="40" height="40"  src="${this.friend.avatar}">
            </div>
            <div class="uk-width-auto">
                <div class="uk-card ${messages.file ? "" : 'uk-card-body uk-card-small uk-card-start'} uk-border-rounded">
                    <p class="uk-margin-remove" >${messages.msg?.trim()}</p>
                    <div class="feelings-left feelings${messages.id}">
                    ${messages.feeling ? messages.feeling : ""}
                    </div>
                </div>
                <span uk-icon="heart" class="express-feelings" data-id="${messages.id}"></span>
           
            </div>
            <div class="timestamp start">${messages.timestamp}</div>
        </div>
        `
            action == 'prepend' ? this.dataBody.prepend(row) : this.dataBody.append(row);
        },
        renderChatGroupItem: function (chatItem) {
            let self = this;
            if (chatItem.from == self.user.id) {
                self.renderFromGroupMessage(chatItem)
            }
            else {
                self.renderToGroupMessage(chatItem)
            }
            $('#data-body').ready(function () {
                clearTimeout(self.render)
                self.render = setTimeout(() => {
                    // $('#data-body').animate({ scrollTop: document.querySelector("#data-body").scrollHeight + 1000 }, "slow");
                    $('#data-body').scrollTop($('#data-body')[0].scrollHeight);
                }, 400);
            })
        },
        renderFromGroupMessage: function (messages, action = 'append') {
            let row = `<div id="location-mess${messages.id}" class="me uk-grid-small uk-flex-bottom uk-flex-right uk-text-right ${messages.id}" data-id="${messages.id}" uk-grid>
            <div class="uk-width-auto">
                <div  class="uk-card ${messages.file ? "" : 'uk-card-body uk-card-small uk-card-primary'} uk-border-rounded">
                
                    <p class="uk-margin-remove" >${messages.msg?.trim()}</p>
                    <div class="feelings-right group feelings${messages.id}">
                    ${messages.feeling ? Array.isArray(messages.feeling) ? messages.feeling.join(' ') : [messages.feeling].join(' ') : ""}
                    </div>
                </div>
            </div>
            <div class="timestamp">${messages.timestamp}</div>
        </div>
        `
            action == 'prepend' ? this.dataBody.prepend(row) : this.dataBody.append(row);
        },
        renderToGroupMessage: function (messages, action = 'append') {
            let row = `<div id="location-mess${messages.id}" class="guest uk-grid-small uk-flex-bottom uk-flex-left ${messages.id}" data-friend="${messages.from}" data-id="${messages.id}" uk-grid>
            <div class="uk-width-auto">
                <img class="uk-border-circle" width="40" height="40"  src="${this.arrayUsers[messages.from].avatar}">
            </div>
            <div class="uk-width-auto">
                <div class="uk-card ${messages.file ? "" : 'uk-card-body uk-card-small uk-card-start'} uk-border-rounded">
                    <p class="uk-margin-remove" >${messages.msg?.trim()}</p>
                    <div class="feelings-left group feelings${messages.id}">
                    ${messages.feeling ? Array.isArray(messages.feeling) ? messages.feeling.join(' ') : [messages.feeling].join(' ') : ""}
                    </div>
                </div>
                <span uk-icon="heart" class="express-feelings" data-id="${messages.id}"></span>
           
            </div>
            <div class="timestamp start">${messages.timestamp}</div>
        </div>
        `
            action == 'prepend' ? this.dataBody.prepend(row) : this.dataBody.append(row);
        },

        postButtonHandler: function () {
            let self = this;
            $(document).on('click', '#send', function () {
                let messages = $('#text-messages');
                let msgText = messages.val().trim();
                if (msgText && msgText != '' && (self.friend || self.group)) {
                    msgText = msgText.replace(/\n/g, '<br>');
                    if (self.checkReply) {
                        self.pushChatMessage(self.messageReply + `<p class="rep">${msgText}</p>`);
                        $('#container-reply').remove();
                        self.checkReply = false;
                    }
                    else {
                        self.pushChatMessage(msgText);
                    }
                    messages.val('');
                } else {
                    $('.container-image').children().length > 0 > 0 ? "" : alert('Hãy nhập tin nhắn');
                    self.checkSendMess = true;
                    return;
                }
                messages.css('height', '100%');
            });
        },
        handelAddGroup: function () {
            let self = this;
            $(document).on('click', '#added-group', function () {
                let group = $('#name-group').val()?.trim();
                if (group && group != '' && group.length <= 25 && $('#imgInp').val()) {
                    let timestamp = new Date(Date.now()).toLocaleString();
                    if ($.inArray(self.user.id, self.arrayGroupAddUsers) < 0) {
                        self.arrayGroupAddUsers.push(self.user.id);
                    }
                    (async () => {
                        await self.uploadAvatarGroupToStorage($('#imgInp')[0].files[0]);
                        self.pushGroup({
                            owner: self.user.id,
                            members: self.arrayGroupAddUsers,
                            accessLevel: 'private',
                            name: group,
                            nameAvt: self.nameAvt,
                            avatar: self.urlAvt,
                            timestamp: timestamp
                        });
                        $('#name-group').val('');
                        $('#imgInp').val(null);
                        $('#blah').attr('src', '');
                    })()

                } else {
                    let mess = group == '' ? 'Hãy nhập tên nhóm' : group.length > 25 ? "Tên nhóm không được quá 25 ký tự" : "Hãy chọn ảnh đại diện";
                    alert(mess);
                    return;
                }
            });
        }
        ,
        pushChatMessage: function (msgText, file = null) {
            let self = this;
            let timestamp = new Date(Date.now()).toLocaleString();
            if (this.checkChatFriend && !this.checkBlockFriend()) {
                this.pushChatItem({
                    from: this.user.id,
                    to: this.friend.id,
                    msg: msgText,
                    file: file,
                    timestamp: timestamp
                });
            } else if (this.checkChatGroup) {
                this.pushChatGroup({
                    from: this.user.id,
                    to: this.group.id,
                    msg: msgText,
                    file: file,
                    timestamp: timestamp
                });
            } else {
                self.checkSendMess = true;
                alert(self.messBlock);
            }
        },
        openFileDialog: function () {
            let self = this;
            let inputFile = $('#file_input');
            $(document).on('click', '#file_anchor', function (e) {
                inputFile.click();
                inputFile.change(self.uploadFile.bind(self))
            })

        },
        uploadFile: function (filed = null) {
            let self = this;
            if ($('#file_input')[0]?.files[0]?.name || filed[0].name) {

                if (self.checkReply) {
                    self.uploadFileToStorage($('#file_input')[0]?.files[0]?.name ? $('#file_input')[0].files[0] : filed, (fileName, downloadURL) => {
                        let attachmentText = self.messageReply + `
                                <img class="message-image" src="${downloadURL}" onclick="openImageFullscreen(this) ">
                            `;
                        $('#container-reply').remove();
                        self.pushChatMessage(attachmentText, fileName);
                        self.checkReply = false;
                        $('#file_input').val('');

                    });
                } else {
                    let action = self.uploadFileToStorage($('#file_input')[0]?.files[0]?.name ? $('#file_input')[0].files[0] : filed, (fileName, downloadURL) => {
                        let attachmentText = `
                                <img class="message-image" src="${downloadURL}" onclick="openImageFullscreen(this) ">
                            `;
                        self.pushChatMessage(attachmentText, fileName);
                        $('#file_input').val('');

                    });
                }
            }


        },
        logout: function () {
            localStorage.clear();
            window.location.reload();
        },
        showListUser: function (user) {
            this.arrayUsers[user.id] = user;
            let html = `
             <div class="friend uk-card-header uk-padding-header ${this.user.id == user.id ? 'active' : ""}" data-id="${user.id}">
               <img class="uk-border-circle avt-main-chat" width="40" height="40" src="${user.avatar}">
               <b class="name-friend">${user.name}</b>
             </div>
             `
            this.listUsers.append(html);
        },
        showListGroupUsers: function (user) {
            let html = `
             <div class="uk-card-header uk-padding-header" data-id="${user.id}">
               <img class="uk-border-circle avt-main-chat" width="40" height="40" src="${user.avatar}">
               <b class="name-friend">${user.name}</b>
               <button class="btn-primary add-to-group" data-id="${user.id}">Thêm</button>
             </div>
             `
            this.listGroupUsers.append(html);
        },
        showListGroup: function (group) {
            let self = this;
            if (group.members) {
                if ($.inArray(self.user.id, group.members) >= 0) {
                    this.arrayGroup[group.id] = group;
                    let html = `
                     <div class="group uk-card-header uk-padding-header ${this.group?.id == group.id ? 'active' : ""}" id="${group.id}" data-id="${group.id}">
                       <img class="uk-border-circle avt-main-chat" width="40" height="40" src="${group.avatar}">
                       <b class="name-group">${group.name}</b>
                     </div>
                     `
                    this.listGroups.append(html);
                }
            }
        },
        activeUser: function () {
            let self = this;
            $(document).ready(function () {
                self.checkChatFriend = true;
                self.nameHeader.html(self.friend.name);
                self.avtFriend.attr('src', self.friend.avatar);
                self.startListeningToChatMessages(self.renderChatItem, self.user.id, self.friend.id);
                if (self.friend.id == self.user.id) {
                    $('.pencil').addClass('active');
                    $('.trash').addClass('active');
                    $('.pencil.active').attr('data-id', self.user.id);
                    $('.trash.active').attr('data-id', self.user.id);
                }
                document.title = self.friend.name;
                self.checkBlockFriend();
                $('#action-setting-friend').addClass('active');
                $(document).on('click', '.friend', function () {
                    if ($(this).data('id') != self.friend?.id) {
                        if (self.intervalActiveStatusFriend) {
                            clearInterval(self.intervalActiveStatusFriend);
                        }
                        $('#confirm-action-message').removeClass('active');
                        $('#action-setting-group').removeClass('active');
                        $('#action-setting-friend').addClass('active');
                        $('.friend').removeClass('active');
                        $('.group').removeClass('active');
                        $('#container-reply').remove();
                        self.checkReply = false;
                        self.checkChatFriend = true;
                        self.checkChatGroup = false;
                        $('#data-body').html('');
                        self.offFriendDbRef();
                        self.offGroupDbRef(true);
                        self.friend = self.arrayUsers[$(this).data('id')];
                        self.nameHeader.html(self.friend.name);
                        document.title = self.friend.name;
                        self.avtFriend.attr('src', self.friend.avatar);
                        self.detailStatusHeaderUser = self.checkActiveStatus(self.friend.timeout);
                        self.statusHeader.html(self.detailStatusHeaderUser);
                        self.intervalActiveStatusFriend = setInterval(() => {
                            self.detailStatusHeaderUser = self.checkActiveStatus(self.friend.timeout);
                            self.statusHeader.html(self.detailStatusHeaderUser);
                        }, self.timeIntervalActiveStatus);
                        self.startListeningToChatMessages(self.renderChatItem, self.user.id, self.friend.id);
                        $(this).addClass('active');
                        self.showListUsers();
                        $('.opacity-feeling').removeClass('active');
                        $('#show-list-feelings').removeClass('active');
                        $('#show-list-sticker').removeClass('active');
                        $('#show-list-icon').removeClass('active');
                        $('.block').removeClass('active').html('');
                        $('.pencil').removeClass('active');
                        $('.trash').removeClass('active');
                        if (self.friend.id == self.user.id) {
                            $('.pencil').addClass('active');
                            $('.trash').addClass('active');
                            $('.pencil.active').attr('data-id', self.user.id);
                            $('.trash.active').attr('data-id', self.user.id);
                        }
                        self.checkBlockFriend();
                        setTimeout(() => {
                            self.updateSendingMessage();
                        }, 1);
                    }
                });

                $(document).on('click', '.pencil.active', function () {
                    self.nameHeader.attr('contenteditable', 'true').focus();
                })

                $(document).on('click', '.trash.active', function () {
                    self.clearDeviceToken();
                })

                document.getElementById('name-header').addEventListener('keydown', function (event) {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        return;
                    }
                });

                self.nameHeader.on('blur', function () {
                    if ($(this).text().trim() != self.user.name) {
                        self.saveName($(this).text(), self.user.id);
                    }
                    $(this).text($(this).text().trim());
                    $(this).attr('contenteditable', 'false');
                });
            });
        },
        activeGroup: function () {
            let self = this;
            $(document).ready(function () {
                $(document).on('click', '#show-list-group .group', function () {
                    $('.add-group').removeClass('active')
                    let groupId = $(this).data('id');
                    if (groupId != self.group?.id) {
                        self.checkChatFriend = false;
                        self.checkChatGroup = true;
                        $('.pencil').removeClass('active');
                        $('.trash').removeClass('active');
                        $('#confirm-action-message').removeClass('active');
                        $('.block').removeClass('active').html('');
                        $('#action-setting-group').addClass('active');
                        $('#action-setting-friend').removeClass('active');
                        self.offGroupDbRef();
                        self.offFriendDbRef(true);
                        self.arrayDeviceTokenGroup = [];
                        self.group = self.arrayGroup[groupId];
                        if (self.group.owner == self.user.id) {
                            $('li[data-action="destroy-group"]').addClass('active');
                            $('li[data-action="remove-member"]').addClass('active');
                        } else {
                            $('li[data-action="destroy-group"]').removeClass('active');
                            $('li[data-action="remove-member"]').removeClass('active');
                        }
                        $('.friend').removeClass('active');
                        $('.group').removeClass('active');
                        $('#container-reply').remove();
                        self.checkReply = false;
                        $('#data-body').html('');
                        self.nameHeader.html(self.group.name);
                        document.title = self.group.name;
                        self.statusHeader.html(self.detailStatusHeaderGroup);
                        self.avtFriend.attr('src', self.group.avatar);
                        self.startListeningMessagesToGroup(self.renderChatGroupItem, groupId);
                        $(this).addClass('active');
                        self.showListUsers();
                        $('.opacity-feeling').removeClass('active');
                        $('#show-list-feelings').removeClass('active');
                        $('#show-list-sticker').removeClass('active');
                        $('#show-list-icon').removeClass('active');
                        setTimeout(() => {
                            // self.updateSendingMessage();
                        }, 1);
                    }

                });
            });
        },
        saveName: function (name, id) {
            let self = this;
            self.usersDbRef.child(id).update({
                name: name.trim()
            });
        },
        checkActiveStatus(timestamp) {
            const currentTime = Date.now();
            const timeDifference = currentTime - timestamp;
            const minutes = Math.floor(timeDifference / 60000);
            const hours = Math.floor(minutes / 60);
            if (minutes < 2) {
                return 'Đang hoạt động';
            } else if (minutes < 60) {
                return `Hoạt động ${minutes} phút trước`;
            } else if (hours < 24) {
                return `Hoạt động ${hours} giờ trước`;
            } else {
                const date = new Date(timestamp);
                const day = date.getDate();
                const month = date.getMonth() + 1;
                const year = date.getFullYear();
                return `Hoạt động ngày ${day}/${month}/${year}`;
            }
        },
        showListUsers: function () {
            $('.list-users').toggleClass('active');
            $('.opacity').toggleClass('active');
        },
        search: function () {
            $("#search-input").on("input", function () {
                let value = $(this).val().toLowerCase();
                $("#show-list div").filter(function () {
                    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                });
            });
        },
        searchGroup: function () {
            $("#search-input").on("input", function () {
                let value = $(this).val().toLowerCase();
                $("#show-list-group .group").filter(function () {
                    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                });
            });
        },
        searchGroupUsers: function () {
            $("#search-users-group").on("input", function () {
                let value = $(this).val().toLowerCase();
                $("#list-group-users div").filter(function () {
                    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                });
            });
        },
        updateUserDeviceToken: function () {
            let self = this;
            if (this.firebase.messaging.isSupported()) {
                const messaging = this.firebase.messaging();
                messaging
                    .requestPermission()
                    .then(function () {
                        return messaging.getToken()
                    })
                    .then(function (response) {
                        self.deviceTokenCurrent = response;
                        const deviceTokenRef = self.firebase.database().ref(`users/${self.user.id}/deviceToken`);
                        deviceTokenRef.once('value', snapshot => {
                            let existingTokens = snapshot.val() || {};
                            if (!Object.values(existingTokens).includes(response)) {
                                const newTokenKey = deviceTokenRef.push().key;
                                let updates = {};
                                updates[`${newTokenKey}`] = response;
                                deviceTokenRef.update(updates);
                            }
                        });
                    }).catch(function (error) {
                        // console.log(error);
                    });
            }
        },
        clearDeviceToken: function () {
            let self = this;
            if (self.deviceTokenCurrent) {
                const deviceTokenRef = self.firebase.database().ref(`users/${self.user.id}/deviceToken`);
                deviceTokenRef.once('value', snapshot => {
                    let existingTokens = snapshot.val() || {};
                    for (const tokenKey in existingTokens) {
                        if (existingTokens.hasOwnProperty(tokenKey)) {
                            const token = existingTokens[tokenKey];
                            if (token !== self.deviceTokenCurrent) {
                                deviceTokenRef.child(tokenKey).remove();
                            }
                        }
                    }
                });
            }
        },
        updateUserActiveStatus: function (key) {
            let self = this;
            self.updateTimeout(key);
            self.intervalActiveStatus = setInterval(() => {
                self.updateTimeout(key);
            }, self.timeIntervalActiveStatus);
        },
        updateTimeout(key) {
            let self = this;
            self.usersDbRef.child(key).update({
                timeout: new Date(Date.now()).getTime()
            });
        },
        pushNotifications: function (chatItem = true) {
            let self = this;
            if ($.inArray(self.user.id, self.friend?.offNotifications) < 0 || self.friend.offNotifications == undefined) {
                if (self.friend?.deviceToken) {
                    const serverKey = self.serverKey;
                    const deviceToken = Object.values(self.friend?.deviceToken);
                    let message;
                    if (chatItem === true) {
                        message = "Đã thu hồi một tin nhắn";
                    } else {
                        if (!chatItem.feeling) {
                            message = chatItem.file == null ? chatItem.msg.includes('<i class="em') ? "Đã gửi một cảm xúc" : chatItem.msg : "Đã gửi một ảnh";
                            message = chatItem.msg.includes('container-reply-ok') ? "Đã trả lời một tin nhắn" : message;
                        } else {
                            message = "Đã bày tỏ cảm xúc một tin nhắn";
                        }
                    }
                    const notification = {
                        title: self.user.name,
                        body: message,
                        icon: self.user.avatar,
                        vibrate: [100, 50, 100],
                        requireInteraction: true,
                        dir: "rtl",
                        actions: [{
                            action: 'open',
                            title: 'Mở ứng dụng',
                            url: window.location.href
                        },
                        {
                            action: 'close',
                            title: 'Hủy bỏ',
                        }]
                    };

                    const payload = {
                        registration_ids: deviceToken,
                        data: {
                            notification: JSON.stringify(notification)
                        }
                    };
                    fetch('https://fcm.googleapis.com/fcm/send', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'key=' + serverKey,
                        },
                        body: JSON.stringify(payload),
                    })
                        .then(response => response.json())
                        .then(data => {
                            // console.log('Thông báo đã được gửi thành công:', data);
                        })
                        .catch(error => {
                            // console.log('Lỗi khi gửi thông báo:', error);
                        });
                }
            }
        },
        pushNotificationsGroup: function (chatItem = true) {
            let self = this;
            if (self.arrayDeviceTokenGroup.length > 0) {
                const serverKey = self.serverKey;
                let message;
                if (chatItem === true) {
                    message = "Đã thu hồi một tin nhắn";
                } else {
                    if (!chatItem.feeling) {
                        message = chatItem.file == null ? chatItem.msg.includes('<i class="em') ? "Đã gửi một cảm xúc" : chatItem.msg : "Đã gửi một ảnh";
                        message = chatItem.msg.includes('container-reply-ok') ? "Đã trả lời một tin nhắn" : message;
                    } else {
                        message = "Đã bày tỏ cảm xúc một tin nhắn";
                    }
                }
                const notification = {
                    title: `${self.user.name} Từ nhóm ${self.group.name}`,
                    body: message,
                    icon: self.user.avatar,
                    vibrate: [100, 50, 100],
                    requireInteraction: true,
                    dir: "rtl",
                    actions: [{
                        action: 'open',
                        title: 'Mở ứng dụng',
                        url: window.location.href
                    },
                    {
                        action: 'close',
                        title: 'Hủy bỏ',
                    }]
                };

                const payload = {
                    registration_ids: self.arrayDeviceTokenGroup,
                    data: {
                        notification: JSON.stringify(notification)
                    }
                };
                fetch('https://fcm.googleapis.com/fcm/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'key=' + serverKey,
                    },
                    body: JSON.stringify(payload),
                })
                    .then(response => response.json())
                    .then(data => {
                        self.arrayDeviceTokenGroup = [];
                    })
                    .catch(error => {
                    });
            }
        },
        showListIcons: function () {
            $.each(icons, function (i, item) {
                $('#show-list-icon').append(item);
            });
            $(document).on('click', '#list-icon', function (e) {
                $('#show-list-sticker').removeClass('active');
                $('#show-list-icon').toggleClass('active');
            })
        },
        showListSticker: function () {
            $.each(stickers, function (i, item) {
                $('#show-list-sticker').append(item);
            });
            $(document).on('click', '#list-sticker', function (e) {
                $('#show-list-icon').removeClass('active');
                $('#show-list-sticker').toggleClass('active');
            })
        },
        insertElement: function (element) {
            let self = this;
            if (self.checkReply && !self.checkBlockFriend()) {
                self.pushChatMessage(self.messageReply + element.outerHTML);
                $('#show-list-icon').toggleClass('active');
                self.checkReply = false;
            } else if (!self.checkBlockFriend()) {
                self.pushChatMessage(element.outerHTML);
                $('#show-list-icon').toggleClass('active');
            } else {
                alert(self.messBlock)
            }
        },
        insertElementSticker: function (element) {
            let self = this;
            if (self.checkReply && !self.checkBlockFriend()) {
                self.pushChatMessage(self.messageReply + element.outerHTML, true);
                $('#show-list-sticker').toggleClass('active');
                self.checkReply = false;
            } else if (!self.checkBlockFriend()) {
                self.pushChatMessage(element.outerHTML, true);
                $('#show-list-sticker').toggleClass('active');
            } else {
                alert(self.messBlock)
            }
        },
        insertFeelings: async function (element) {
            let self = this;
            let elementCopy = element.cloneNode(true);
            let updates = {};
            if ($('#show-list-feelings').hasClass('active') && !$(elementCopy).hasClass('opacity-feeling')) {
                if (self.checkChatFriend && !self.checkBlockFriend()) {
                    $(`.feelings${self.insertFeelingToMessage}`).html(elementCopy);
                    let chatId = this.generateChatId(self.user.id, self.friend.id);
                    updates[`messages/${chatId}/${self.insertFeelingToMessage}/feeling`] = elementCopy.outerHTML;
                    self.firebase.database().ref().update(updates);
                } else if (self.checkChatGroup) {
                    $(`.feelings${self.insertFeelingToMessage}`).html(elementCopy);
                    let chatId = self.group.id;
                    try {
                        let ref = self.firebase.database().ref(`groups-messages/${chatId}/${self.insertFeelingToMessage}/feeling`);
                        let snapshot = await ref.once('value');
                        let feelings = snapshot.val() || [];
                        feelings.push(elementCopy.outerHTML);
                        let updates = {};
                        updates[`groups-messages/${chatId}/${self.insertFeelingToMessage}/feeling`] = feelings;
                        await self.firebase.database().ref().update(updates);
                    } catch (error) {
                        // console.error('Lỗi khi truy cập dữ liệu từ Firebase:', error);
                    }
                } else {
                    alert(self.messBlock)
                }
            }
            $('.opacity-feeling').toggleClass('active');
            $('#show-list-feelings').toggleClass('active');
        }
        ,
        showListFeelings: function () {
            let self = this;
            $.each(icons, function (i, item) {
                $('#show-list-feelings').append(item);
            });

            $(document).on('click', '.express-feelings', function (e) {
                $('#show-list-feelings').toggleClass('active');
                $('.opacity-feeling').toggleClass('active');
                self.insertFeelingToMessage = $(this).data('id') ?? undefined

            });
        },
        updateMessage: function (message) {
            let self = this;
            $(`.feelings${message.id}`).html(message.feeling);
            self.checkChatFriend ? self.pushNotifications(message) : self.pushNotificationsGroup(message);
        },
        recallMessage: function (message) {
            let self = this;
            if (self.checkChatFriend) {
                let chatId = this.generateChatId(self.user.id, self.friend.id);
                let messageRef = firebase.database().ref(`messages/${chatId}/${message}`);
                messageRef.remove();
            } else if (self.checkChatGroup) {
                let chatId = self.group.id;
                let messageRef = firebase.database().ref(`groups-messages/${chatId}/${message}`);
                messageRef.remove();
            }
        },
        replyMessage: function (message, id) {
            let self = this;
            let icon = ($(message).find('.uk-border-rounded > .em').prop('outerHTML') || $(message).find('.uk-margin-remove > .em').prop('outerHTML'));
            let image, friend;
            if (self.checkChatFriend) {
                friend = $(message).hasClass('me') ? self.user.name : self.friend.name
            } else if (self.checkChatGroup) {
                friend = $(message).hasClass('me') ? self.user.name : self.arrayUsers[$(message).data('friend')].name
            }
            image = $(message).find('.stickers').length ? $(message).find('.stickers').prop('outerHTML') : $(message).find('.message-image') ? $(message).find('.message-image').prop('outerHTML') : $(message).find('.uk-border-rounded img').prop('outerHTML');
            let messageText = image == undefined ? $(message).find('.uk-margin-remove').text() ? $(message).find('.uk-margin-remove').text() : $(message).find('.rep').text() : '[Hình ảnh]';
            messageText = icon ? $(message).find('.uk-border-rounded .em').prop('outerHTML') : messageText;
            image = $(image).attr('src');
            let html = `
            <div id="container-reply" data-id="${id}">
                <div id="content-reply">
                    <div id="reply">
                    ${image != undefined ? `<div id="image"><img src="${image}"></div>` : ""}
                        <div id="friend">
                            Trả lời <b>${friend}</b>
                        </div>
                    <div id="message">${messageText}</div>
                </div>
                <span uk-icon="close" id="close-reply"></span>
                </div>            
            </div> `
            $('#form').prepend(html);
            html = `
            <div id="container-reply-ok" data-id="${id}">
                <div id="content-reply">
                    <div id="reply-ok">
                    ${image != undefined ? `<a href="#location-mess${id}"><div id="image"><img src="${image}" onerror="this.src='https://lvrgroup.vn/wp-content/uploads/2021/08/id-loading-1.gif';"></div></a>` : ""}
                        <div id="friend${image != undefined ? "-image" : ''}">
                            Trả lời <b>${friend}</b>
                        </div>
                        <a href="#location-mess${id}"><div id="message${icon ? "-icon" : image ? "-image" : ""}">${messageText}</div></a>
                </div>
                </div>            
            </div> `
            self.messageReply = html;

        },
        deleteMessage: function (chatItem) {
            let self = this;
            self.checkDeleteFile = true;
            self.checkChatFriend ? self.pushNotifications(true) : "";
            $(`.${chatItem.id}`).remove();
            if (chatItem.file && self.user.id == chatItem.from && self.checkDeleteFile) {
                self.checkDeleteFile = false;
                let filePath = `/attachments/Developer/${chatItem.file}`
                self.firebase.storage().ref().child(filePath).delete().then(function () {
                    self.checkDeleteFile = true;
                }).catch(function (error) { });;
            }
        },
        deleteGroup: function (group) {
            let self = this;
            self.dataBody.html('');
            $(`#${group.id}`).remove();
        },
        updateGroup: function (group) {
            // let self = this;
            // $(`#${group.id}`).remove();
        },
        initActionMessage: function () {
            let self = this;
            $(document).on('dblclick contextmenu', '.me, .guest', function (e) {
                e.preventDefault();
                let $actionButton = $(this).find('.action');
                if ($actionButton.length === 0) {
                    let me = $(this).hasClass('me');
                    let guest = $(this).hasClass('guest');
                    if (me || guest) {
                        let _this = this;
                        $('.action-recall').remove();
                        let dataId = $(this).data('id');
                        $('#confirm-action-message').removeClass('active');
                        $(this).find('.uk-margin-remove').prepend(`<span data-id="${dataId}" class="action-recall" uk-icon="more"></span>`);
                        self.offDocuments('click', `.action-recall[data-id="${dataId}"]`);
                        $(document).on('click', `.action-recall[data-id="${dataId}"]`, function () {
                            $('#confirm-action-message').toggleClass('active');
                            let html = me ? ` <ul> <li id="reply">Trả lời</li> <li id="recall">Thu hồi </li> </ul> ` : '<ul> <li id="reply">Trả lời</li></ul> ';
                            $('#confirm-action-message').html(html);
                            self.offDocuments('click', '#recall')
                            $(document).on('click', '#recall', function () {
                                self.recallMessage(dataId);
                                $('#confirm-action-message').removeClass('active');
                                $('.action-recall').remove();
                                self.checkReply = false;
                                if ($('#container-reply')?.data('id') == dataId) {
                                    $('#container-reply').remove();
                                }
                            })
                            self.offDocuments('click', '#reply')
                            $(document).on('click', '#reply', function () {
                                $('#container-reply').remove();
                                self.checkReply = true;
                                $('#text-messages').focus();
                                self.dataIdReply = dataId
                                self.replyMessage(_this, dataId);
                                $('#confirm-action-message').removeClass('active');
                                $('.action-recall').remove();
                            })
                            self.offDocuments('click', '#close-reply');
                            $(document).on('click', '#close-reply', function () {
                                self.checkReply = false;
                                self.dataIdReply = undefined;
                                $('#container-reply').remove();
                            })
                        });
                    }
                }
            });
        },
        initActionGroup: function () {
            let self = this;
            $(document).on('click', '#action-setting-group', function (e) {
                $('#show-setting-group').addClass('active');
                if (self.group.offNotifications) {
                    if ($.inArray(self.user.id, self.group.offNotifications) >= 0) {
                        $('#notification-on').addClass('active');
                        $('#notification-off').removeClass('active');
                    } else {
                        $('#notification-on').removeClass('active');
                        $('#notification-off').addClass('active');
                    }
                } else {
                    $('#notification-on').removeClass('active');
                    $('#notification-off').addClass('active');
                }
            });
            $(document).on('click', '#show-setting-group [uk-icon="close"]', function (e) {
                $('#show-setting-group').removeClass('active');
            })
            $(document).on('click', '.action-setting-group', function (e) {
                switch ($(this).data('action')) {
                    case 'notification':
                        self.groupSettingNotifications($(this).data('act'));
                        break;
                    case 'add-member':
                        self.groupAddMember();
                        break;
                    case 'remove-member':
                        self.groupRemoveMember();
                        break;
                    case 'list-members':
                        self.groupShowListMembers();
                        break;
                    case 'leave-group':
                        self.leaveGroup();
                        break;
                    case 'destroy-group':
                        self.destroyGroup();
                        break;
                    case 'change-background':
                        self.changeBackground();
                        break;
                }
                $('#show-setting-group').removeClass('active');
            })
        },
        groupSettingNotifications: function (notification) {
            let self = this;
            let text = notification == 'on' ? "Bạn muốn bật thông báo ?" : "Bạn muốn tắt thông báo ?";
            $('.modal-confirm').addClass('active padding');
            (async () => {
                let action = await self.confirmAction(text);
                if (action) {
                    if (notification == 'on') {
                        $('#notification-on').toggleClass('active');
                        $('#notification-off').toggleClass('active');
                        self.onOrOffNotificationsGroup(true);
                    } else {
                        $('#notification-on').toggleClass('active');
                        $('#notification-off').toggleClass('active');
                        self.onOrOffNotificationsGroup(false);
                    }
                    $('.modal-confirm').removeClass('padding');
                    $('#show-setting-group').addClass('active');
                } else {
                    $('#show-setting-group').addClass('active');
                    $('.modal-confirm').removeClass('padding');
                }
            })()
        },
        groupAddMember: function () {
            let self = this;
            let text = "Chọn thành viên muốn thêm !";
            $('.modal-confirm').addClass('active');
            (async () => {
                let action = await self.confirmAction(text, self.renderListUsersAddGroup(), "Hủy", "Thêm");
                if (action) {
                    $('#show-setting-group').addClass('active');
                    self.listUserAction.html('');
                    if (self.arrayAddMemberFromGroup.length > 0) {
                        self.updateMemberGroup(self.filterArraysOtherOrMerge(self.arrayAddMemberFromGroup, self.group.members), 'members');
                    }
                    self.arrayAddMemberFromGroup = [];
                } else {
                    self.listUserAction.html('');
                    $('#show-setting-group').addClass('active');
                    self.arrayAddMemberFromGroup = [];
                }
            })()
        },
        groupRemoveMember: function () {
            let self = this;
            if (self.group.owner == self.user.id) {
                let text = "Chọn thành viên muốn xóa !";
                $('.modal-confirm').addClass('active');
                (async () => {
                    let action = await self.confirmAction(text, self.renderListUsersRemoveGroup(), "Hủy", "Xóa");
                    if (action) {

                        $('#show-setting-group').addClass('active');
                        self.listUserAction.html('');
                        if (self.arrayRemoveMemberFromGroup.length > 0) {
                            self.updateMemberGroup(self.filterArraysOtherOrMerge(self.arrayRemoveMemberFromGroup, self.group.members, true), 'members');
                        }
                        self.arrayRemoveMemberFromGroup = [];
                    } else {
                        $('#show-setting-group').addClass('active');
                        self.listUserAction.html('');
                        self.arrayRemoveMemberFromGroup = [];
                    }
                })();
            }
        },
        groupShowListMembers: function () {
            let self = this;
            let text = "Thành viên nhóm: " + self.group.name
            $('.modal-confirm').addClass('active');
            (async () => {
                let action = await self.confirmAction(text, self.renderShowListMembers(), "Hủy", "Trở về");
                if (action) {
                    self.listUserAction.html('');
                    $('#show-setting-group').addClass('active');
                } else {
                    self.listUserAction.html('');
                    $('#show-setting-group').addClass('active');
                }

            })();
        },
        leaveGroup: function () {
            let self = this;
            let text = "Bạn muốn rời nhóm ?";
            $('.modal-confirm').addClass('active padding');
            (async () => {
                let action = await self.confirmAction(text);
                if (action) {
                    $('li[data-action="notification"]').addClass('active');
                    $('#show-setting-group').addClass('active');
                    self.updateMemberGroup(self.filterArraysOtherOrMerge([self.user.id], self.group.members, true), 'members');
                    $('.modal-confirm').removeClass('padding');
                } else {
                    $('.modal-confirm').removeClass('padding');
                    $('#show-setting-group').addClass('active');
                }
            })()
        },
        destroyGroup: function () {
            let self = this;
            if (self.group.owner == self.user.id) {
                let text = "Bạn muốn xóa nhóm vĩnh viễn ?";
                $('.modal-confirm').addClass('active padding');
                (async () => {
                    let group = self.group;
                    let action = await self.confirmAction(text);
                    if (action) {
                        $('li[data-action="notification"]').addClass('active');
                        let groupRef = self.firebase.database().ref(`groups/${group.id}`);
                        groupRef.remove();
                        groupRef = self.firebase.database().ref(`groups-messages/${group.id}`);
                        groupRef.remove();
                        let filePath = '/attachments/' + group.id;
                        let folderRef = self.firebase.storage().ref().child(filePath);
                        folderRef.listAll().then(function (result) {
                            result.items.forEach(function (fileRef) {
                                fileRef.delete().then(function () {
                                    // console.log('Đã xóa tệp tin: ' + fileRef.name);
                                }).catch(function (error) {
                                    // console.log('Lỗi khi xóa tệp tin: ' + fileRef.name, error);
                                });
                            });
                        }).catch(function (error) {
                            // console.log('Lỗi khi lấy danh sách tệp tin trong thư mục', error);
                        });
                        filePath = `/attachments/avatar-group/${group.nameAvt}`
                        self.firebase.storage().ref().child(filePath).delete().then(function () {
                        }).catch(function (error) { });
                        $('.modal-confirm').removeClass('padding');
                        $('#show-setting-group').removeClass('active');
                    } else {
                        $('.modal-confirm').removeClass('padding');
                        $('#show-setting-group').addClass('active');
                    }
                })()
            }
        },
        initActionFriend: function () {
            let self = this;
            $(document).on('click', '#action-setting-friend', function (e) {
                $('#show-setting-friend').addClass('active');
                self.checkChangeSetting();
            });
            $(document).on('click', '#show-setting-friend [uk-icon="close"]', function (e) {
                $('#show-setting-friend').removeClass('active');
            })
            $(document).on('click', '.action-setting-friend', function (e) {
                switch ($(this).data('action')) {
                    case 'notification':
                        self.userSettingNotifications($(this).data('act'))
                        break;
                    case 'block-friend':
                        self.blockFriend($(this).data('act'));
                        break;
                    case 'change-background':
                        self.changeBackground();
                        break;
                }
                $('#show-setting-friend').removeClass('active');
            })
            $(document).on('click', '#enable-block', function () {
                self.onOrOffBlockFriend(false);
                self.checkBlockFriend();
            })
            $(document).on('click', '.background-chat', function () {
                self.cssBackground = {
                    'background-image': $(this).data('background'),
                    'border': 'none',
                }
            });
        },
        userSettingNotifications: function (notification) {
            let self = this;
            let text = notification == 'on' ? "Bạn muốn bật thông báo ?" : "Bạn muốn tắt thông báo ?";
            $('.modal-confirm').addClass('active padding');
            (async () => {
                let action = await self.confirmAction(text);
                if (action) {

                    if (notification == 'on') {
                        $('#friend-notification-on').toggleClass('active');
                        $('#friend-notification-off').toggleClass('active');
                        self.onOrOffNotificationsFriend(true);
                    } else {

                        $('#friend-notification-on').toggleClass('active');
                        $('#friend-notification-off').toggleClass('active');
                        self.onOrOffNotificationsFriend(false);
                    }
                    $('.modal-confirm').removeClass('padding');
                    $('#show-setting-friend').addClass('active');
                } else {
                    $('#show-setting-friend').addClass('active');
                    $('.modal-confirm').removeClass('padding');
                }
            })()

        },
        blockFriend: function (block) {
            let self = this;
            let text = block == 'on' ? `Bạn muốn chặn ${self.friend.name}?` : `Bạn muốn mở chặn ${self.friend.name}?`;
            $('.modal-confirm').addClass('active padding');
            (async () => {
                let action = await self.confirmAction(text);
                if (action) {
                    if (block == 'on') {
                        $('#friend-block-on').toggleClass('active');
                        $('#friend-block-off').toggleClass('active');
                        self.onOrOffBlockFriend(true);
                        self.checkBlockFriend();
                    } else {
                        $('#friend-block-on').toggleClass('active');
                        $('#friend-block-off').toggleClass('active');
                        self.onOrOffBlockFriend(false);
                        self.checkBlockFriend();
                    }
                    $('.modal-confirm').removeClass('padding');
                    $('#show-setting-friend').removeClass('active');
                } else {
                    $('#show-setting-friend').addClass('active');
                    $('.modal-confirm').removeClass('padding');
                }
            })()
        },
        changeBackground: function () {
            let self = this;
            self.listBackground.html('');
            $.each(background, function (i, item) {
                let div = `<div class="background-chat" data-background="${item}" id="background-${i}" style="background-image:${item}"></div>`;
                self.listBackground.append(div);
            });
            $('.modal-background').addClass('active');
            (async () => {
                let action = await self.backgroundChat('Thay đổi chủ đề chat');
                if (action) {
                    $('#data-body').css(self.cssBackground);
                    $('#data-header').css(self.cssBackground);
                    $('#form').css(self.cssBackground);
                    $('#show-setting-friend').removeClass('active');
                } else {
                    self.cssBackground = {};
                    $('#show-setting-friend').addClass('active');
                }
            })()
        },
        checkBlockFriend: function () {
            let self = this;
            let check = false;
            if (self.checkChatFriend) {
                if (self.friend?.blockFriend) {
                    if ($.inArray(self.user.id, self.friend?.blockFriend) >= 0) {
                        check = true;
                        self.messBlock = `Bạn đã bị chặn bởi ${self.friend.name}`;
                        let html = `<div class="container-block"><b id="title-block">Không thể liên lạc với người này.</b></div>`
                        $('.block').addClass('active').html(html);
                    }
                }
                if (self.user?.blockFriend) {
                    if ($.inArray(self.friend?.id, self.user?.blockFriend) >= 0) {
                        check = true;
                        self.messBlock = `Hãy mở chặn ${self.friend.name}`;
                        let html = ` <div class="container-block">
                            <b id="title-block">${self.friend?.name}</b>
                            <button id="enable-block">Mở chặn</button>
                        </div>`
                        $('.block').addClass('active').html(html);
                    }
                }
            }
            if (!check) {
                $('.block').removeClass('active').html('');
            }
            return check;

        },
        renderListUsersRemoveGroup: function () {
            let self = this;
            let html = "", user, owner = self.group.owner;
            self.group.members.forEach(function (key) {
                if (self.arrayUsers.hasOwnProperty(key) && owner != key) {
                    user = self.arrayUsers[key]
                    html += `<div class="member uk-card-header uk-padding-header" data-id="${user.id}">
                        <img class="uk-border-circle avt-main-chat" width="40" height="40" src="${user.avatar}">
                        <b class="name-friend">${user.name}</b>
                        <button class="btn btn-danger remove-member" data-id="${user.id}">Xóa</button>
                        </div>`
                }
            });
            return html;
        },
        renderListUsersAddGroup: function () {
            let self = this;
            let html = "", user;
            Object.keys(self.arrayUsers).forEach(function (key) {
                if (!self.group.members.includes(key)) {
                    user = self.arrayUsers[key]
                    html += `<div class="member uk-card-header uk-padding-header" data-id="${user.id}">
                        <img class="uk-border-circle avt-main-chat" width="40" height="40" src="${user.avatar}">
                        <b class="name-friend">${user.name}</b>
                        <button class="btn btn-primary add-member" data-id="${user.id}">Thêm</button>
                        </div>`
                }
            });
            return html;
        },
        renderShowListMembers: function () {
            let self = this;
            let html = "", user, owner = self.group.owner;
            self.group.members.forEach(function (key) {
                if (self.arrayUsers.hasOwnProperty(key)) {
                    user = self.arrayUsers[key]
                    html += `<div class="member uk-card-header uk-padding-header" data-id="${user.id}">
                        <img class="uk-border-circle avt-main-chat" width="40" height="40" src="${user.avatar}">
                        <b class="name-member">${owner == key ? "(Quản trị viên) " : ""}${user.name}</b>
                        </div>`
                }
            });
            return html;
        },
        updateSendingMessage: function () {
            let self = this;
            if (self.lastMessage != undefined) {
                if (self.lastMessage.from != self.user.id) {
                    let chatId = self.generateChatId(self.user.id, self.friend.id);
                    let sendingPath = `messages/${chatId}/${self.lastMessage.id}`;
                    self.firebase.database().ref(sendingPath).once('value')
                        .then(function (snapshot) {
                            if (snapshot.exists()) {
                                let updates = {};
                                updates[sendingPath + '/sending'] = self.user.id;
                                self.firebase.database().ref().update(updates);
                                self.userSending();
                            }
                        })
                        .catch(function (error) {
                        });
                } else if (self.lastMessage.sending == self.friend.id) {
                    self.userSending();
                }
            }
        },
        userSending: function () {
            let self = this;
            if (self.lastMessage?.sending == self.friend.id) {
                $('.user-sending').remove();
                let row = `
                <div class="me user-sending uk-grid-small uk-flex-bottom uk-flex-right uk-text-right">
                    <img class="send" src="${self.friend.avatar}">
                </div>`;
                self.dataBody.append(row);
            }
        },
        readText: function (text) {
            // let read = new SpeechSynthesisUtterance(text);
            // let language = $('#select-language').val();
            // read.lang = language;
            // window.speechSynthesis.speak(read);
            $("#notificationSound")[0].play();
        },
        initMusicSeenMessages: function () {
            $('body').append(`<audio id="notificationSound" src="./xemtinnhan.mp3"></audio>`);
        },
        initLanguage: function () {
            let languageMap = {
                'vi-VN': 'Vietnamese',
                'en-US': 'English (United States)',
                'de-DE': 'German (Germany)',
                'en-GB': 'English (United Kingdom)',
                'es-ES': 'Spanish (Spain)',
                'es-US': 'Spanish (United States)',
                'fr-FR': 'French (France)',
                'hi-IN': 'Hindi (India)',
                'id-ID': 'Indonesian (Indonesia)',
                'it-IT': 'Italian (Italy)',
                'ja-JP': 'Japanese (Japan)',
                'ko-KR': 'Korean (South Korea)',
                'nl-NL': 'Dutch (Netherlands)',
                'pl-PL': 'Polish (Poland)',
                'pt-BR': 'Portuguese (Brazil)',
                'ru-RU': 'Russian (Russia)',
                'zh-CN': 'Chinese (Simplified, China)',
                'zh-HK': 'Chinese (Traditional, Hong Kong)',
                'zh-TW': 'Chinese (Traditional, Taiwan)'
            };
            let languagesWithNames = Object.entries(languageMap).map(([key, value]) => ({ key: key, value: value }));
            $.each(languagesWithNames, function (index, language) {
                $('#select-language').append($('<option>', {
                    value: language.key,
                    text: language.value
                }));
            });
            $('#select-icon').click(function (event) {
                $('#select-language').toggle();
                event.stopPropagation();
            });
            $(document).click(function () {
                $('#select-language').hide();
            });
            $('#select-language').click(function (event) {
                event.stopPropagation();
            });
            $('#select-language').change(function () {
                $(this).hide();
            });
        },
        changeClassification: function () {
            let self = this;
            $('#show-list').addClass('active');
            $('#classification-friend').addClass('active');
            $(document).on('click', '#classification-friend', function () {
                $('#messaging-classification li').removeClass('active');
                $(this).addClass('active');
                $('#show-list').addClass('active');
                $('#show-list-group').removeClass('active');
                $('.add-group').removeClass('active');
            });
            $(document).on('click', '#classification-group', function () {
                $('#messaging-classification li').removeClass('active');
                $(this).addClass('active');
                $('#show-list').removeClass('active');
                $('#show-list-group').addClass('active');
            });
        },
        confirmAction: function (text, htmlList = null, cancel = "Hủy", agree = "Đồng ý") {
            let self = this;
            return new Promise(resolve => {
                $('.modal-confirm .title h3').text(text);
                $('.modal-confirm .action .btn-dg').text(cancel);
                $('.modal-confirm .action .btn-pr').text(agree);
                if (htmlList != null) {
                    self.listUserAction.append(htmlList);
                }
                self.offDocuments('click', '.btn-dg, .btn-pr');
                $(document).on('click', '.btn-dg, .btn-pr', function (e) {
                    $('.modal-confirm').removeClass('active');
                    resolve($(this).data('action'));
                });
            })
        },
        backgroundChat: function (text, htmlList = null, cancel = "Hủy", agree = "Đồng ý") {
            let self = this;
            return new Promise(resolve => {
                $('.modal-background .title h3').text(text);
                $('.modal-background .action .btn-dg').text(cancel);
                $('.modal-background .action .btn-pr').text(agree);
                if (htmlList != null) {
                    self.listBackground.append(htmlList);
                }
                self.offDocuments('click', '.btn-dg, .btn-pr');
                $(document).on('click', '.btn-dg, .btn-pr', function (e) {

                    $('.modal-background').removeClass('active');
                    resolve($(this).data('action'));
                });
            })
        },
        initAddGroup: function () {
            let self = this;
            $(document).on('click', '.add-to-group', function (e) {
                let id = $(this).data('id');
                let el = this
                if ($.inArray(id, self.arrayGroupAddUsers) < 0) {
                    self.arrayGroupAddUsers.push(id);
                    $(el).html('Xóa').addClass('active');
                } else {
                    let index = self.arrayGroupAddUsers.indexOf(id);
                    if (index > -1) {
                        self.arrayGroupAddUsers.splice(index, 1);
                        $(el).html('Thêm').removeClass('active');
                    }
                }
            });
        },
        initRemoveMemberFromGroup: function () {
            let self = this;
            $(document).on('click', '.remove-member', function (e) {
                let id = $(this).data('id');
                let el = this
                if ($.inArray(id, self.arrayRemoveMemberFromGroup) < 0) {
                    self.arrayRemoveMemberFromGroup.push(id);
                    $(el).html('Hủy').addClass('active');
                } else {
                    let index = self.arrayRemoveMemberFromGroup.indexOf(id);
                    if (index > -1) {
                        self.arrayRemoveMemberFromGroup.splice(index, 1);
                        $(el).html('Xóa').removeClass('active');
                    }
                }
            });
        },
        initAddMemberFromGroup: function () {
            let self = this;
            $(document).on('click', '.add-member', function (e) {
                let id = $(this).data('id');
                let el = this
                if ($.inArray(id, self.arrayAddMemberFromGroup) < 0) {
                    self.arrayAddMemberFromGroup.push(id);
                    $(el).html('Hủy').addClass('active');
                } else {
                    let index = self.arrayAddMemberFromGroup.indexOf(id);
                    if (index > -1) {
                        self.arrayAddMemberFromGroup.splice(index, 1);
                        $(el).html('Thêm').removeClass('active');
                    }
                }
            });
        },
        filterArraysOtherOrMerge: function (arrOne, arrTwo, other = false) {
            if (other) {
                return arrTwo.filter(function (element) {
                    return !arrOne.includes(element);
                });
            } else {
                return [...new Set(arrOne.concat(arrTwo))];
            }

        },
        updateMemberGroup: function (data, key) {
            let self = this;
            let updates = {};
            updates[`groups/${self.group.id}/${key}`] = data;
            self.firebase.database().ref().update(updates);
        },
        updateUser: function (data, key) {
            let self = this;
            let updates = {};
            updates[`users/${self.user.id}/${key}`] = data;
            self.firebase.database().ref().update(updates);
        },
        offGroupDbRef: function (groupUndefined = false) {
            let self = this;
            if (self.groupMessagesDbRef && self.group) {
                self.groupMessagesDbRef.off('child_added', self.chatGroupListenersAdd[self.group.id]);
                self.groupMessagesDbRef.off('child_changed', self.chatGroupListenersChange[self.group.id]);
                self.groupMessagesDbRef.off('child_removed', self.chatGroupListenersRemove[self.group.id]);
                groupUndefined ? self.group = undefined : "";
            }
        },
        offFriendDbRef: function (friendUndefined = false) {
            let self = this;
            if (self.messagesDbRef && self.friend) {
                self.messagesDbRef.off('child_added', self.chatListenersAdd[self.generateChatId(self.user.id, self.friend.id)]);
                self.messagesDbRef.off('child_changed', self.chatListenersChange[self.generateChatId(self.user.id, self.friend.id)]);
                self.messagesDbRef.off('child_removed', self.chatListenersRemove[self.generateChatId(self.user.id, self.friend.id)]);
                friendUndefined ? self.friend = undefined : "";
            }
        },
        resetChatRemoveGroup: function () {
            let self = this;
            self.friend = self.user;
            $('.pencil').removeClass('active');
            $('.trash').removeClass('active');
            if (self.friend.id == self.user.id) {
                $('.pencil').addClass('active');
                $('.trash').addClass('active');
                $('.pencil.active').attr('data-id', self.user.id);
                $('.trash.active').attr('data-id', self.user.id);
            }
            self.checkChatGroup = false;
            self.checkChatFriend = true;
            $(`div[data-id="${self.friend.id}"]`).addClass('active');
            $('#action-setting-group').removeClass('active');
            $('#show-setting-group').removeClass('active');
            self.nameHeader.html(self.friend.name);
            self.statusHeader.html(self.detailStatusHeaderUser);
            self.avtFriend.attr('src', self.friend.avatar);
            self.startListeningToChatMessages(self.renderChatItem, self.user.id, self.friend.id);
        },
        offDocuments: function (action, element) {
            $(document).off(action, element);
        },
        onOrOffNotificationsGroup: function (on = true) {
            let self = this;
            if (self.group.offNotifications && on == true) {
                self.updateMemberGroup(self.filterArraysOtherOrMerge([self.user.id], self.group.offNotifications, on), 'offNotifications')
            } else if (on == false) {
                self.updateMemberGroup([self.user.id], 'offNotifications')
            }
            return on;
        },
        onOrOffNotificationsFriend: function (on = true) {
            let self = this;
            if (self.user.offNotifications && (on == true || on == false)) {
                self.updateUser(self.filterArraysOtherOrMerge([self.friend.id], self.user.offNotifications, on), 'offNotifications')
            } else {
                self.updateUser([self.friend.id], 'offNotifications')
            }
            return on;
        },
        onOrOffBlockFriend: function (on = true) {
            let self = this;
            if (self.user.blockFriend && (on == true || on == false)) {
                self.updateUser(self.filterArraysOtherOrMerge([self.friend.id], self.user.blockFriend, !on), 'blockFriend')
            } else {
                self.updateUser([self.friend.id], 'blockFriend')
            }
            return on;
        },

        initPasteImage: function () {
            let self = this;
            let arr = [];
            $(document).on('drop', '.uk-section', function (e) {
                e.preventDefault();
                let files = e.originalEvent.dataTransfer.files;
                for (let i = 0; i < files.length; i++) {
                    if (files[i].type.indexOf("image") !== -1) {
                        $('.container-image').addClass('active')
                        let file = files[i];
                        arr[file.lastModified] = file;
                        let html = `
                            <div class="image" data-image="${file.lastModified}">
                                <span uk-icon="close"></span>
                                <img src="${URL.createObjectURL(file)}" alt="">
                            </div>
                            `
                        $('.container-image').append(html);
                    }

                }
            });

            $(document).on('dragover', '.uk-section', function (e) {
                e.preventDefault();
            });
            $(document).on('paste', '#text-messages', function (e) {
                let clipboardData = e.originalEvent.clipboardData;
                if (!clipboardData) return;

                let items = clipboardData.items;

                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("image") !== -1) {
                        $('.container-image').addClass('active')
                        let file = items[i].getAsFile();
                        arr[file.lastModified] = file;
                        let html = `
                                <div class="image" data-image="${file.lastModified}">
                                    <span uk-icon="close"></span>
                                    <img src="${URL.createObjectURL(file)}" alt="">
                                </div>
                            `
                        $('.container-image').append(html);
                    }
                }
            });

            $(document).on('click', '#send', async function () {
                let arrays = [];
                let messages = $('#text-messages');
                $('.container-image .image').each(function () {
                    let imageId = $(this).data('image');
                    if (arr[imageId]) {
                        arrays.push(arr[imageId])
                    }
                })
                arrays.length > 0 ? self.uploadFile(arrays) : "";
                arr = [];
                arrays = []
                arr.length <= 0 ? $('.container-image').removeClass('active').html('') : "";
                messages.css('height', '100%');
            });

            $(document).on('click', '.container-image span', function () {
                $(this).parent().remove();
                $('.container-image').children().length <= 0 ? $('.container-image').html('').removeClass('active') : "";
            })

            $(document).on('keydown', '#text-messages', function (event) {
                if (event.which === 13 || event.keyCode === 13) {
                    event.preventDefault();
                    if (event.shiftKey || event.ctrlKey) {
                        var caretPosition = this.selectionStart;
                        $(this).val($(this).val() + '\r\n');
                        var lineCount = $(this).val().substr(0, caretPosition).split('\n').length;
                        if (lineCount >= 1) {
                            $(this).css('height', '100px');
                        }
                        var lineHeight = parseInt($(this).css('line-height'));
                        $(this).scrollTop(lineCount * lineHeight);
                        return;
                    }
                    if (self.checkSendMess) {
                        self.checkSendMess = false;
                        $('#send').click();
                    }
                }
            });
        },
        showAvatar: function () {
            $(document).ready(function () {
                $('#imgInp').change(function () {
                    $('#blah').show();
                    const file = $(this)[0].files;
                    if (file[0]) {
                        $('#blah').attr('src', URL.createObjectURL(file[0]));
                    }
                });
            });
        },
    }
    $.fn.appChat = function (options, cb) {
        this.each(function () {
            let el = $(this);

            if (!el.data("appChat")) {
                let appChat = new AppChat(el, options, cb);
                el.data("appChat", AppChat);

                appChat._init();
            }
        });
        return this;
    }
}(jQuery));
$(document).ready(function () {
    $("body").appChat();
});
