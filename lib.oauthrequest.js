// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab
// By @whentp.

var Koauth = Class.extend({
  init : function(options) {
    this.consumerKey = options.consumerKey;
    this.consumerSecret = options.consumerSecret;
    this.requestParams = options.requestParams;
    this.accessParams = options.accessParams;
  },
  ajax : function(options) {
    var x = $.extend(options, {
      consumerKey : this.consumerKey,
      consumerSecret : this.consumerSecret,
      oauth_token : this.accessParams.oauth_token,
      tokenSecret : this.accessParams.oauth_token_secret
    });
    return $.oauth(x);
  },
  toString : function() {
    return JSON.stringify([this.consumerKey, this.consumerSecret, this.requestParams, this.accessParams]);
  },
  loadFromString : function(xstring) {
    var tmp = JSON.parse(xstring);
    if (true) { // lol... what's this!!! by whentp.
      this.consumerKey = tmp[0];
      this.consumerSecret = tmp[1];
      this.requestParams = tmp[2];
      this.accessParams = tmp[3];
      return true;
    } else {
      return false;
    }
  },
  accessByPin : function(url, pin, done, error) {
    var root = this;
    $.oauth({
      'url' : url + '?oauth_verifier=' + pin + '&' + this.requestParams,
      consumerKey : this.consumerKey,
      consumerSecret : this.consumerSecret
    }).done(function(data) {
      //console.dir(data);
      root.accessParams = {};
      var qvars_tmp = data.split('&');
      for (var i = 0; i < qvars_tmp.length; i++) {
        var y = qvars_tmp[i].split('=');
        root.accessParams[y[0]] = decodeURIComponent(y[1]);
      }
      done(root.accessParams);
    }).fail(error);
  },
  requestPin : function(requesturl, callback) {
    var root = this;
    $.oauth({
      consumerKey : this.consumerKey,
      consumerSecret : this.consumerSecret,
      url : requesturl
    }).done(function(data) {
      //console.log(data);
      root.requestParams = data;
      callback(data);
    });
  }
});
