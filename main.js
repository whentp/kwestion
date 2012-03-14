// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab

var frame;
var kreq;
var tltype = {
  'default' : TTimeline,
  home : TTimeline,
  reply : TTimeline,
  dm : TTimeline,
  user : UserTTimeline,
  hash : HashTTimeline,
  follower : UserlistTTimeline,
  following : UserlistTTimeline,
};

var onAddList = function() {
  frame.save();
};
var tapistr = GenerateAddPrefix(k_config.twitter_api_prefix);

function checklogin() {
  Kinit();
  InitPlugins();
  CallPlugin('pageload');

  var oauthstr = getConfig('oauthstr');
  if(oauthstr) {
    kreq = new Koauth({});
    kreq.loadFromString(oauthstr);
    init();
  } else {
    kreq = new Koauth({
      consumerKey : k_config.twitter_consumer_key,
      consumerSecret : k_config.twitter_consumer_secret
    });

    simpledialog($("#pinlogin").tmpl({
      name : 'twitter'
    }), function() {
      $(".pinlogin").height($(window).height());
      $('a.gettwitterpin').click(function() {
        kreq.requestPin(k_config.twitter_oauth_api_prefix + 'request_token', function(data) {
          window.open(k_config.twitter_oauth_api_prefix + 'authorize?' + data);
        });
      });
      $('#sendping').click(function() {
        var tmppin = $('#pinvalue').val();
        if(tmppin) {
          kreq.accessByPin(k_config.twitter_oauth_api_prefix + 'access_token', tmppin, function(data) {
            setConfig('oauthstr', kreq.toString());
            $('#dialogbackground').click();
            init();
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
}

function init() {
  KinitToolbar();
  KUIMsgSendBind();
  loaduserinfo();
  bindmouseover();

  KframeResizeInit();
  frame = new KFramework('#framework');
  frame.timelineType = tltype;

  frame.load();
  KframeResize();
}

$(checklogin);
