// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab

var frame;
var timelinepool = {};
var myname = '';

function loaduserinfo() {
  kreq.ajax({
    url : tapistr('account/verify_credentials.json')
  }).done(function(data) {
    myinfo = data;
    myname = myinfo.screen_name;
    storage.myname = myname;
    $('body').css('background', 'url(' + data.profile_background_image_url + ') fixed #' + data.profile_background_color);
    updatemyinfo();
  });
}

function setdescription() {
  var x = $('#setdescriptionval').val();
  if ($.trim(x).length) {
    kreq.ajax({
      url : tapistr('account/update_profile.json'),
      data : {
        'description' : x
      },
      type : 'post'
    }).done(function(d) {
      showmsg('OK');
      myinfo = d;
      if (userinfo[myname]) {
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
  }/*, {
    name : 'My RT',
    action : 'rtbyme',
    user : '',
    type : 'twitter'
  }, {
    name : 'RT to me',
    action : 'rttome',
    user : '',
    type : 'twitter'
  }*/, {
    name : 'RT of me',
    action : 'rtofme',
    user : '',
    type : 'twitter'
  }];
  setTimeout(function() {
    var offset = $(obj).offset();
    var sb = [];
    $.each(mytimelineparameters, function(a, b) {
      if (!frame.findTimeline(b.action, b.user)) {
        sb.push('<a href="#" class="opentab" id="', b.action, '_', b.user, '_', b.type, '_button">', this.name, '</a> ');
      }
    });
    var id = index;
    var openuser = "<div class='opentabs clear'>" + sb.join('') + '</div>';

    //var bottom = "<div id='list_bar'><a href='#' onclick='opentab(\"userlist\",\"" + myname + "\"," + id + ")'>Manage</a> | <a href='#' onclick='sorry(); return false;'>New List</a> | <a href='#' onclick='opentab(\"listmembership\",\"" + myname + "\"," + id + "); return false;' title='shows which lists you are in.'>Membership</a></div>";

    simpledialog(openuser, false, {
      'top' : offset.top + 20,
      'left' : offset.left
    }, 200).append(JST.index_openuserandlist({
      'id' : index
    }));

    $('#openuserbutton').click(function() {
      openusers(index);
      return false;
    });

    $('#openlistbutton').click(function() {
      openlist(index);
      return false;
    });

    $.each(mytimelineparameters, function(a, b) {
      $('#' + b.action + '_' + b.user + '_' + b.type + '_button').click(function() {
        opentab(b.name, b.action, b.user, b.type, index);
        return false;
      });
    });
  }, 300);
}

function openusers(index) {
  var abc = $("#inputuser").val();
  var users = abc.replace(/[@ #\t]/ig, '').split(',');
  if ($.trim(abc).length && users.length) {
    if (users.length) {
      $.each(users, function(a, b) {
        if (!frame.findTimeline('user', b)) {
          opentab(b, 'user', b, 'user', index);
        }
      });
    }
  }
  return false;
}

function openlist(index) {
  var abc = $.trim($("#inputlist").val());
  if (abc.length) {
    if (!frame.findTimeline('list', abc)) {
      opentab(abc, 'list', abc, 'list', index);
    }
  }
  return false;
}

function toolbarcollapse(obj) {
  if (getConfig('toolbarcollapse') != 'yes') {
    setConfig('toolbarcollapse', 'yes');
    $(obj).html('&raquo;').next().addClass("toolbar_collapse");
  } else {
    setConfig('toolbarcollapse', '');
    $(obj).html('&laquo;').next().removeClass("toolbar_collapse");
  }
}

function setprofile(obj) {
  var offset = $(obj).offset();
  simpledialog(JST.index_changeprofile({
    bio : myinfo.description
  }), function() {
    $('#setdescriptionbutton').click(function() {
      setdescription();
      return false;
    });
  }, offset, 320);
}

function opentab(name, action, user, type, index) {
  var donotclose = {
    'home' : true,
    'reply' : true
  };
  //console.log(frame.findTimeline(action, user), action, user);
  if (frame.findTimeline(action, user)) {
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
