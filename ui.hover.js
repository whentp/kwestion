// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab
"use strict";(function(window, $) {
  var mouseoverflag = {
    people_op : {},
    peopleat_op : {},
    hash_op : {}
  };

  var mouseoverInfo = {
    id : '',
    user : '',
    hash : ''
  };

  window.bindmouseover = function() {
    mouseoverflag = {
      people_op : {},
      peopleat_op : {},
      hash_op : {}
    };
    $('#people_op, #peopleat_op, #hash_op').unbind().hover(function() {
      var id = $(this).attr('id');
      if(mouseoverflag[id].timer) {
        clearTimeout(mouseoverflag[id].timer);
        mouseoverflag[id].timer = null;
      }
    }, function() {
      var id = $(this).attr('id');
      var that = this;
      if(!mouseoverflag[id].timer) {
        mouseoverflag[id].timer = setTimeout(function() {
          $(that).fadeOut();
        }, 1000);
      }
    });
    $('a.openhome').click(function() {
      var newtimeline = frame.CreateTimelineByType({
        action : 'user',
        type : 'user',
        user : mouseoverInfo.user,
        name : mouseoverInfo.user,
        canclose : true
      });
      frame.items[frame.items.length - 1].addList(newtimeline, true);
      newtimeline.check();
      return false;
    });
    $('a.openhashtag').click(function() {
      var newtimeline = frame.CreateTimelineByType({
        action : 'hash',
        type : 'hash',
        user : mouseoverInfo.hash,
        name : 'Search:' + mouseoverInfo.hash,
        canclose : true
      });
      frame.items[frame.items.length - 1].addList(newtimeline, true);
      newtimeline.check();
      return false;
    });
    $('a.atsomebody').click(function() {
      in_reply_to = false;
      $("#message").val("@" + mouseoverInfo.user + " ").focus();
      return false;
    });

    $('a.dmsomebody').click(function() {
      in_reply_to = false;
      $("#message").val("d " + mouseoverInfo.user + " ").focus();
      return false;
    });

    $('a.totextbox').click(function() {
      insertsomething(" @" + mouseoverInfo.user + " ");
      return false;
    });

    $('a.hashtotextbox').click(function() {
      insertsomething(" @" + mouseoverInfo.hash + " ");
      return false;
    });
  };
  function showpeopleop() {
    var o = $(this);
    var x = o.offset().left;
    var y = o.offset().top;
    var width = o.width();
    var height = o.height();
    var tmpimg = o.find('img');
    mouseoverInfo.id = tmpimg.attr('tid');
    mouseoverInfo.user = tmpimg.attr('alt');
    //console.log(JSON.stringify(mouseoverInfo));
    var fo = $('#people_op');
    fo.css('top', y - 10).css('left', x - 10).css('display', 'block').css('z-index', 1000);
  }

  function showpeopleatop() {
    var o = $(this);
    var x = o.offset().left;
    var y = o.offset().top;
    var width = o.width();
    var height = o.height();
    var uid = $.trim(o.text());
    mouseoverInfo.user = o.text();
    var fo = $('#peopleat_op');
    fo.css('top', y + 15).css('left', x).css('display', 'block').css('z-index', 1000);
  }

  function showhashop() {
    var o = $(this);
    var x = o.offset().left;
    var y = o.offset().top;
    var width = o.width();
    var height = o.height();
    var uid = $.trim(o.text());
    mouseoverInfo.hash = o.text();
    $('#peopleat_op').css('display', 'none');
    var fo = $('#hash_op');
    fo.css('top', y + 15).css('left', x).css('display', 'block').css('z-index', 1000);
  }

  function clearmouseovertimer() {
    var id = -1;
    if($(this).hasClass('people_op'))
      id = 'people_op';
    else if($(this).hasClass('peopleat_op'))
      id = 'peopleat_op';
    else if($(this).hasClass('hash_op') || $(this).hasClass('hashtag'))
      id = 'hash_op';

    if(mouseoverflag[id].timer) {
      clearTimeout(mouseoverflag[id].timer);
      mouseoverflag[id].timer = null;
    }
  }

  function setmouseovertimer() {
    var id = -1;
    if($(this).hasClass('people_op'))
      id = 'people_op';
    else if($(this).hasClass('peopleat_op'))
      id = 'peopleat_op';
    else if($(this).hasClass('hash_op') || $(this).hasClass('hashtag'))
      id = 'hash_op';

    var that = this;
    if(!mouseoverflag[id].timer) {
      mouseoverflag[id].timer = setTimeout(function() {
        $('#' + id).fadeOut();
      }, 1000);
    }
  }

  function timelinebind_tweet_hover1() {
    toolbarpool.raw = this.raw;
    //console.log('toolbarraw', $(this).text(),this.raw);
    var x = toolbarpool.getToolbar(this.raw.type);
    x.init(x.template, this.raw);
    $(this).addClass('hover').find(".tools").append(x.template).find("div.source").show(0);
    $(this).find('span.time').css('display', 'none');
    return false;
  }

  function timelinebind_tweet_hover2() {
    toolbarpool.getToolbar(this.raw.type).template.detach();
    $(this).removeClass('hover').find("div.source").css('display', 'none');
    $(this).find('.time').css('display', 'inline');
    return false;
  }


  window.timelinebindsingle = function(jobj) {
    jobj.off().hover(timelinebind_tweet_hover1, timelinebind_tweet_hover2);
    //jobj.click(function(){alert(this.raw.type + '\n' + JSON.stringify(this.raw));});
    jobj.find('.people_op').mouseover(showpeopleop).click(showpeopleop).hover(clearmouseovertimer, setmouseovertimer);
    jobj.find('.peopleat_op').click(returnfalse).mouseover(showpeopleatop).hover(clearmouseovertimer, setmouseovertimer);
    jobj.find('.hashtag').click(returnfalse).mouseover(showhashop).hover(clearmouseovertimer, setmouseovertimer);
  };
})(window, $);
