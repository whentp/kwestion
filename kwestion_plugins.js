// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab
if(!k_plugins)
  var k_plugins = {};

/*Plugin: add prefix and suffix when sending. */

k_plugins.basic = {
  filter : function(msg, type) {
    if(msg.processedtext) {
      var inputText = msg.processedtext;
      var replaceText, replacePattern1, replacePattern2, replacePattern3;
      replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
      replacedText = inputText.replace(replacePattern1, '<a target="_blank" href="$1">$1</a>');
      replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
      replacedText = replacedText.replace(replacePattern2, '$1<a target="_blank" href="http://$2">$2</a>');
      replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
      replacedText = replacedText.replace(replacePattern3, '<a target="_blank" href="mailto:$1">$1</a>');
      msg.processedtext = replacedText;
    }
    return true;
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
    return '<div>Ignore tweets containing the following strings. Each string a line.</div><textarea id="filter_content" class="border1"></textarea><div>Ignore tweets sent by the following IDs. Each string a line.</div><textarea id="filter_content_id" class="border1"></textarea>';
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
    if(!xxx.length)
      return true;
    for(var i = xxx.length - 1; i >= 0; i--) {
      var ttt = $.trim(xxx[i]);
      if(ttt.length && msg.text && msg.text.indexOf(ttt) >= 0)
        return false;
    }
    xxx = getConfig('filter_content_id').split("\n");
    if(!xxx.length)
      return true;
    for(var i = xxx.length - 1; i >= 0; i--) {
      var ttt = $.trim(xxx[i]).toLowerCase();
      if(ttt.length && ((msg.user && msg.user.screen_name && msg.user.screen_name.toLowerCase() == ttt) || (msg.from_user && msg.from_user.toLowerCase() == ttt)))
        return false;
    }
    return true;
  }
};

/*Plugin: images' thumbs. */
k_plugins.imgpreview = {
  name : 'Preview images',
  ui : function() {
    return 'Working...';
  },
  init : function() {

  },
  filter : function(msg, type) {
    if(msg.processedtext) {
      msg.processedtext = ' ' + msg.processedtext.replace(/>http:\/\/instagr.am\/p\/([\d\w]+?)\/</ig, '>http://instagr.am/p/$1/<img src="http://instagr.am/p/$1/media/?size=t" /><');
      //.replace(/>http:\/\/img.ly\/(.*?)</ig,'>http://img.ly/$1<img src="http://img.ly/show/medium/$1" /><')
      //.replace(/>http:\/\/picplz.com\/([\d\w]+?)</ig, '>http://picplz.com/$1 <img src="http://picplz.com/$1/thumb/200" /><')
      //.replace(/>http:\/\/picplz.com\/.*?\/pic\/([\d\w]+?)\/</ig, '>http://picplz.com/$1 <img src="http://picplz.com/$1/thumb/200" /><');
    }
    return true;
  }
};

k_plugins.showretweet = {
  name : 'Format retweets',
  ui : function() {
    return 'Working...';
  },
  init : function() {

  },
  filter : function(msg, type) {
    if(msg.retweeted_status) {
      msg.processedtext += '<div class="retweet_status">This is an official retweet' + (msg.retweet_count ? (' <span>(' + msg.retweet_count + (msg.retweet_count < 2 ? ' time' : ' times') + ')') : '') + '</span>.</div>';
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
    return ((window.ksinareq && getConfig('sinaoauthstr')) ? 'You have been authorized. ' : 'First click <a href="#" id="sinaauth">Authorize</a>, then ') + '<a href="#" id="startweibobutton">Start</a>.';
  },
  init : function() {
    var root = this;
    $("#sinaauth").click(function() {
      window.ksinareq = null;
      var oauthstr = getConfig('sinaoauthstr');
      if(oauthstr) {
        ksinareq = new Koauth({});
        ksinareq.loadFromString(oauthstr);
      } else {
        window.ksinareq = new Koauth({
          consumerKey : k_config.sina_consumer_key,
          consumerSecret : k_config.sina_consumer_secret
        });

        simpledialog($("#sinapinlogin").tmpl({
          name : 'sina weibo'
        }), function() {
          $(".pinlogin").height($(window).height());
          $('a.gettwitterpin').click(function() {
            ksinareq.requestPin('http://api.t.sina.com.cn/oauth/request_token', function(data) {
              window.open('http://api.t.sina.com.cn/oauth/authorize?' + data);
            });
          });
          $('#sendping').click(function() {
            var tmppin = $('#pinvalue').val();
            if(tmppin) {
              ksinareq.accessByPin('http://api.t.sina.com.cn/oauth/access_token', tmppin, function(data) {
                setConfig('sinaoauthstr', ksinareq.toString());
                $('#dialogbackground').click();
                root.start();
              }, function(data) {
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
  },
  start : function() {
    if(window.sinaweibointerval) {
      alert('already start.');
    } else {
      var sinaweibotimeline = new WTimeline({
        name : 'sinahome',
        action : 'sina',
        type : 'sina',
        'user' : ''
      });
      sinaweibotimeline.renderTo = frame.findTimeline('home');
      sinaweibotimeline.check();
      window.sinaweibointerval = setInterval(function() {
        sinaweibotimeline.working = false;
        sinaweibotimeline.check();
      }, 60000);
      //alert('OK.');
    }
  },
  pageload : function() {
    var root = this;
    window.ksinareq = null;
    var oauthstr = getConfig('sinaoauthstr');
    if(oauthstr) {
      ksinareq = new Koauth({});
      ksinareq.loadFromString(oauthstr);
      setTimeout(k_plugins.sinahometimeline.start, 10000);
    }
    return true;
  }
};
