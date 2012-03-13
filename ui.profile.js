// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab

var frame;
var timelinepool = {};
var myname = '';

function loaduserinfo() {
  kreq.ajax({
    url : tapistr('account/verify_credentials.json')
  }).success(function(data) {
    myinfo = data;
    myname = myinfo.screen_name;
    storage.myname = myname;
    $('body').css('background', 'url(' + data.profile_background_image_url + ') fixed #' + data.profile_background_color);
    updatemyinfo();
  });
}

function setdescription() {
  var x = $('#setdescriptionval').val();
  if($.trim(x).length) {
    kreq.ajax({
      url : tapistr('account/update_profile.json'),
      data : {
        'description' : x
      },
      type : 'post'
    }).success(function(d) {
      showmsg('OK');
      myinfo = d.user;
      if(userinfo[myname]) {
        delete userinfo[myname];
      }
    });
    return false;
  }
}

function addNewTimeline(obj, index) {
  var mytimelineparameters = [{
    name : 'Home',
    action : 'home',
    user : '',
    type : 'twitter'
  }, {
    name : 'Reply',
    action : 'reply',
    user : '',
    type : 'twitter'
  }, {
    name : 'DM',
    action : 'dm',
    user : '',
    type : 'dm'
  }, {
    name : myname,
    action : 'user',
    user : myname,
    type : 'user'
  }, {
    name : 'Favorite',
    action : 'fav',
    user : myname,
    type : 'twitter'
  }, {
    name : 'My RT',
    action : 'rtbyme',
    user : '',
    type : 'twitter'
  }, {
    name : 'RT to me',
    action : 'rttome',
    user : '',
    type : 'twitter'
  }, {
    name : 'RT of me',
    action : 'rtofme',
    user : '',
    type : 'twitter'
  }];
  setTimeout(function() {
    var offset = $(obj).offset();
    var sb = [];
    $.each(mytimelineparameters, function(a, b) {
      if(!frame.findTimeline(b.action, b.user)) {
        sb.push('<a href="#" class="opentab" onclick="opentab(\'', b.name, '\',\'', b.action, '\',\'', b.user, '\',\'', b.type, '\', ', index, '); return false;">', this.name, '</a> ');
      }
    });
    var id = 0;
    var openuser = "<div class='opentabs clear'>" + sb.join('') + '</div>';
    openuser += "<div id='openuser_div'><div>Users' IDs(separated by ','):</div><input type=\"text\" id=\"inputuser\" value=\"\" /> <a href='#' onclick='openusers(" + id + "); return false;'>open</a></div>";
    //openuser += "<div id='openlist_div'><div>List name(name/list):</div><input type=\"text\" id=\"inputlist\" value=\"\" /> <a href='#' onclick='opentab(\"list\",$(\"#inputlist\").val()," + id + "); return false;'>open</a></div>";
    //var bottom = "<div id='list_bar'><a href='#' onclick='opentab(\"userlist\",\"" + myname + "\"," + id + ")'>Manage</a> | <a href='#' onclick='sorry(); return false;'>New List</a> | <a href='#' onclick='opentab(\"listmembership\",\"" + myname + "\"," + id + "); return false;' title='shows which lists you are in.'>Membership</a></div>";

    simpledialog(openuser, false, {
      'top' : offset.top + 20,
      'left' : offset.left
    }, 200);
  }, 200);
}

function openusers(index) {
  var abc = $("#inputuser").val();
  var users = abc.replace(/[@ #\t]/ig, '').split(',');
  if($.trim(abc).length && users.length) {
    if(users.length) {
      $.each(users, function(a, b) {
        if(!frame.findTimeline('user', b) && b != myname) {
          opentab(b, 'user', b, 'user', index);
        }
      });
    }
  }
  return false;
}

function toolbarcollapse(obj) {
  if(getConfig('toolbarcollapse') != 'yes') {
    setConfig('toolbarcollapse', 'yes');
    $(obj).html('&raquo;').next().addClass("toolbar_collapse");
  } else {
    setConfig('toolbarcollapse', '');
    $(obj).html('&laquo;').next().removeClass("toolbar_collapse");
  }
}

function setprofile(obj) {
  var offset = $(obj).offset();
  simpledialog($('#changeprofile').tmpl({
    bio : myinfo.description
  }), false, offset, 320);
}

function opentab(name, action, user, type, index) {
  var donotclose = {
    'home' : true,
    'reply' : true
  };
  if(frame.findTimeline(action, user)) {
    alert('You have already created a timeline.');
    return;
  }
  var tmp = frame.CreateTimelineByType({
    'name' : name,
    'action' : action,
    'user' : user,
    'type' : type,
    'canclose' : donotclose[action] ? false : true
  });
  frame.items[index].addList(tmp, true);
  tmp.check();
}

window.addListCallback = addNewTimeline;
// this is a default callback function in KTab.