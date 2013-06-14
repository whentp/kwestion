// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab
if (!k_plugins)
  var k_plugins = {};

/*Plugin: add prefix and suffix when sending. */

k_plugins.basic = {
  filter : function(msg, type) {
    if (msg.processedtext) {
      var inputText = msg.processedtext;
      var replaceText, replacePattern1, replacePattern2, replacePattern3;
      replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
      replacedText = inputText.replace(replacePattern1, '<a target="_blank" class="unprocessedlink" href="$1">$1</a>');
      replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
      replacedText = replacedText.replace(replacePattern2, '$1<a target="_blank" class="unprocessedlink" href="http://$2">$2</a>');
      replacePattern3 = / (\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
      replacedText = replacedText.replace(replacePattern3, ' <a target="_blank" class="unprocessedlink" href="mailto:$1">$1</a>');
      msg.processedtext = replacedText;
    }
    if (msg.retweeted_status) {
      msg.processedtext += '<div class="retweet_status">This is an official retweet' + (msg.retweet_count ? (' <span>(' + msg.retweet_count + (msg.retweet_count < 2 ? ' time' : ' times') + ')') : '') + '</span>.</div>';
    }
    return true;
  },
  name : 'Basic',
  ui : function() {
    return "Click <a href='https://github.com/whentp/kwestion/issues' target='_blank' style='color:red;font-weight:bold;'>here</a> to report bugs. Current Version: " + k_config.version;
  },
  onaddtweet : function(tweetobj) {
    var previewimg = function(urlstr) {
      var tmp = urlstr.replace(/http:\/\/instagr.am\/p\/([^\/]+?)\//ig, 'http://instagr.am/p/$1/<div style="border:1px solid #ccc; background:#eee;display:block;margin:2px; padding:3px; text-align:center;"><img src="http://instagr.am/p/$1/media/?size=t" /></div>');
      tmp = tmp.replace(/http:\/\/instagram.com\/p\/([^\/]+?)\//ig, 'http://instagr.am/p/$1/<div style="border:1px solid #ccc; background:#eee;display:block;margin:2px; padding:3px; text-align:center;"><img src="http://instagr.am/p/$1/media/?size=t" /></div>');
      return tmp;
    }

    var raw = tweetobj.get(0).raw;
    if (!window.longurlcache) window.longurlcache = {};
    if(raw.entities && raw.entities.urls){
      $.each(raw.entities.urls, function(a, b){
        longurlcache[b.url] = b.expanded_url;
      });
    }
    if(raw.entities && raw.entities.media){
      $.each(raw.entities.media, function(a, b){
        longurlcache[b.url] = b.expanded_url;
      });
    }
    tweetobj.find('a.unprocessedlink').each(function() {
      var url = $.trim(this.innerHTML);
      if (url.indexOf('/t.co/') >= 0) {
        if (longurlcache[url]) {
          this.innerHTML = previewimg(longurlcache[url]);
          $(this).attr('href', longurlcache[url]);
        } else {
          var root = this;
          $.get('http://www.longurlplease.com/api/v1.1', {
            q : url
          }, function(data) {
            longurlcache[url] = data[url];
            root.innerHTML = previewimg(longurlcache[url]);
            $(root).attr('href', longurlcache[url]);
          }, 'json');
        }
      }
    });
  }
};

k_plugins.prefix = {
  name : 'Prefix & Suffix',
  ui : function() {
    return 'Prefix:<input type="text" style="width:100px;" id="prefix" value="' + getConfig('msg_prefix') + '" class="border1" /> Suffix:<input type="text" style="width:100px;" id="suffix" value="' + getConfig('msg_suffix') + '" class="border1" />';
  },
  init : function() {
    $('#prefix').blur(function() {
      setConfig('msg_prefix', $('#prefix').val());
    });
    $('#suffix').blur(function() {
      setConfig('msg_suffix', $('#suffix').val());
    });
  },
  beforesend : function(msg) {
    return $.trim($.trim(getConfig('msg_prefix') + ' ' + msg) + getConfig('msg_suffix'));
  }
};

/*Plugin: Switch off Geo-information*/
k_plugins.geoinformation = {
  name : 'Geo',
  ui : function() {
    return '<input type="checkbox" id="checkboxgeo" value="stop" ' + (getConfig('stopgeoinfo') == 'stop' ? 'checked' : '') + ' />Prevent kwestion from sending Geo-information.';
  },
  init : function() {
    $('#checkboxgeo').click(function() {
      setConfig('stopgeoinfo', ($('#checkboxgeo:checked').size() > 0 ? "stop" : ''));
    });
  }
};

/*Plugin: filter.*/
k_plugins.filter_content = {
  name : 'Filter',
  ui : function() {
    return '<table><tr><td style="border-right:1px solid #aaa;">Filter tweets containing the following strings.<br /><textarea id="filter_content" class="border1"></textarea></td><td>Filter tweets by these IDs. Each string a line.<br /><textarea id="filter_content_id" class="border1"></textarea></td></tr></table>';
  },
  init : function() {
    $('#filter_content').val(getConfig('filter_content'));
    $('#filter_content').blur(function() {
      setConfig('filter_content', $('#filter_content').val());
    });
    $('#filter_content_id').val(getConfig('filter_content_id'));
    $('#filter_content_id').blur(function() {
      setConfig('filter_content_id', $('#filter_content_id').val());
    });
  },
  filter : function(msg, type) {
    var xxx = getConfig('filter_content').split("\n");
    if (!xxx.length)
      return true;
    for (var i = xxx.length - 1; i >= 0; i--) {
      var ttt = $.trim(xxx[i]);
      if (ttt.length && msg.text && msg.text.indexOf(ttt) >= 0)
        return false;
    }
    xxx = getConfig('filter_content_id').split("\n");
    if (!xxx.length)
      return true;
    for (var i = xxx.length - 1; i >= 0; i--) {
      var ttt = $.trim(xxx[i]).toLowerCase();
      if (ttt.length && ((msg.user && msg.user.screen_name && msg.user.screen_name.toLowerCase() == ttt) || (msg.from_user && msg.from_user.toLowerCase() == ttt)))
        return false;
    }
    return true;
  }
};

k_plugins.closenotify = {
  name : 'Close notification',
  ui : function() {
    return '<input type="checkbox" id="closenotification" ' + ((getConfig('notify') == 'no') ? 'checked' : '') + ' />Check to close notification.';
  },
  init : function() {
    $('#closenotification').click(function() {
      setConfig('notify', (getConfig('notify') != 'no') ? 'no' : '');
    });
  }
};

k_plugins.sinahometimeline = {
  name : 'Your Weibo Home',
  ui : function() {
    return ((getConfig('sinaaccesstoken')) ? 'You have been authorized. Click to <a href="#" id="sinaunauth">Unauthorize</a>. ' : 'First click <a href="#" id="sinaauth">Authorize</a>, then ') + '<br /><a href="#" id="startweibobutton">Start</a>|<a href="#" id="stopweibobutton">Stop</a>.';
  },
  onlogout : function() {
    window.sina_access_token = null;
    setConfig('sinaaccesstoken', '');
  },
  init : function() {
    var root = this;

    $("#sinaunauth").click(function() {
      root.stop();
      window.sina_access_token = null;
      setConfig('sinaaccesstoken', '');
      $('#dialogbackground').click();
    });

    $("#sinaauth").click(function() {
      window.sina_access_token = getConfig('sinaaccesstoken');
      if (!sina_access_token) {
        simpledialog(JST.index_sinapinlogin({
          name : 'sina weibo'
        }), function() {
          $(".pinlogin").height($(window).height());
          $('a.gettwitterpin').click(function() {
            window.open('https://api.weibo.com/oauth2/authorize?client_id=2543274311&response_type=code&redirect_uri=http://github.com/whentp/kwestion', '', 500, 400);
          });
          $('#sendping').click(function() {
            var tmppin = $('#pinvalue').val();
            if (tmppin) {
              $.post('https://api.weibo.com/oauth2/access_token', {
                client_id : '2543274311',
                client_secret : 'e87c4ea3e711d2bc127d01afd2a3c12b',
                grant_type : 'authorization_code',
                redirect_uri : 'http://github.com/whentp/kwestion',
                code : tmppin
              }, function(data) {
                //example: {"access_token":"2.00u55642OKswbB6p_HmCf8d83fHe2492525632236se2iJmcsdsdKE","remind_in":"170301","expires_in":170301,"uid":"1465295904"}
                window.sina_access_token = data.access_token;
                setConfig('sinaaccesstoken', sina_access_token);
                $('#dialogbackground').click();
                root.start();
              }, 'json').fail(function(data) {
                alert('error');
              });
            }
            return false;
          });
        }, {
          top : 0,
          left : 0
        }, '100%');

      }
    });
    $("#startweibobutton").click(root.start);
    $("#stopweibobutton").click(root.stop);
  },
  stop : function() {
    setConfig('sinaoauthstr', '');
    clearInterval(window.sinaweibohomeinterval);
    window.sinaweibohomeinterval = null;
    clearInterval(window.sinaweiboreplyinterval);
    window.sinaweiboreplyinterval = null;
    clearInterval(window.sinaweibo_comment_interval);
    window.sinaweibo_comment_interval = null;
    $('#dialogbackground').click();
  },
  start : function() {
    if (window.sinaweibohomeinterval) {
      alert('already start.');
    } else {
      if (!sina_access_token) {
        alert('Pls click Authorize.');
        return;
      }
      var sinaweibotimeline = new WTimeline({
        name : 'sinahome',
        action : 'sinahome',
        type : 'sina',
        'user' : ''
      });
      sinaweibotimeline.renderTo = frame.findTimeline('home');
      sinaweibotimeline.check();
      window.sinaweibohomeinterval = setInterval(function() {
        sinaweibotimeline.working = false;
        sinaweibotimeline.check();
      }, 60000);
    }
    if (window.sinaweiboreplyinterval) {
      alert('already start.');
    } else {
      var sinaweiboreplytimeline = new WTimeline({
        name : 'sinareply',
        action : 'sinareply',
        type : 'sina',
        'user' : ''
      });
      sinaweiboreplytimeline.renderTo = frame.findTimeline('reply');
      sinaweiboreplytimeline.check();
      window.sinaweiboreplyinterval = setInterval(function() {
        sinaweiboreplytimeline.working = false;
        sinaweiboreplytimeline.check();
      }, 124000);
    }
    if (window.sinaweibo_comment_interval) {
      alert('already start.');
    } else {
      var sinaweibo_comment_timeline = new WTimeline({
        name : 'sinacomment',
        action : 'comment',
        type : 'sina',
        'user' : ''
      });
      sinaweibo_comment_timeline.renderTo = frame.findTimeline('reply');
      sinaweibo_comment_timeline.check();
      window.sinaweibo_comment_interval = setInterval(function() {
        sinaweibo_comment_timeline.working = false;
        sinaweibo_comment_timeline.check();
      }, 123000);
    }
    $('#dialogbackground').click();
  },
  pageload : function() {
    var root = this;
    window.sina_access_token = getConfig('sinaaccesstoken');
    if (window.sina_access_token) {
      setTimeout(k_plugins.sinahometimeline.start, 10000);
    }
    return true;
  }
};
