// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab
"use strict";

var kltoolbar;

function KinitToolbar() {
  kltoolbar = $($('#floattoolbar').tmpl({}));
  kltoolbar.find("li").hover(function() {
    $(this).addClass("hover");
    $('ul:first', this).css('visibility', 'visible');
  }, function() {
    $(this).removeClass("hover");
    $('ul:first', this).css('visibility', 'hidden');

  });
  $("ul.dropdown li ul li:has(ul)").find("a:first").append(" &raquo; ");
}

var KFloatToolbar = Class.extend({
  init : function() {
    this.items = {};
    this.cached = {};
  },
  getToolbar : function(name) {
    var root = this;

    if(root.items[name]) {
      if(root.cached[name]) {
        return {
          template : $(root.cached[name]),
          init : root.items[name].init ? root.items[name].init : function() {
          }
        };
      } else {
        var selector = $(root.items[name].template).tmpl({});
        //console.log(selector);
        if($(selector).size() > 0) {
          root.cached[name] = selector;
          $.each(root.items[name].actions, function(a, b) {
            selector.find('a.' + a).click(b);
          });
          return root.getToolbar(name);
        } else {
          alert("no template of template");
          return false;
        }
      }
    } else {
      alert('no definition');
      return false;
    }
  }
});

var toolbarpool = new KFloatToolbar();
toolbarpool.items.twitter = {
  actions : {
    reply : function() {
      replymsg($(this), toolbarpool.raw);
    },
    retweet : function() {
      showrtdialog(this, toolbarpool.raw);
    },
    del : function() {
      deletetweet(toolbarpool.raw.id);
      return false;
    },
    fav : function() {
      favoritetweet(this, toolbarpool.raw);
      return false;
    }
  },
  template : '#toolbar-twitter',
  init : function(jobj, raw) {
    if(raw.in_reply_to_status_id && raw.in_reply_to_status_id != '') {
      $(jobj).find('li.inreplyto').show(0);
      $(jobj).find('.showthread').text(raw.in_reply_to_screen_name).off().click(function() {
        showthread(this, raw);
      });
    } else {
      $(jobj).find('li.inreplyto').css('display', 'none');
    }
    if(raw.user.screen_name == myname) {
      $(jobj).find('li.del').show(0);
    } else {
      $(jobj).find('li.del').css('display', 'none');
    }
    $(jobj).find('a.fav').text(raw.favorited ? 'Unfavorite' : 'Favorite');

  }
};

toolbarpool.items.home = toolbarpool.items.reply = toolbarpool.items.hash = toolbarpool.items.user = toolbarpool.items.fav = toolbarpool.items.rtofme = toolbarpool.items.rttome = toolbarpool.items.rtbyme = toolbarpool.items.twitter;

toolbarpool.items.dm = {
  actions : {
    dm : function() {
      in_reply_to = false;
      $("#message").val("d " + toolbarpool.raw.sender.screen_name + " ").focus();
      return false;
    },
    del : function() {
      deldm(toolbarpool.raw.id);
      return false;
    }
  },
  template : '#toolbar-dm',
  init : function(jobj, raw) {
  }
};

toolbarpool.items.following = toolbarpool.items.follower = {
  actions : {
    follow : function() {
      follow($(this), toolbarpool.raw.screen_name, function() {
        toolbarpool.raw.following = !toolbarpool.raw.following;
      });
    },
    block : function() {
      sorry();
    }
  },
  template : '#toolbar-userlist',
  init : function(jobj, raw) {
    if(raw.following) {
      $(jobj).find('a.follow').text('Unfollow');
    } else {
      $(jobj).find('a.follow').text('Follow');
    }
  }
};

toolbarpool.items.sina = {
  actions : {},
  template : '#toolbar-sina'
};
