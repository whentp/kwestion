// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab
"use strict";

var WTimeline = Timeline.extend({
  init : function(param) {
  var root = this;
    this.name = param.name;
    this.action = param.action;
    this.user = param.user;
    this.newesttimestamp = 0;
    this.list = [];
    this.unreadcount = 0;
    this.working = false;
    this.type = param.type;
    this.renderTo = null;

 this.urls = {
      'sinahome' : 'http://api.t.sina.com.cn/statuses/home_timeline.json',
      'sinareply' : 'http://api.t.sina.com.cn/statuses/mentions.json',
      'dm' : 'http://api.t.sina.com.cn/direct_messages.json?',
      'sinauser' : 'http://api.t.sina.com.cn/statuses/user_timeline.json?screen_name=' + root.user + '&',
      'following' : 'http://api.t.sina.com.cn/statuses/friends/' + root.user + '.json',
      'follower' : 'http://api.t.sina.com.cn/statuses/followers/' + root.user + '.json',
      'fav' : 'http://api.t.sina.com.cn/favorites/' + root.user + '.json',
      'rtbyme' : "http://api.t.sina.com.cn/statuses/retweeted_by_me.json",
      'rttome' : "http://api.t.sina.com.cn/statuses/retweeted_to_me.json",
      'rtofme' : "http://api.t.sina.com.cn/statuses/retweets_of_me.json",
      'comment' : 'http://api.t.sina.com.cn/statuses/comments_timeline.json'
    };

    if(param.canclose)
      this.canclose = param.canclose;
  },
  getParameters : function() {
    return {
      name : this.name,
      action : this.action,
      user : this.user,
      type : this.type,
      canclose : this.canclose
    };
  },
  check : function(back) {
    var root = this;
    if(root.working) {
      //console.log('prevent a duplicated ajax request.');
      return;
    }
    var params = {};
    if(this.list.length && !back) {
      params.since_id = this.list[this.list.length - 1].id;
    }
    root.working = true;
    ksinareq.ajax({
      url : root.urls[root.action],//'http://api.t.sina.com.cn/statuses/home_timeline.json',
      data : params
    }).done(function(rawdata) {
      root.working = false;
      var data = rawdata;
      $.each(data, function(a, b) {
        fix32(b);
        b.type = root.type;
        if(b.source)
          b.source = shortsource(b.source);
        b.processedtext = b.text;
        b.isnew = true;
      });
      // call plugins.
      var newdata = [];
      for(var i = 0; i < data.length; i++) {
        if(CallPlugin('filter', data[i], data[i].type)) {
          newdata.push(data[i]);
        }
      }
      data = newdata;

      if(data.length) {
        var x = data.length; 
        var newtmp = root.newesttimestamp;
        //root.list[root.list.length - 1].id;
        var tmpindex = root.renderTo.list.length - 1;
        for(var i = 0; i < data.length; i++) {
          if(data[i].id > newtmp) {
            //data[i]['isnew'] = true;
            //root.insert(data[i], i);
            if(root.renderTo) {
              var tmpdate = parsedatestr(data[i].created_at);
              while(tmpindex >= 0 && parsedatestr(root.renderTo.list[tmpindex].created_at) > tmpdate) {
                tmpindex--;
              }
              //console.log(tmpindex);
              if(tmpindex <= 0)
                break;
              root.renderTo.insert(data[i], root.renderTo.list.length - 1 - tmpindex);
              root.renderTo.unreadcount++;
            }
            document.title = '*** kwestion ***';
            if(data[i].user) {
              nq.add(data[i].user.profile_image_url, data[i].user.screen_name, data[i].text);
            }
          }
        }
        if(root.renderTo.unreadcount) {
          root.renderTo.showExtra();
        }
        var tmp = data[0].id;
        root.newesttimestamp = (tmp > root.newesttimestamp) ? tmp : root.newesttimestamp;
      }
    }).fail(function() {
      root.working = false;
    }).always(function() {
      root.working = false;
    });
  }
});
