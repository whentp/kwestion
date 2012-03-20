// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab
"use strict";

var keystatus = null;

var in_reply_to = false;
var userinfo = {};
//var userlisthtml="";

var tmplong = null;
var tmplat = null;
var myinfo = {};

function KUIMsgSendBind() {
  $('#sendmessage').click(sendmsg);
  $('#dosearch').click(dosearch);
  $('#message').setCaret();
  $('#message').change(count_words).keyup(count_words).focus(function() {
    $('#postform').css('visibility', 'hidden');
    var offset = $(this).offset();
    var width = $(window).width() / 2;
    width = width < 320 ? 320 : width;
    simpledialog($("#ext-edit").tmpl({
      'text' : $('#message').val()
    }), function() {
      $('#ext-editbox').width(width - 15).change(count_words).keyup(count_words).keydown(function(e) {
        if((e.ctrlKey || e.metaKey) && e.which == 13) {
          keystatus = null;
          $('#ext-sendmsg').click();
          return false;
        }
        if(e.altKey && e.which == 13) {
          keystatus = null;
          $('#ext-dosearch').click();
          return false;
        }
      }).change().focus();
      $('#ext-sendmsg').click(function() {
        $('#dialogbackground').click();
        $('#sendmessage').click();
      });
      $('#ext-dosearch').click(function() {
        $('#dialogbackground').click();
        $('#dosearch').click();
      });
    }, offset, width, function() {
      $('#message').val($('#ext-editbox').val());
      $('#postform').css('visibility', 'visible');
    });
  });
  $(document).keydown(function(e) {
    keystatus = e;
  }).keyup(function(e) {
    keystatus = e;
  });
}

function dosearch() {
  var tmphash = $.trim($('#message').val());
  if(tmphash === '')
    return;
  opentab('Search:' + tmphash, 'hash', tmphash, 'hash', frame.items.length - 1);
  $('#message').val('');
  return false;
}

function sendmsg() {
  keystatus = null;
  var rawmsg = $.trim($('#message').val());
  var x = k_plugins;
  rawmsg = CallPlugin('beforesend', rawmsg);
  if(!rawmsg || rawmsg.length == 0)
    return;
  showwait(true);

  var params = {};
  params['status'] = rawmsg;
  if(in_reply_to)
    params['in_reply_to_status_id'] = in_reply_to;
  if(getConfig('stopgeoinfo') != 'stop' && tmplong && tmplat) {
    params.lat = tmplat;
    params['long'] = tmplong;
  }

  kreq.ajax({
    url : tapistr('statuses/update.json'),
    data : params,
    type : 'post'
  }).success(function(d) {
    myinfo = d.user;
    updatemyinfo();
    in_reply_to = false;
    $('#message').val('');
    showwait(false);
    setTimeout(function() {
      if(rawmsg[0] != 'd') {
        var tmp = frame.findTimeline('home');
        if(tmp)
          tmp.check();
        showmsg('Successful.');
      }
      return false;
    }, 2000);
    return false;
  }).error(function() {
    showwait(true);
    showmsg('Error.');
  });
  return false;
}

function count_words() {
  var tmpid = '#' + this.id;
  var tmpshowid = '#' + this.id + 'count';
  var x = $(tmpid).val();
  if(x != null && x.length != null) {
    $(tmpshowid).text(140 - x.length);
    if(x.length > 140) {
      $(tmpid).val(x.substr(0, 140));
      $(tmpshowid).text(0);
    }
  }
}

function updatemyinfo() {
  $('#myinfo').html($('#headbar').tmpl(myinfo));
}

function replymsg(xobj, raw) {
  var obj = $(xobj);
  var user = '@' + raw.user.screen_name;
  in_reply_to = raw.id;
  if((keystatus && (keystatus.ctrlKey || keystatus.metaKey)) || obj.hasClass('multiple')) {
    var tmp = raw.text;
    var retmp = /@([a-z_A-Z0-9]+)/ig;
    var checkdict = {};
    checkdict[user] = true;
    var sb = [user];
    var a;
    while( a = retmp.exec(tmp)) {
      if(!checkdict[a[0]] && a[0] != '@' + myname) {
        sb.push(a[0]);
        checkdict[a[0]] = true;
      }
    }
    user = sb.join(' ');
  }
  $('#message').val('').val(user + ' ').focus();
  return false;
}

function officialrt(obj, id) {
  kreq.ajax({
    url : tapistr('statuses/retweet/' + id + '.json'),
    type : 'post'
  }).success(function(data) {
    showmsg('Official retweet succeed.');
    $('#message').val('');
  });
}

function showrtdialog(obj, raw) {
  var offset = $(obj).offset();
  simpledialog($("#rtdialog").tmpl({}), function() {
    in_reply_to = false;
    $('#rtmsg').change(count_words).keypress(count_words).val('').val('RT @' + raw.user.screen_name + ' ' + unescape(raw.text)).focus().change().keydown(function(e) {
      if((keystatus.ctrlKey || keystatus.metaKey) && e.which == 13) {
        keystatus = null;
        $('#rtbutton').click();
        return false;
      }
      if(e.altKey && e.which == 13) {
        keystatus = null;
        $('#ortbutton').click();
        return false;
      }
    });
    $('#rtbutton').off().click(function() {
      $('#message').val($('#rtmsg').val());
      sendmsg();
      $('#dialogbackground').click();
    });
    $('#ortbutton').off().click(function() {
      officialrt(obj, '' + raw.id);
      $('#dialogbackground').click();
    });
  }, {
    top : offset.top + 14,
    left : offset.left - 270
  }, 316);
}

function deletetweet(id) {
  // delete regular messages.
  if(confirm('Are you sure?')) {
    kreq.ajax({
      url : tapistr('statuses/destroy/' + id + '.json'),
      type : 'post'
    }).success(function(data) {
      showmsg('Succeed.');
      myinfo.statuses_count--;
      updatemyinfo();
      $('.twitter-item').each(function() {
        if(this.raw.id == id) {
          $(this).parent().fadeOut(500);
        }
      });
    }).error(function() {
      showmsg('Failed');
    });
  }
}

function deldm(id) {
  // delete direct messages.
  if(confirm('Are you sure?')) {
    kreq.ajax({
      url : tapistr('direct_messages/destroy/' + id + '.json'),
      type : 'post'
    }).success(function(data) {
      showmsg('Succeed.');
      $('.twitter-item').each(function() {
        if(this.raw.id == id) {
          $(this).parent().fadeOut(500);
        }
      });
    });
  }
}

function showthread(obj, raw) {
  var w = 320;
  var offset = $(obj).offset();

  simpledialog('<div align="center" style="padding:20px;"><img src="loader.gif" /></div>', false, {
    'top' : offset.top + 14,
    'left' : offset.left + $(obj).width() - w
  }, w);

  kreq.ajax({
    url : tapistr("/statuses/show/" + raw.in_reply_to_status_id + ".json")
  }).success(function(data) {
    data.bold = true;
    data.from = data.user;
    //$id = $raw->in_reply_to_status_id_str;
    if(data && !data.error) {
      if(data) {
        simpledialog($("#threads").tmpl([data]), false, {
          'top' : offset.top + 14,
          'left' : offset.left + $(obj).width() - w
        }, w);
      } else {
        $('#dialog').html('<div align="center">&nbsp;<br />Not found.</br />&nbsp;</div>');
      }
    } else {
      $('#dialog').html('Not found.');
    }
  });
}

function favoritetweet(obj, raw) {
  var id = raw.id;
  if(!raw.favorited) {
    kreq.ajax({
      url : tapistr('favorites/create/' + id + '.json'),
      type : 'post'
    }).success(function(data) {
      showmsg('Succeed.');
      raw.favorited = true;
    });
  } else {
    kreq.ajax({
      url : tapistr('favorites/destroy/' + id + '.json'),
      type : 'post'
    }).success(function(data) {
      showmsg('Succeed.');
      delete raw.favorited;
    });
  }
}

function follow(obj, id, callback) {
  if($.trim($(obj).text()) == 'Follow') {
    kreq.ajax({
      url : tapistr('friendships/create/' + id + '.json'),
      type : 'post'
    }).success(function(data) {
      showmsg('Succeed.');
      $(obj).text('Unfollow');
      if(userinfo[id]) {
        delete userinfo[id];
      }
      if(callback)
        callback();
    });
  } else {
    kreq.ajax({
      url : tapistr('friendships/destroy/' + id + '.json'),
      type : 'post'
    }).success(function(data) {
      showmsg('Succeed.');
      $(obj).text('Follow');
      if(userinfo[id]) {
        delete userinfo[id];
      }
      if(callback)
        callback();
    });
  }
}
