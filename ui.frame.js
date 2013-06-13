// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab
"use strict";

function KframeResizeInit() {
  $(window).resize(function() {
    KframeResize();
  });
  setInterval(function() {
    var tmptimeline = frame.findTimeline('home');
    if (tmptimeline) {
      tmptimeline.check();
    }
  }, 60000 * 2);
  setInterval(function() {
    var tmptimeline = frame.findTimeline('reply');
    if (tmptimeline) {
      tmptimeline.check();
    }
  }, 180000);
  setInterval(function() {
    var tmptimeline = frame.findTimeline('dm');
    if (tmptimeline) {
      tmptimeline.check();
    }
  }, 240000);
  setInterval(function() {
    $.each(frame.items, function(a, b) {
      $.each(b.items, function(c, d) {
        if (d.type != 'home' && d.type != 'reply' && d.type != 'dm' && d.user != myname) {
          d.check();
        }
      });
    });
  }, 300000);
  setInterval(function() {
    formattimespans();
    $.each(frame.items, function(a, b) {
      $.each(b.items, function(c, d) {
        d.working = false;
      });
    });
  }, 120000);
}

function KframeResize() {
  var windowwidth = $(window).width(), windowheight = $(window).height();
  var tmpcount = Math.floor(windowwidth / 320);
  tmpcount = tmpcount > 0 ? tmpcount : 1;
  $("#columncount").attr('max', tmpcount);
  $('div.panel').height(windowheight - 56).width(windowwidth / frame.items.length);
  $('div.k-list').height(windowheight - 56 - 60);
  if ((windowwidth / frame.items.length < 320) && frame.items.length > 1) {
    frame.setColumnCount(frame.items.length - 1);
  }
  //console.log(windowheight - 200);
}

if (navigator && navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(p) {
    tmplat = p.coords.latitude;
    tmplong = p.coords.longitude;
  }, function(error) {
    tmplat = tmplong = null;
  });
}
