// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab
"use strict";

var userinfo = {};

var Kinit = function() {
  $('body').append($(['<div class="bottom-loader"></div>', "<div id='wait' style='display:none'><img src='loader.gif' style='margin:10 0;' /></div>", // finished.
  "<div id='dialog'></div>", // finished.
  "<div id='dialogbackground'></div>", '<div id="msgbox" class="s_clear" style="display:none;">', '<div id="msgboxhead">kwestion</div>', '<div id="msgboxbody" class="s_clear"></div>', '</div>'].join('')));
};
function sorry() {
  alert('@whentp is VERY lazy.');
}

function returnFalse() {
  return false;
}

function returnTrue() {
  return true;
}

function returnfalse() {
  return false;
}

function returntrue() {
  return true;
}

function getConfig(key) {
  if (!storage['kwestion-config-' + key]) {
    return '';
  }
  return JSON.parse(storage['kwestion-config-' + key]);
}

function setConfig(key, value) {
  storage['kwestion-config-' + key] = JSON.stringify(value);
}

function showwait(show) {
  $('#wait').css({
    'left' : $(window).width() / 2 - 125,
    'top' : $(window).height() / 2 - 20,
    'display' : show ? 'block' : 'none'
  });
}

function insertsomething(a) {
  $('#message').insertAtCaret(a);
}

function showmsg(msg) {
  var w = $(window).width();
  var tmpobj = $("#msgbox");
  $('#msgboxbody').html(msg);
  var h = tmpobj.height();
  tmpobj.css({
    left : Math.floor(w / 2 - 100),
    top : -10 - h,
    visibility : 'visible',
    display : 'block'
  });
  tmpobj.animate({
    top : 0
  }).animate({
    top : 0
  }, 5000).animate({
    top : -10 - h
  }).hide(0);
}

function simpledialog(html, callback, offset, width, onsimpledialogclose) {
  $('#dialogbackground').show(0).off().click(function() {
    $('#dialog').fadeOut(200);
    $(this).fadeOut(200);
    if (onsimpledialogclose) {
      onsimpledialogclose();
    }
  });
  if (offset.left < 1)
    offset.left = 1;
  $('#dialog').css({
    'display' : 'block',
    'width' : width,
    'top' : offset.top,
    'left' : offset.left
  }).html(html);
  if (callback)
    callback();
  setTimeout(function() {
    $('#dialog').fadeIn(200);
    var tmpheight = $('#dialog').height();
    if (tmpheight + offset.top > $(window).height()) {
      if (tmpheight < $(window).height()) {
        offset.top = $(window).height() - tmpheight;
      } else {
        offset.top = 10;
      }
      $('#dialog').css('top', offset.top);
    }
  }, 10);
  return $('#dialog');
}

(function() {
  // the following empty node is for html decode.
  var htmldecodenode = $('<div/>');
  window.htmldecode = function(value) {
    return htmldecodenode.html(value).text();
  };
})();

function formattimespans() {
  $('span.time').each(function() {
    var obj = $(this);
    if (obj.attr('time') && obj.attr('time') != '') {
      obj.html(parsetime(parsedatestr(obj.attr('time'))));
    }
  });
}

function parsedatestr(sss) {
  return new Date(("" + sss).replace('+', 'UTC+'));
}

function fix32(item) {
  if (item.id_str) {
    item.id = item.id_str;
  }
  if (item.in_reply_to_status_id_str) {
    item.in_reply_to_status_id = item.in_reply_to_status_id_str;
  }
  if (item.retweeted && item.retweeted_status && item.retweeted_status.id_str) {
    item.retweeted_status.id = item.retweeted_status.id_str;
  }
}

function gt(a, b) {
  //console.log([a,b])
  if (a.length == b.length) {
    return a > b;
  } else {
    return a.length > b.length;
  }
}

function lt(a, b) {
  if (a.length == b.length) {
    return a < b;
  } else {
    return a.length < b.length;
  }
}

jQuery.extend({
  unselectContents : function() {
    if (window.getSelection)
      window.getSelection().removeAllRanges();
    else if (document.selection)
      document.selection.empty();
  }
});
jQuery.fn.extend({
  selectContents : function() {
    $(this).each(function(i) {
      var node = this;
      var selection, range, doc, win;
      if (( doc = node.ownerDocument) && ( win = doc.defaultView) && typeof win.getSelection != 'undefined' && typeof doc.createRange != 'undefined' && ( selection = window.getSelection()) && typeof selection.removeAllRanges != 'undefined') {
        range = doc.createRange();
        range.selectNode(node);
        if (i == 0) {
          selection.removeAllRanges();
        }
        selection.addRange(range);
      } else if (document.body && typeof document.body.createTextRange != 'undefined' && ( range = document.body.createTextRange())) {
        range.moveToElementText(node);
        range.select();
      }
    });
  },
  setCaret : function() {
    if (!$.browser.msie)
      return;
    var initSetCaret = function() {
      var textObj = $(this).get(0);
      textObj.caretPos = document.selection.createRange().duplicate();
    };
    $(this).click(initSetCaret).select(initSetCaret).keyup(initSetCaret);
  },
  insertAtCaret : function(textFeildValue) {
    var textObj = $(this).get(0);
    if (document.all && textObj.createTextRange && textObj.caretPos) {
      var caretPos = textObj.caretPos;
      caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == '' ? textFeildValue + '' : textFeildValue;
    } else if (textObj.setSelectionRange) {
      var rangeStart = textObj.selectionStart;
      var rangeEnd = textObj.selectionEnd;
      var tempStr1 = textObj.value.substring(0, rangeStart);
      var tempStr2 = textObj.value.substring(rangeEnd);
      textObj.value = tempStr1 + textFeildValue + tempStr2;
      textObj.focus();
      var len = textFeildValue.length;
      textObj.setSelectionRange(rangeStart + len, rangeStart + len);
      textObj.blur();
    } else {
      textObj.value += textFeildValue;
    }
  }
});

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(elem) {
    var len = this.length;
    var from = Number(arguments[1]) || 0;
    from = (from < 0) ? Math.ceil(from) : Math.floor(from);
    if (from < 0) {
      from += len;
    }
    for (; from < len; from++) {
      if ( from in this && this[from] === elem) {
        return from;
      }
    }
    return -1;
  };
}

if (!Array.prototype.remove) {
  Array.prototype.remove = function(elem) {
    var index = this.indexOf(elem);
    if (index !== -1) {
      this.splice(index, 1);
    }
  };
}(function() {
  var short_url_pool = {};
  window.shortsource = function(url) {
    if (!short_url_pool[url] || short_url_pool[url] == '') {
      if (url.length > 1 && url[0] == '<') {
        var x = url.split('"').join("'").split("'").join('>').split('>').join('<').split('<');
        if (x.length <= 1)
          return url;
        var b = x[x.length - 3];
        var c = b.length > 12 ? (b.substr(0, 9) + '..') : b;
        return ['<a href="', x[2], '" target="_blank" title="', b, '">', c, '</a>'].join('');
      } else {
        return url;
      }
    } else {
      return short_url_pool[url];
    }
  };
})();

function parsetime(toTime) {
  var SecMilli = 1000;
  // 秒
  var MinMilli = SecMilli * 60;
  // 分
  var HrMilli = MinMilli * 60;
  // 小时
  var DyMilli = HrMilli * 24;
  // 天
  var key = ':';
  var now = new Date();
  var toMsTime = toTime.getTime();
  var localMsTime = now.getTime();
  var first = 1;
  var arraySecond = [];
  var arrayMinute = [];
  var arrayHour = [];
  // 时间差
  var offset = localMsTime - toMsTime;
  // 格式
  var forTime;

  if (Math.floor(offset / SecMilli) < 0) {
    if (Math.floor(offset / MinMilli) < -15) {
      now.setHours(0, 0, 0, 0);
      toTime.setHours(0, 0, 0, 0);
      offset = now.getTime() - toTime.getTime();
      offsetDy = Math.floor(offset / DyMilli);
      toYear = toTime.getFullYear();
      toMonth = toTime.getMonth() + 1;
      toDay = toTime.getDate();
      forTime = toYear + "/" + toMonth + "/" + toDay;
      if (first === 1)
        arrayHour = arrayHour.concat(key);
    } else {
      forTime = "Just Now";
      if (first === 1)
        arraySecond = arraySecond.concat(key);
    }
  } else if (Math.floor(offset / SecMilli) < 60) {
    forTime = Math.floor(offset / SecMilli) + "s";
    arraySecond = arraySecond.concat(key);
  } else if (Math.floor(offset / MinMilli) < 60) {
    forTime = Math.floor(offset / MinMilli) + "m";
    arrayMinute = arrayMinute.concat(key);
  } else if (Math.floor(offset / HrMilli) < 24) {
    forTime = Math.floor(offset / HrMilli) + "h";
    arrayHour = arrayHour.concat(key);
  } else {
    now.setHours(0, 0, 0, 0);
    toTime.setHours(0, 0, 0, 0);
    var offset = now.getTime() - toTime.getTime();
    var offsetDy = Math.floor(offset / DyMilli);

    var toYear = toTime.getFullYear();
    var toMonth = toTime.getMonth() + 1;
    var toDay = toTime.getDate();

    if (offsetDy == 1) {
      forTime = "yesterday ";
    } else if (now.getFullYear() == toYear) {
      forTime = toMonth + "-" + toDay;
    } else {
      forTime = toYear + "-" + toMonth + "-" + toDay;
    }
  }
  return forTime;
}

function smallmap(obj) {
  var o = $(obj);
  var lat = $(obj).attr('lat');
  var lon = $(obj).attr('long');
  var offset = $(obj).offset();
  simpledialog("<img src='http://maps.google.com/maps/api/staticmap?zoom=6&size=200x200&markers=color:yellow|label:G|" + lat + "," + lon + "&sensor=false' />", false, {
    top : offset.top + 14,
    left : offset.left - 120
  }, 200);
}

function parsetext(raw) {
  raw = raw ? raw : '';
  return raw.replace(/ #([\u4e00-\u9fa5a-z_A-Z0-9]+)/ig, ' #<a href="#" class="hashtag">$1</a>').replace(/@([\u4e00-\u9fa5a-z_A-Z0-9]+)/ig, '@<a href="#" class="peopleat_op">$1</a>');
}

function logout() {
  setConfig('oauthstr', '');
  storage.frameworkParameters = '';
  storage['kwestion-config-notify'] = "";
  storage['kwestion-config-oauthstr'] = "";
  storage['kwestion-config-sinaoauthstr'] = "";
  CallPlugin('onlogout');
  location.reload();
}

var storage = window.localStorage;
