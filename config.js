// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab

var k_config = {
  version : '5.1.7',
  twitter_consumer_key : 'cEik18NpLALwbgTLz0pefQ',
  twitter_consumer_secret : '5p47cbmygL0xaBOzTexTainxBZPfprte0wa6ERjEays',
  twitter_api_prefix : 'https://api.twitter.com/1/', // all url prefix should end with a slash.
  twitter_search_api_prefix : 'http://search.twitter.com/',
  twitter_oauth_api_prefix : 'https://api.twitter.com/oauth/',
  twitter_oauth_api_proxy_prefix : 'https://api.twitter.com/oauth/',
};

function GenerateAddPrefix(xstr) {
  return function(tmp) {
    return xstr + tmp;
  };
}
