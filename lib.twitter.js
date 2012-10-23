// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab
"use strict";

var TwitterTimelineBase = Timeline.extend({
  init : function(param) {
    var root = this;
    this.name = param.name;
    this.action = param.action;
    this.user = param.user;
    this.newesttimestamp = "0";
    this.list = [];
    this.unreadcount = 0;
    this.working = false;
    this.type = param.type;
    var listtmp = (this.action == 'list') ? this.user.split('/') : ['', ''];
    this.urls = {
      'home' : tapistr('statuses/home_timeline.json'),
      'reply' : tapistr('statuses/mentions.json'),
      'dm' : tapistr('direct_messages.json?'),
      'user' : tapistr('statuses/user_timeline.json?screen_name=' + root.user + '&'),
      'following' : tapistr('statuses/friends/' + root.user + '.json'),
      'follower' : tapistr('statuses/followers/' + root.user + '.json'),
      'fav' : tapistr('favorites/' + root.user + '.json'),
      'rtbyme' : tapistr("statuses/retweeted_by_me.json"),
      'rttome' : tapistr("statuses/retweeted_to_me.json"),
      'rtofme' : tapistr("statuses/retweets_of_me.json"),
      'list' : tapistr(listtmp[0] + '/lists/' + listtmp[1] + '/statuses.json'),
      'hash' : k_config.twitter_search_api_prefix + 'search.json'
    };
    if (param.canclose)
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
  renderItem : function(itemvalue) {
    var type = itemvalue.type ? itemvalue.type : '';
    var tmpl;
    if (!( tmpl = JST['index_timeline_template' + '_' + type]))
      tmpl = JST.index_timeline_template;
    var tmp = $(tmpl(itemvalue));
    tmp.get(0).raw = itemvalue;
    timelinebindsingle(tmp);
    tmp.find('a.smallmap').click(function() {
      smallmap(this);
      return false;
    });
    if (type == 'follower' || type == 'following') {
      tmp.find('a.foerbutton').click(function() {
        opentab('who fo ' + itemvalue.screen_name, 'follower', itemvalue.screen_name, 'follower', frame.items.length - 1);
        return false;
      });
      tmp.find('a.foingbutton').click(function() {
        opentab(itemvalue.screen_name + ' fo who', 'following', itemvalue.screen_name, 'following', frame.items.length - 1);
        return false;
      });
    }
    CallPlugin('onaddtweet', tmp);
    //console.log($(tmp).text());
    return tmp;
  },
  visible : function() {
    return this.button && this.ktab && this.button.hasClass('k-tab-header-item-focused');
  },
  showExtra : function() {
    if (this.button) {
      if (this.unreadcount) {
        this.button.addClass("k-tab-header-item-unread");
      } else {
        this.button.removeClass("k-tab-header-item-unread");
      }
    }
    if (this.visible()) {
      var x = this.unreadcount;
      x = (x > 0) ? ('(' + x + ')') : '';
      this.ktab.selector.find('span.unread').text(x);
    }
  },
  setAsRead : function() {
    for (var i = this.list.length - 1; i >= 0; i--) {
      this.list[i].isnew = false;
    }
    this.unreadcount = 0;
    this.showExtra();
  }
});

var TTimeline = TwitterTimelineBase.extend({
  check : function(back) {
    var root = this;
    if (root.working) {
      //console.log('prevent a duplicated ajax request.');
      return;
    }
    var params = {
      include_rts : 1
    };
    if (this.list.length && !back) {
      params.since_id = root.newesttimestamp;
      // this.list[this.list.length - 1].id;
    }
    if (this.list.length && back) {
      params.max_id = this.list[0].id;
    }
    root.working = true;
    kreq.ajax({
      url : root.urls[root.action],
      data : params
    }).done(function(rawdata) {
      root.working = false;
      var data = rawdata;
      $.each(data, function(a, b) {
        fix32(b);
        b.type = root.type;
        if (b.text)
          b.processedtext = b.text;
        if (b.source)
          b.source = shortsource(b.source);
      });
      if (data.length) {
        var tmp = data[0].id;

        // call plugins.
        var newdata = [];
        for (var i = 0; i < data.length; i++) {
          if (CallPlugin('filter', data[i], data[i].type)) {
            newdata.push(data[i]);
          }
        }
        data = newdata;

        var x = data.length;
        if (back) {
          for (var i = 0; i < x; i++) {
            var newtmp = root.list[0].id;
            if (lt(data[i].id, newtmp)) {
              root.append(data[i]);
            }
          }
        } else {
          if (root.list.length > 0) {
            var newtmp = root.newesttimestamp;
            // root.list[root.list.length - 1].id;
            for (var i = data.length - 1; i >= 0; i--) {
              if (gt(data[i].id, newtmp)) {
                data[i].isnew = true;
                root.unreadcount++;
                root.add(data[i]);
                document.title = '*** kwestion ***';
                if (data[i].text && myname && myname.length && data[i].text.indexOf(myname) >= 0) {
                  titlesay('[Somebody mention you.]');
                }
                if (data[i].user) {
                  nq.add(data[i].user.profile_image_url, data[i].user.screen_name, data[i].text);
                }
              }
            }
            if (root.unreadcount) {
              root.showExtra();
            }
          } else {
            $.each(data, function(a, b) {
              root.list.unshift(b);
            });
            if (root.klcontainer && root.klcontainer.initItems)
              root.klcontainer.initItems(root.list);
          }
        }

        root.newesttimestamp = gt(tmp, root.newesttimestamp) ? tmp : root.newesttimestamp;
      }
      if (root.visible())
        root.klcontainer.showBottomLoader(false);
    }, 'json').fail(function() {
      root.working = false;
    }).always(function() {
      root.working = false;
    });
  }
});

var UserTTimeline = TTimeline.extend({
  showPanel : function(panel) {
    var root = this;
    if (userinfo[this.user]) {
      $(panel).empty().html(JST.index_userinfo(userinfo[this.user]));
      $(panel).find('.foerbutton').click(function() {
        opentab('who fo ' + userinfo[this.user].screen_name, 'follower', userinfo[root.user].screen_name, 'follower', frame.items.length - 1);
        return false;
      });
      $(panel).find('.foingbutton').click(function() {
        opentab(userinfo[root.user].screen_name + ' fo who', 'following', userinfo[root.user].screen_name, 'following', frame.items.length - 1);
        return false;
      });
      $(panel).find('.followbutton').click(function() {
        follow(this, userinfo[root.user].screen_name);
        return false;
      });
    } else {
      $(panel).empty().html("<br /><img src='loader.gif' /><br />");
      kreq.ajax({
        url : tapistr('users/show.json'),
        data : {
          screen_name : root.user
        }
      }).done(function(data) {
        $(panel).empty().html(JST.index_userinfo(data));
        $(panel).find('.foerbutton').click(function() {
          opentab('who fo ' + data.screen_name, 'follower', data.screen_name, 'follower', frame.items.length - 1);
          return false;
        });
        $(panel).find('.foingbutton').click(function() {
          opentab(data.screen_name + ' fo who', 'following', data.screen_name, 'following', frame.items.length - 1);
          return false;
        });
        $(panel).find('.followbutton').click(function() {
          follow(this, data.screen_name);
          return false;
        });
        //.show(0);
        userinfo[root.user] = data;
      });
    }
  }
});

var HashTTimeline = TwitterTimelineBase.extend({
  check : function(back) {
    var root = this;
    if (root.working) {
      //console.log('prevent a duplicated ajax request.');
      return;
    }
    var params = {};
    params.q = root.user;
    params.page = back ? (Math.ceil(root.list.length / 15) + (((root.list.length % 15) === 0) ? 1 : 0)) : 1;
    root.working = true;
    kreq.ajax({
      url : root.urls[root.action],
      data : params
    }).done(function(rawdata) {
      root.working = false;
      var data = $.map(rawdata.results, function(val) {
        var newval = val;
        newval.user = {
          screen_name : val.from_user,
          profile_image_url : val.profile_image_url
        }
        if (val.to_user) {
          newval.in_reply_to_screen_name = val.to_user;
        }
        newval.processedtext = val.text;
        newval.source = htmldecode(val.source);
        return newval;
      });
      $.each(data, function(a, b) {
        fix32(b);
        b.type = root.action;
        if (b.source)
          b.source = shortsource(b.source);
      });
      // call plugins.
      var newdata = [];
      for (var i = 0; i < data.length; i++) {
        if (CallPlugin('filter', data[i], data[i].type)) {
          newdata.push(data[i]);
        }
      }
      data = newdata;

      //console.log(params, data);
      if (data.length) {
        var tmp = data[0].id;
        //root.newesttimestamp = gt(tmp, root.newesttimestamp) ? tmp:root.newesttimestamp;
        var x = data.length;
        if (back) {
          for (var i = 0; i < x; i++) {
            var newtmp = root.list[0].id;
            if (lt(data[i].id, newtmp)) {
              root.append(data[i]);
            }
          }
        } else {
          if (root.list.length > 0) {
            var newtmp = root.list[root.list.length - 1].id;
            for (var i = data.length - 1; i >= 0; i--) {
              if (gt(data[i].id, newtmp)) {
                data[i]['isnew'] = true;
                root.unreadcount++;
                root.add(data[i]);
              }
            }
            if (root.unreadcount) {
              root.showExtra();
            }
          } else {
            $.each(data, function(a, b) {
              root.list.unshift(b);
            });
            if (root.klcontainer && root.klcontainer.initItems)
              root.klcontainer.initItems(root.list);
          }
        }
      }
      if (root.visible())
        root.klcontainer.showBottomLoader(false);
    }).fail(function() {
      root.working = false;
    }).always(function() {
      root.working = false;
    });
  }
});

var UserlistTTimeline = TwitterTimelineBase.extend({
  check : function(back) {
    var root = this;
    if (root.working) {
      //console.log('prevent a duplicated ajax request.');
      return;
    }
    //console.log(root.user);
    var params = {
      cursor : back ? root.page : '-1'
    };

    root.working = true;
    kreq.ajax({
      url : root.urls[root.action],
      data : params
    }).done(function(rawdata) {
      root.working = false;
      var data = rawdata.users;
      if (!root.page || back) {
        root.page = rawdata.next_cursor_str;
      }
      $.each(data, function(a, b) {
        fix32(b);
        b.type = root.type;
      });
      if (back) {
        root.page = rawdata.next_cursor_str;
        for (var i = 0; i < data.length; i++) {
          root.append(data[i]);
        }
      } else {
        if (root.list.length > 0) {
          for (var i = data.length - 1; i >= 0; i--) {
            root.add(data[i]);
          }
        } else {
          $.each(data, function(a, b) {
            root.list.unshift(b);
          });
          if (root.klcontainer && root.klcontainer.initItems)
            root.klcontainer.initItems(root.list);
        }
      }
      if (root.visible())
        root.klcontainer.showBottomLoader(false);
    }).fail(function() {
      root.working = false;
    }).always(function() {
      root.working = false;
    });
  },
});
