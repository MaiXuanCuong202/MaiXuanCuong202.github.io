(function ($) {
    "use strict";
    var AppLogin = function AppLogin(element, options, callback) {
        var appLogin = this;
        this.userRegister = JSON.parse(localStorage.getItem('userRegister'));
        this.firebase = firebase;
        this.usersDbRef;
    }
    AppLogin.prototype = {
        _init: function () {
            this.handelLogin();
            this.locationRegister();
            this.checkValueRegister();
            this.initFirebase();
        },
        initFirebase: function () {
            var config = {
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
        },
        handelLogin: function () {
            var self = this;

            $('#login-form').on('submit', function (e) {
                e.preventDefault();
                if (self.validationInput()) {
                    var email = $('#email').val();
                    var password = $('#password').val();
                    self.login(email, password);
                }
            });
        },
        login: function (email, password) {
            var self = this;
            if (self.isValidEmail(email)) {
                const query = self.usersDbRef.orderByChild('email').equalTo(email);
                query.once('value', (snapshot) => {
                    const users = snapshot.val();
                    if (users) {
                        $.each(users, function (key, value) {
                            if (value.password == password) {
                                var data = value;
                                data.id = key;
                                self.usersDbRef.child(key).update({
                                    timeout: new Date(Date.now()).getTime()
                                });
                                localStorage.clear();
                                // localStorage.setItem('userLogin', JSON.stringify(data));
                                var expirationDate = new Date();
                                expirationDate.setDate(expirationDate.getDate() + 1);
                                var dataWithExpiration = {
                                    data: data,
                                    expirationDate: expirationDate.getTime()
                                };
                                localStorage.setItem('userLogin', JSON.stringify(dataWithExpiration));
                                window.location.href = 'index.html'
                            } else {

                                $('#password').closest('.form-group').find('.invalid').addClass('active').text('Mật khẩu không đúng');
                            }
                        });
                        ;
                    } else {
                        $('#email').closest('.form-group').find('.invalid').addClass('active').text('Tài khoản không tồn tại');
                    }
                });
            } else {
                $('#email').closest('.form-group').find('.invalid').addClass('active').text('Email không đúng định dạng');
            }

        },
        locationRegister: function () {
            $(document).on('click', '#register-account', function () {
                window.location.href = 'register.html';
            });
        },
        checkValueRegister: function () {
            if (this.userRegister) {
                $('#email').val(this.userRegister.email);
                $('#password').val(this.userRegister.password);
            };
        },
        validationInput: function () {
            var isValid = true;
            $('input').each(function (i) {
                var inputValue = $(this).val();
                var errorText = '';
                var $invalidElement = $(this).closest('.form-group').find('.invalid');
                if (inputValue === '') {
                    errorText = 'Trường này không được bỏ trống';
                    $(this).addClass('invalid-input');
                    $invalidElement.addClass('active').text(errorText);
                    isValid = false;
                } else {
                    $(this).removeClass('invalid-input');
                    $invalidElement.removeClass('active').text('');
                }
            });
            return isValid;
        },
        isValidEmail: function (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

    }
    $.fn.appLogin = function (options, cb) {
        this.each(function () {
            var el = $(this);

            if (!el.data("appLogin")) {
                var appLogin = new AppLogin(el, options, cb);
                el.data("appLogin", AppLogin);

                appLogin._init();
            }
        });
        return this;
    };
}(jQuery))
$(document).ready(function () {
    $("body").appLogin();
});