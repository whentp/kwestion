// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab

var tmp = null;
var xxx = null;
var timelinepool = [];

var KList = Class.extend({
  init : function(selector) {
    var root = this;
    var elem = $(selector);
    this.userpanel = $("<div class='userpanel'><b>Create</b> new tabs or <b>Drag & Drop</b> tabs from other columns.</div>").appendTo(elem);
    this.container = $("<div class='k-list-container'><div class='k-list-item-wrap'></div></div>");
    this.end = root.container.find("div.k-list-item-wrap");
    elem.append(root.container);
  },
  wrapElement : function(selector) {
    return $(selector).wrap('<div class="k-list-item-wrap"></div>').parent();
  },
  removeEmptyContent : function(selector) {
    if (this.list && this.list.length > 0) {
      this.container.find('.emptycontent').detach().remove();
    }
  },
  insert : function(selector, index) {
    this.removeEmptyContent();
    this.wrapElement(selector).insertBefore(this.container.children("div:eq(" + index + ")")).hide(0).slideDown('slow');
  },
  add : function(selector) {
    this.removeEmptyContent();
    this.wrapElement(selector).prependTo(this.container).hide(0).slideDown('slow');
  },
  append : function(selector) {
    this.removeEmptyContent();
    this.wrapElement(selector).insertBefore(this.end).hide(0).slideDown('slow');
  },
  clear : function() {
    this.container.empty().html("<div class='k-list-item-wrap'></div>");
    this.end = this.container.find("div.k-list-item-wrap");
  },
  initItems : function(items) {
    var root = this;
    if (items.length) {
      root.container.find('.emptycontent').detach().remove();
      $.each(items, function() {
        root.wrapElement($(root.renderItem(this))).prependTo(root.container);
      });
    } else {
      $('<div class="emptycontent">No content.</div>').insertBefore(root.end);
    }
  },
  renderItem : function(itemValue) {
    if (this.list && this.list.renderItem) {
      return this.list.renderItem(itemValue);
    } else {
      return "<div>" + itemValue + "</div>";
    }
  },
  showBottomLoader : function(show) {
    if (show) {
      var offset = this.container.offset();
      var width = this.container.width();
      var height = this.container.height();
      $('div.bottom-loader').css({
        top : ($(window).height() - 31),
        left : (offset.left + width / 2 - 40),
        display : 'block',
        visibility : 'visible'
      });
    } else {
      $('div.bottom-loader').hide();
    }
  },
  onComplete : function() {
    this.showBottomLoader(false);
  }
});

var KTab = Class.extend({
  init : function(selector) {
    var root = this;
    this.selector = $(selector).html('<div class="k-tab"><ul class="k-tab-header clear"><li class="k-tab-header-add">+</li></ul><div class="k-tab-toolbar clear"><span class="unread"></span> <div class="k-tab-toolbar-container clear"><button class="read">Read</button><button class="refresh">Refresh</button></div></div><div class="k-list clear"></div></div>');
    this.tab_header = $(selector).find('ul.k-tab-header');
    this.listselector = $(selector).find('div.k-list');
    this.listselector.scroll(function() {
      if (($(this).height() + this.scrollTop) >= this.scrollHeight) {
        if (root.current_timeline && root.current_timeline.check) {
          root.list.showBottomLoader(true);
          root.current_timeline.check(true);
        }
      }
    }).scrollTop(0);
    this.button_addnew = $(selector).find('li.k-tab-header-add');
    this.button_addnew.click(function() {
      if (root.addListCallback) {
        root.addListCallback(this, root.index);
      } else if (window.addListCallback) {
        window.addListCallback(this, root.index);
      } else {
        alert('addListCallback is missing.');
      }
    });
    this.list = new KList(this.listselector);
    this.current_timeline = null;
    $(selector).find('button.read').click(function() {
      if (root.current_timeline) {
        root.current_timeline.setAsRead();
        root.listselector.find('.unread').removeClass('unread');
        settitle();
      }
    });
    $(selector).find('button.refresh').click(function() {
      if (root.current_timeline) {
        root.current_timeline.check();
      }
    });
    this.items = [];
  },
  getParameters : function() {
    return $.map(this.items, function(x) {
      if (x.getParameters) {
        return x.getParameters();
      } else {
        return null;
      }
    });
  },
  addList : function(tl, activiate) {
    /*
     * data is a dict {name, list, canclose, render}
     * name is a string.
     * list must contain xxxxxxx
     * */
    var root = this;
    //console.log('addlist',tl)
    var tmpelem = $("<li class='k-tab-header-item'>" + tl.name + "<a href='#' class='k-tab-header-close' " + ((tl.canclose ? '' : "style='display:none;'") + ">x</a></li>"));
    tmpelem.attr('draggable', 'true').click(function() {
      root.KTabItemClick(this, root, tl);
    }).on('dragstart', function(ev) {
      root.KTabDragStart(ev, tmpelem, tl);
    }).on('dragend', function(ev) {
      return false;
    }).on('dragenter', returnFalse).on('dragleave', returnFalse).on('dragover', returnFalse);
    $(tmpelem.find(".k-tab-header-close")).click(function() {
      root.KTabCloseClick(this, root, tl);
    });
    tl.button = tmpelem;
    tl.ktab = root;
    tmpelem.insertBefore(this.button_addnew);
    var lists = this.tab_header.find("li.k-tab-header-item");
    if (lists.size() == 1) {
      $(lists.get(0)).click();
    }
    root.items.push(tl);
    if (activiate) {
      tmpelem.click();
    }
    if (onAddList) {
      onAddList();
    }
  },
  KTabDragStart : function(ev, obj, tl) {
    var dt = ev.originalEvent.dataTransfer;
    var listindex = tl.ktab.items.indexOf(tl);
    var tabindex = tl.ktab.parent.items.indexOf(tl.ktab);
    dt.setData("text/plain", JSON.stringify({
      list : listindex,
      tab : tabindex
    }));
    return true;
  },
  KTabCloseClick : function(selector, root, tl) {
    if (tl && tl.showPanel) {
      tl.showPanel(root.selector.find('.userpanel').hide(0));
    }

    var obj = $(selector);
    var tmp = obj.parent();
    if (tmp.hasClass('k-tab-header-item-focused')) {
      var container = tmp.parent();
      if (tmp.prev().size()) {
        tmp.prev().click();
      } else if (!tmp.next().hasClass('k-tab-header-add')) {
        //console.log(tmp.next());
        tmp.next().click();
      } else {
        root.selector.find('.userpanel').html("<div class='userpanel'><b>Create</b> new tabs or <b>Drag & Drop</b> tabs from other columns.</div>").show(0);
        tl.klcontainer.clear();
        $('<div class="emptycontent"></div>').insertBefore(tl.klcontainer.end);
      }
    }
    tmp.detach().remove();
    if (tl && tl.destroy) {
      if (root.current_timeline == tl)
        root.current_timeline = null;
      tl.klcontainer = null;
      root.items.remove(tl);
      tl.destroy();
      delete tl;
      //here is a leak point. seriously.
      //a refcount problem. How to set free of this object.
      //maybe a monitor class should be designed.
      //timelinepool.remove(tl);
    }
    root.parent.save();
  },
  KTabItemClick : function(selector, root, tl) {
    //return;
    var obj = $(selector);
    var container = obj.parent();
    var refresh = false;
    //console.log('before', tl);
    if (root.current_timeline != tl) {
      refresh = true;
    }
    if (tl.showPanel) {
      tl.showPanel(root.selector.find('.userpanel').show(0));
    } else {
      root.selector.find('.userpanel').empty().hide(0);
    }
    container.find('.k-tab-header-item-focused').removeClass('k-tab-header-item-focused');
    obj.addClass('k-tab-header-item-focused');
    root.list.list = null;
    if (root.current_timeline)
      root.current_timeline.klcontainer = null;
    tl.setListContainer(root.list);
    root.current_timeline = tl;
    if (refresh) {
      root.list.clear();
      if (tl.showExtra)
        tl.showExtra();
      //console.log('init list', tl);
      root.list.initItems(tl.list);
    } else {
      tl.check();
    }
  }
});

var Timeline = Class.extend({
  list : [],
  klcontainer : null,
  init : function() {
  },
  setListContainer : function(klcontainer) {
    this.klcontainer = klcontainer;
    klcontainer.list = this;
  },
  renderItem : function(itemValue) {
    return "<div>%% " + itemValue + "</div>";
  },
  add : function(value) {
    this.list.push(value);
    if (this.klcontainer) {
      this.klcontainer.add(this.renderItem(value));
    }
  },
  insert : function(value, index) {
    this.list.splice(this.list.length - index, 0, value);
    if (this.klcontainer) {
      this.klcontainer.insert(this.renderItem(value), index);
    }
  },
  append : function(value, index) {
    this.list.unshift(value);
    if (this.klcontainer) {
      this.klcontainer.append(this.renderItem(value), index);
    }
  },
  clear : function(value, index) {
    this.list.length = 0;
    if (this.klcontainer) {
      this.klcontainer.clear();
      $('<div class="emptycontent">No content.</div>').insertBefore(this.klcontainer.end);
    }
  },
  destroy : function() {
    //this.list.length = [];
  }
});

var KFramework = Class.extend({
  init : function(selector) {
    this.container = $(selector);
    this.items = [];
  },
  getParameters : function() {
    return $.map(this.items, function(x) {
      return [x.getParameters()];
    });
  },
  setColumnCount : function(count) {
    var root = this;
    this.container.empty();
    var sb = [];
    var windowwidth = $(window).width();
    if (count > windowwidth / 320) {
      count = Math.floor(windowwidth / 320);
    }
    count = (count < 1) ? 1 : count;
    for (var i = 0; i < count; i++) {
      sb.push('<div class="panel clear"><div class="k-tab-header clear"></div><div class="k-list clear"></div></div>');
    }
    this.container.html(sb.join(''));
    var tmpw = Math.floor($(window).width() / count);
    var tmph = Math.floor($(window).height() - 10);
    if (this.newcss) {
      this.newcss.detach().remove();
    }
    var olditems = this.items;
    this.items = [];
    this.container.find('.panel').addClass('constraint').width(tmpw).height(tmph).each(function() {
      var ktab = new KTab(this);
      ktab.parent = root;
      ktab.index = root.items.length;
      root.items.push(ktab);
    });
    var index = 0;
    this.container.find('ul').each(function() {
      $(this).attr('index', index++);
      this.root = root;
    });
    var maxindex = root.items.length - 1;
    for (var i = 0; i < olditems.length; i++) {
      var tmpindex = (i < maxindex) ? i : maxindex;
      for (var j = 0; j < olditems[i].items.length; j++) {
        root.items[tmpindex].addList(olditems[i].items[j]);
      }
    }

    this.container.find('ul').off('dragenter').off('dragleave').off('dragover').off('drop').on('dragenter', function(ev) {
      $(ev.target).addClass('dragover');
      return false;
    }).on('dragleave', function(ev) {
      $(ev.target).removeClass('dragover');
      return false;
    }).on('dragover', function(ev) {
      return false;
    }).on('drop', function(ev) {
      var dt = ev.originalEvent.dataTransfer;
      var cindex = $(this).attr('index');
      var tmp = JSON.parse(dt.getData('text/plain'));
      $(ev.target).removeClass('dragover');
      if (tmp.tab != cindex) {
        this.root.moveTimeline(this.root.items[tmp.tab].items[tmp.list], cindex);
      }
      return false;
    });
    return count;
  },
  moveTimeline : function(tl, to) {
    var root = this;
    var tmpitems = tl.list;
    //backup the list;
    tl.button.find('.k-tab-header-close').click();
    tl.list = tmpitems;
    //console.log(root.items[to]);
    root.items[to].addList(tl, true);
  },
  findTimeline : function(action, user) {
    for (var i = 0; i < this.items.length; i++) {
      for (var j = 0; j < this.items[i].items.length; j++) {
        var tmp = this.items[i].items[j];
        if (action == tmp.action && (!user || user == tmp.user)) {
          return this.items[i].items[j];
        }
      }
    }
    return false;
  },
  save : function() {
    var tmp = this.getParameters();
    if (window.localStorage) {
      setConfig('frameworkParameters', tmp);
    } else {
      alert('Sorry. LocalStorage is required.');
    }
  },
  CreateTimelineByType : function(j) {
    var root = this;
    if (root.timelineType) {
      //console.log(j.type);
      if (root.timelineType[j.type]) {
        return new root.timelineType[j.type](j);
      } else {
        return new root.timelineType['default'](j);
      }
    } else {
      alert("timelineType is missing");
    }
  },
  load : function() {
    var root = this;
    if (window.localStorage) {
      var tmp = [[{
        name : 'Home',
        user : '',
        action : 'home',
        type : 'home',
      }], [{
        name : 'Reply',
        user : 'whentp',
        action : 'reply',
        type : 'reply',
      }], [{
        name : 'DM',
        user : '',
        action : 'dm',
        type : 'dm',
        canclose : true
      }]];
      // here the parsing procedure should be doublechecked.
      if (getConfig('frameworkParameters')) {
        var xtmp = getConfig('frameworkParameters');
        //if(xtmp.length && typeof xtmp == 'Array'){
        tmp = xtmp;
        //}
      }
      var columncount = this.setColumnCount(tmp.length);
      // here a merge is required. but i have not finished the merge function.
      $.each(tmp, function(a, b) {
        if (b && b.length) {
          $.each(b, function(i, j) {
            var tmptimeline = root.CreateTimelineByType(j);
            root.items[a].addList(tmptimeline);
            tmptimeline.check();
          });
        }
      });
    } else {
      alert('Sorry. LocalStorage is required.');
    }
  }
});
