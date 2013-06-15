// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab
"use strict";

$.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
    // whentp. add the onreadystatechange to jquery.ajax.
    if ( options.onreadystatechange ) {
      var xhrFactory = options.xhr;
      options.xhr = function() {
        var xhr = xhrFactory.apply( this, arguments );
        function handler() {
          options.onreadystatechange( xhr, jqXHR );
        }
        if ( xhr.addEventListener ) {
          xhr.addEventListener( "readystatechange", handler, false );
        } else {
          setTimeout( function() {
              var internal = xhr.onreadystatechange;
              if ( internal ) {
                xhr.onreadystatechange = function() {
                  handler();
                  internal.apply( this, arguments ); 
                };
              }
            }, 0 );
        }
        return xhr;
      };
    }
  });

function kwestion_log(){
  var canlog = false;
  if (!canlog) return;
  var args = [];
  for(var i = 0; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  // console.log.apply is problematic... weird.
  if(console && console.log) return console.log.apply(console, args);
}

function streamCallback(data){
  if(data.direct_message){
    data = data.direct_message;
    data.type = 'dm';
  } else {
    data.type = 'home';
  }
  if(!data.text) return;
  data.isnew = true;
  fix32(data);

  if(data.text)
    data.processedtext = data.text;
  if(data.source)
    data.source = shortsource(data.source);

  if(!CallPlugin('filter', data, data.type)) return;

  var hometimeline = frame.findTimeline('home');
  var replytimeline = frame.findTimeline('reply');
  if(data.type != 'dm'){
    // apply plugins.
    hometimeline.unreadcount++;
    hometimeline.add(data);
    document.title = '*** kwestion ***';
    var tmp = data.id;
    hometimeline.newesttimestamp = gt(tmp, hometimeline.newesttimestamp) ? tmp : hometimeline.newesttimestamp;

    if(data.text && myname && myname.length && data.text.indexOf(myname) >= 0) {
      titlesay('[Somebody mention you.]');
      replytimeline.add(data);
      replytimeline.newesttimestamp = gt(tmp, replytimeline.newesttimestamp) ? tmp : replytimeline.newesttimestamp;
    }
    if(data.user) {
      nq.add(data.user.profile_image_url, data.user.screen_name, data.text);
    }
    if(hometimeline.unreadcount) {
      hometimeline.showExtra();
    }
    if(replytimeline.unreadcount) {
      replytimeline.showExtra();
    }
  } else {
    var dmtimeline = frame.findTimeline('dm');
    dmtimeline.add(data);
    var tmp = data.id;
    dmtimeline.newesttimestamp = gt(tmp, dmtimeline.newesttimestamp) ? tmp : dmtimeline.newesttimestamp;
    titlesay('[You have direct messages.]');

    if(window.webkitNotifications && window.webkitNotifications.checkPermission() == 0) {
      var popup = window.webkitNotifications.createNotification(myinfo.profile_image_url, 'Alert: You have new Direct Messages.', 'Check your Direct Messages.');
      popup.show();
    }
  }
}

(function(window){
    var monitor = {};
    var remaining = '';
    var empty_tester = new RegExp('^[\n\r\t ]*$', 'g');
    window.streamingreceiver = kreq.ajax({
        url:        "https://userstream.twitter.com/1.1/user.json",
        type:       "GET",
        dataType:   "text",
        data:        {
          'with': 'followings'
        },
        onreadystatechange: function(xhr, jqxhr) {
          var callback = streamCallback;
          kwestion_log('fired');
          // referred shellex&shellexy's implementation.
          if (xhr.readyState === 2 && xhr.status === 200) {
            kwestion_log('Streams Start', 'Connected');
          } else if (xhr.readyState === 3) {
            // Receiving
            var newText = xhr.responseText.substr(monitor.last_text_length);
            monitor.last_text_length = xhr.responseText.length;
            if (xhr.responseText.length > 500000) {
              kwestion_log('Streams Rec', xhr.responseText.length);
              setTimeout(function() {
                  xhr.abort();
                },
                100);
            }
            if (empty_tester.test(newText)) {
              kwestion_log('Streams XHR', 'Got nothing useful');
              return;
            }
            if (callback) {
              newText = remaining + newText;
              remaining = ''
              var lines = newText.split(/[\n\r]/g);
              for (var i = 0; i < lines.length; i += 1) {
                var line = lines[i].split(/({[^\0]+})/gm);
                for (var j = 0; j < line.length; j += 1) {
                  if (!empty_tester.test(line[j])) {
                    try {
                      ret = JSON.parse(line[j]);
                    } catch(e) {
                      remaining = newText;
                    }
                    try {
                      callback(ret);
                    } catch(e) {
                      kwestion_log('Streams callback: ' + e.message + '\n' + line);
                      return;
                    }
                  }
                }
              }
            }
          } else if (xhr.readyState === 4) {
            kwestion_log('Streams End', 'Connection completed');
          }
        },
        error: function(xhr, textStatus, error){
          kwestion_log('error');
          kwestion_log(xhr.statusText, textStatus, error);
        }
      });
  })(window);


