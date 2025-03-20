(function ($) {
  "use strict";
  var AppRegister = function AppRegister(element, options, callback) {
    var appRegister = this;
    this.firebase = firebase;
    this.avatarAttachmentsRef;
    this.usersDbRef;
    this.urlAvt;
    this.nameAvt;
  }
  AppRegister.prototype = {
    _init: function () {
      localStorage.clear();
      this.initFirebase();
      this.handelSubmit();
      this.locationLogin();
      this.showAvatar();
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
      this.avatarAttachmentsRef = this.firebase.storage().ref('attachments/');
    },
    handelSubmit: function () {
      var self = this;
      $('#register-form').on('submit', function (e) {
        e.preventDefault();
        if (self.validationInput()) {
          var username = $('#username').val();
          var email = $('#email').val();
          var password = $('#password').val();
          var avt = $('#imgInp')[0].files[0];
          self.register(username, email, password, avt);
        };
      })
    },
    register: function (username, email, password, avt) {
      var self = this;
      if (self.isValidEmail(email)) {
        const query = self.usersDbRef.orderByChild('email').equalTo(email);
        query.once('value', (snapshot) => {
          const users = snapshot.val();
          if (users) {
            $('#email').closest('.form-group').find('.invalid').addClass('active').text('Email đã tồn tại');
          } else {
            (async () => {
              await self.uploadFileToStorage(avt);
              var option = {
                name: username,
                email: email,
                password: password,
                timeout: new Date(Date.now()).getTime(),
                nameAvt: self.nameAvt,
                avatar: self.urlAvt,
              }
              self.usersDbRef.push(option);
              localStorage.setItem('userRegister', JSON.stringify(option));
              window.location.href = 'login.html';
            })()
          }
        });
      } else {
        $('#email').closest('.form-group').find('.invalid').addClass('active').text('Email không đúng định dạng');
      }
    },
    isValidEmail: function (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    locationLogin: function () {
      $(document).on('click', '#login-account', function () {
        window.location.href = 'login.html';
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
    uploadFileToStorage: function (file) {
      var self = this;
      var fileName = Math.random().toString(36).substring(10)+`.`+file.name.split('.').pop();
      var filePath = 'Avatar' + '/' + fileName;
      return new Promise(resolve => {
        var checkUploadFile = self.avatarAttachmentsRef.child(filePath).put(file);
        checkUploadFile.on(
          self.firebase.storage.TaskEvent.STATE_CHANGED,
          (snapshot) => {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
            checkUploadFile.snapshot.ref.getDownloadURL().then((downloadURL) => {
              self.urlAvt = downloadURL;
              self.nameAvt = fileName;
              resolve();
            })
          }
        );
      });
    },
    sleep: function (ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
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
    }


  }
  $.fn.appRegister = function (options, cb) {
    this.each(function () {
      var el = $(this);

      if (!el.data("appRegister")) {
        var appRegister = new AppRegister(el, options, cb);
        el.data("appRegister", AppRegister);
        appRegister._init();
      }
    });
    return this;
  };
}(jQuery))
$(document).ready(function () {
  $("body").appRegister();
});