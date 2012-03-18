// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab
/*
MIT License (MIT)
Copyright (c) 2011 Andy Edinborough

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*global window */
/*jshint curly: false */
(function(window, undefined) {'use strict';
  var OAuth, document = window.document, location = window.location, $ = window.jQuery;
  if(!$.Deferred)
    throw 'jQuery 1.5 is required to use the jQuery.oauth script!';
  function require(name, url) {
    if(window[name] === undefined)
      return $.ajax({
        type : 'GET',
        cache : true,
        dataType : 'script',
        url : url
      });
  }

  function addOAuthStuffs(options) {
    options = $.extend({
      type : 'GET',
      consumerKey : '',
      consumerSecret : '',
      tokenSecret : '',
      url : ''
    }, options);
    options.cache = true;
    //we can't have jQuery adding it's _=123 param to the url.
    if(!options.data) {
      options.data = '';
    }
    if( typeof options.data !== 'string') {
      options.data = $.param(options.data);
    }
    if(options.dataType === 'jsonp') {
      options.callbackName = $.ajaxSettings.jsonpCallback();
      options.jsonpCallback = function() {
        return options.callbackName;
      };
    }
    if(options.url.indexOf(':') == -1) {
      if(options.url.substr(0, 1) == '/') {
        options.url = location.protocol + '//' + location.host + options.url;
      } else {
        options.url = location.href.substr(0, location.href.lastIndexOf('/') + 1) + options.url;
      }
    }

    var action = options.url + (options.data && options.data.length > 0 ? '?' + options.data : '') + (options.callbackName ? ((options.url.indexOf('?') || options.data > -1 ? '&' : '?') + 'callback=' + options.callbackName) : ''), message = {
      action : action,
      method : options.type,
      parameters : [['oauth_version', '1.0'], ['oauth_consumer_key', options.consumerKey]]
    };

    /**
    * Added by @whentp.
    * **/
    message.parameters.push(['oauth_callback', (options.oauth_callback ? options.oauth_callback : 'oob')])
    if(options.oauth_token)
      message.parameters.push(['oauth_token', options.oauth_token]);
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, {
      consumerSecret : options.consumerSecret,
      tokenSecret : options.tokenSecret
    });
    var parameterMap = OAuth.getParameterMap(message), baseStr = OAuth.decodeForm(OAuth.SignatureMethod.getBaseString(message));
    options.data = baseStr[2][0];
    if(options.callbackName) {
      //jQuery will add the callback parameter
      options.data = options.data.replace(/(?!\?|&)callback\=[^&]+&?/, '');
    }
    if(parameterMap.parameters)
      $.each(parameterMap.parameters, function(item, values) {
        return $.each(values, function(subitem, value) {
          if(value == 'oauth_signature') {
            options.data += '&oauth_signature=' + encodeURIComponent(values[1]);
            return false;
          }
        });
      });
      if(options.url.indexOf('?') > -1) {
        //This data was already included in the message object
        options.url = options.url.substr(0, options.url.indexOf('?'));
      }
      return options;
  }

  $.oauth = function(options) {
    var d = $.Deferred();
    OAuth = window.OAuth;

    var original_url = options.url, proxy_url = options.url;
    if(options.url && options.url.proxy){
      original_url = options.url.url;
      proxy_url = options.url.proxy;
    }
    options.url = original_url;
    var newoptions = addOAuthStuffs(options);

    newoptions.url = proxy_url;
    $.ajax(newoptions).done(d.resolve);

    return $.extend({
      success : function() {
        return this.then.apply(this, arguments);
      },
      complete : function() {
        return this.done.apply(this, arguments);
      },
      error : function() {
        return this.fail.apply(this, arguments);
      }
    }, d.promise());
  };
})(window);
