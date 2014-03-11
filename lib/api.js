var http  = require("http")
  , https = require("https")
  , parse = require("url").parse
  , urls  = require("../config/config");

module.exports = API = function(endpoint, queries, callback){

  this.callback = callback;
  this.queries = queries;

  endpoint = endpoint.split('.').shift();

  try {
    if (this[endpoint]){
      this[endpoint]()
    } else {
      this.category(endpoint)
    }

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

API.prototype.category = function(category){

  var url = urls.genre.replace('{{query}}', category);

  this.request(url, this.getDetails.bind(this));

}

API.prototype.getDetails = function(json){

  var results = this.results = JSON.parse(json).results
    , request = this.request
    , check   = this.checkResults.bind(this);

  // Get details one at a time.  Slow.
  function details(pos){

    if (pos == results.length){
      check(results);
    } else {

      var result = results[pos]
        , id     = result.id
        , url    = urls.detail.replace('{{query}}', id);

      request(url, function(json){

        var data = JSON.parse(json);

        // Map results
        result.moviedb_id   = id;
        result.imdb_id      = data.imdb_id;
        result.title        = result.original_title;
        result.overview     = data.synopsis;
        result.runtime      = data.runtime;
        result.genre        = data.genre;
        result.year         = data.year;
        result.release_date = data.release_data;
        result.poster       = 'http://image.tmdb.org/t/p/w342/' + data.poster_path;
        result.backdrop     = 'http://image.tmdb.org/t/p/original/' + data.backdrop_path;

        result.deets = data;
        // Now that we have the IMDB id, we can grab the subs and the torrents.
        this.getSubs(results[pos], check)
        this.getTorrents(results[pos], check)

        details.call(this, pos + 1)
      }.bind(this));
    }
  }
  details.call(this, 0);

  var result = {};
};

// Not implemented yet
API.prototype.getSubs = function(movie, cb){

  movie.subtitles = {};

  cb();

  return;
};

API.prototype.getTorrents = function(movie, cb){

  var url = urls.torrents.replace('{{query}}', movie.imdb_id);

  this.request(url, function(json){
    var data = JSON.parse(json).MovieList;

    movie.seeds = 0;
    movie.leechers = 0;

    if (data){

      movie.torrents = data.map(function(d){
        movie.seeds += parseInt(d.TorrentSeeds, 10);
        movie.leechers += parseInt(d.TorrentPeers, 10);

        // Map results
        return {
          quality:  d.Quality,
          url:      d.TorrentUrl,
          seeders:  d.TorrentSeeds,
          leechers: d.TorrentPeers,
          size:     d.SizeByte
        };
      });
    } else {
      movie.torrents = [];
    }

    cb();
  })

  return;
};

// Check to see if we're done yet.
// TODO: Promises would be much better here.
API.prototype.checkResults = function(){

  var fields = ['torrents', 'subtitles'];

  for (var i in this.results){
    var result = this.results[i];

    if (!hasFields(result, fields)){
     return false;
    }
  }

  // return true;
  this.finish();

  function hasFields(obj, arr){

    for (var i in arr){
      if (!obj[arr[i]]){
        return false;
      }
    }

    return true;
  }

}

API.prototype.finish = function(){

  var json = JSON.stringify({movies : this.results});

  this.callback(json);
}

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
