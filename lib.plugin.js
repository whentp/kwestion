// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab
"use strict";(function(window) {
  var k_plugin_pool = {
    beforesend_pool : [],
    filter_pool : [],
    pageload_pool : []
  };

  window.InitPlugins = function() {
    $.each(k_plugins, function(a, b) {
      if(b.beforesend) {
        k_plugin_pool.beforesend_pool.push(b.beforesend);
      }
      if(b.filter) {
        k_plugin_pool.filter_pool.push(b.filter);
      }
      if(b.pageload) {
        k_plugin_pool.pageload_pool.push(b.pageload);
      }
    });
  };

  window.CallPlugin = function() {
    var plugintype = arguments[0] + '_pool';
    //console.log(k_plugin_pool, plugintype);
    var args = [];
    for(var i = 1; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    if(k_plugin_pool[plugintype]) {
      var result = true;
      for(var i = k_plugin_pool[plugintype].length - 1; i >= 0; i--) {
        result = k_plugin_pool[plugintype][i].apply(null, args);
        if(!result) {
          return false;
        }
      }
      return result;
    } else {
      alert('plugin not found.');
    }
  };

  window.loadsetting = function(obj) {
    var offset = $(obj).offset();
    var sb = [];
    $.each(k_plugins, function(a, b) {
      if(b.ui && b.name) {
        sb.push('<fieldset><legend>', b.name, '</legend>', b.ui(), '</fieldset>');
      }
    });
    simpledialog(sb.join(''), function() {
      $.each(k_plugins, function(a, b) {
        if(b.init)
          b.init();
      });
    }, {
      'top' : offset.top + 14,
      'left' : offset.left - 250
    }, 310);
  };
})(window);
