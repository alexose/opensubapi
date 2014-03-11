var http = require("http")
  , https = require("https")
  , url = require("url")
  , urls = require("../config/config");

module.exports = API = function(queries, callback){

  this.callback = callback;

  if (queries.search){
    this.search(queries.search);
  } else {
    return {};
  }
}

API.prototype.search = function(query){

  var url = urls.search.replace('{{query}}', query);

  this.request(url, function(result){
    console.log(result);
  });

};

API.prototype.getIMDB = function(query){

  var result = {};

  return result;
};

API.prototype.getSubs = function(query){

  var result = {};

  return result;
};

API.prototype.getTorrents = function(query){

  var result = {};

  return result;
};


API.prototype.request = function(url, cb){

  var a = url.parse(entry.url);

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
