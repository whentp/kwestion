// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab
"use strict";

var proxysettingui;
function initproxysetting(selector) {
  var settings = getConfig('twitterproxysetting');
  if(!settings) {
    settings = {
      api : '',
      search : '',
      oauth : '',
      use : false
    };
  }
  if(!proxysettingui)
    proxysettingui = $($('#proxysetting').tmpl({}));
  $(selector).append(proxysettingui);
  $('#apiproxy').val(settings.api);
  $('#searchapiproxy').val(settings.search);
  $('#oauthproxy').val(settings.oauth);
  $('#useproxy').prop("checked", settings.use);
  $('#saveproxysetting').click(function() {
    alert('OK');
    setConfig('twitterproxysetting', {
      api : $('#apiproxy').val(),
      search : $('#searchapiproxy').val(),
      oauth : $('#oauthproxy').val(),
      use : $('#useproxy').prop("checked")
    });
    var tmp = getConfig('twitterproxysetting');
    if(tmp && tmp.use) {
      k_config.twitter_api_prefix = tmp.api;
      k_config.twitter_search_api_prefix = tmp.search;
      //k_config.twitter_oauth_api_prefix = 
      k_config.twitter_oauth_api_proxy_prefix = tmp.oauth;//'https://api.twitter.com/oauth/';
    } else {
      k_config.twitter_api_prefix = 'https://api.twitter.com/1/';
      k_config.twitter_search_api_prefix = 'http://search.twitter.com/';
      //k_config.twitter_oauth_api_prefix = 'https://api.twitter.com/oauth/';
      k_config.twitter_oauth_api_proxy_prefix = 'https://api.twitter.com/oauth/';
    }
  });
}(function() {
  $(function() {
    k_plugins.proxysetting = {
      name : 'proxy setting',
      ui : function() {
        return 'Click <a href="#" onclick="initproxysetting($(this).next()); return false;">here</a> to set a twitter api proxy.<div></div>';
      },
      init : function() {
      }
    };
    var tmp = getConfig('twitterproxysetting');
    if(tmp && tmp.use) {
      k_config.twitter_api_prefix = tmp.api;
      k_config.twitter_search_api_prefix = tmp.search;
      k_config.twitter_oauth_api_proxy_prefix = tmp.oauth;
      //tapistr = GenerateAddPrefix(k_config.twitter_api_prefix);
    }
  });
})();
