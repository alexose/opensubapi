var http  = require("http")
  , https = require("https")
  , parse = require("url").parse
  , urls  = require("../config/config");

module.exports = API = function(endpoint, queries, callback){

  this.callback = callback;
  this.queries = queries;

  endpoint = endpoint.split('.').shift();

  try {
    this[endpoint]()
  } catch(e){
    this.callback('Malformed query: ' + e.toString());
  }

  if (queries.search){
    this.search(queries.search);
  } else {
    return {};
  }
}

API.prototype.search = function(){

  var url = urls.search.replace('{{query}}', this.queries.query);

  this.request(url, this.getDetails.bind(this));

};

API.prototype.getDetails = function(json){

  var results  = JSON.parse(json).results
    , request  = this.request
    , callback = this.getSubs.bind(this);

  // Get details one at a time.  Slow.
  function details(pos){

    if (pos == results.length){
      callback(results);
    } else {

      var id = results[pos].id
        , url = urls.detail.replace('{{id}}', id);

      request(url, function(data){

        results[pos].details = JSON.parse(data);

        details(pos + 1)
      });
    }
  }
  details(0);

  var result = {};
};

API.prototype.getSubs = function(movies){

  this.callback(JSON.stringify(movies));

  var result = {};

  return result;
};

API.prototype.getTorrents = function(query){

  var result = {};


  return result;
};


API.prototype.request = function(url, cb){

  var a = parse(url);

  var options = {
    host : a.hostname,
    port : a.port,
    path : a.path
  };

  var method = a.protocol == "https:" ? https : http;

  try {
    var request = method.request(options, function(response){
      var result = '';
      response.on('data', function(d){
        result += d;
      });

      response.on('end', function(){

        // Write to cache
        // var time = entry.cache || this.defaults.cache;
        // cache.put(cacheKey, result, time * 1000);

        cb(result);

      }.bind(this));

    }.bind(this)).on("error", function(e){
      throw e;
    }.bind(this));

  request.end();

  } catch(e){
    this.callback(e.toString());
  }
}


API.prototype.format = function(query){

}
