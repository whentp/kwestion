// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab
"use strict";

var Notifier = Class.extend({
  HasSupport : function() {
    if(window.webkitNotifications) {
      return true;
    } else {
      return false;
    }
  },
  RequestPermission : function(cb) {
    window.webkitNotifications.requestPermission(function() {
      if(cb) {
        cb(window.webkitNotifications.checkPermission() == 0);
      }
    });
  },
  Notify : function(icon, title, body) {
    if(window.webkitNotifications.checkPermission() == 0) {
      var popup = window.webkitNotifications.createNotification(icon, title, body);
      popup.show();
      setTimeout(function() {
        popup.cancel();
      }, 2500);
      return true;
    }
    return false;
  }
});

var NotificationQueue = Class.extend({
  init : function() {
    this.pool = [];
    this.n = new Notifier();
    this.isworking = false;
  },
  popup : function() {
    var root = this;
    var x = this.pool.shift();
    this.n.Notify(x[0], x[1], x[2]);
    this.isworking = false;
    if(this.pool.length > 0) {
      setTimeout(function() {
        root.popup();
      }, 2000);
      this.isworking = true;
    }
  },
  add : function(icon, title, body) {
    var root = this;
    if(!getConfig('notify') && window.webkitNotifications && window.webkitNotifications.checkPermission() == 0) {
      this.pool.push([icon, title, body]);
      if(!this.isworking) {
        setTimeout(function() {
          root.popup();
        }, 3000);
        this.isworking = true;
      }
    }
  }
});

var nq = new NotificationQueue();

function requestnotify() {
  var notifier = new Notifier();
  if(notifier.HasSupport()) {
    notifier.RequestPermission();
  }
}(function(window) {
  var focusflag = true, flashtitletimerflag = 1, // odd => ''; even => title;
  flashtitletimer = null, titleraw = 'kwestion. Another twitter client.';

  $(window).focus(function() {
    setTimeout(function() {
      settitle();
    }, 3000);
    focusflag = true;
    if(flashtitletimer) {
      clearInterval(flashtitletimer);
      flashtitletimer = null;
    }
  }).blur(function() {
    focusflag = false;
  });

  window.settitle = function() {
    var unread = true;
    if(frame) {
      $.each(frame.items, function(a, b) {
        $.each(b, function(c, d) {
          if(d && d.unreadcount)
            unread = false;
        });
      });
    }
    document.title = unread ? titleraw : '*** kwestion ***';
  };

  window.titlesay = function(saywhat) {
    if(!focusflag) {
      if(!flashtitletimer) {
        flashtitletimer = setInterval(function() {
          if(flashtitletimerflag == 1) {
            document.title = saywhat;
            flashtitletimerflag = 0;
          } else {
            document.title = titleraw;
            flashtitletimerflag = 1;
          }
        }, 1000);
      }
    }
  };
})(window);
