// vim:ft=javascript:tabstop=2:shiftwidth=2:softtabstop=2:expandtab

var k_config = {
  version : '5 beta55',
  twitter_consumer_key : 'cEik18NpLALwbgTLz0pefQ',
  twitter_consumer_secret : '5p47cbmygL0xaBOzTexTainxBZPfprte0wa6ERjEays',
  twitter_api_prefix : 'https://api.twitter.com/1/', // all url prefix should end with a slash.
  twitter_search_api_prefix : 'http://search.twitter.com/',
  twitter_oauth_api_prefix : 'https://twitter.com/oauth/',

  sina_consumer_key : '4285963842',
  sina_consumer_secret : '0a5936ad4019b638b5733b5321ea2844',
  sina_api_prefix : 'http://api.t.sina.com.cn/'
};

function GenerateAddPrefix(xstr) {
  return function(tmp) {
    return xstr + tmp;
  };
}