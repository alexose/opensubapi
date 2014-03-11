var http = require("http")
  , url = require("url")
  , fs = require("fs")
  , qs = require("querystring")
  , SubAPI = require("./lib/api")
  , cache = require("memory-store");

var port = process.argv && process.argv.length > 2 ? process.argv[2] : 3000;

http.createServer(function(request, response) {

  var arr = request.url.split('?');

  var endpoint = arr[0].split('/').pop()
    , queries = qs.parse(arr[1]);

  new SubAPI(endpoint, queries, finish);

  function error(string){
    respond(string, "text", 500);
  }

  function finish(results){

    var type = "text/json";

    respond(results, type);
  }

  function explain(){

    // Load HTML template
    try{
      fs.readFile('./README.md', 'utf8', function(err, md){
        respond(md);
      });
    } catch(e){
      respond(e.toString(), 500);
    }
  }

  function respond(string, type, code){

    type = type || "text/plain";
    code = code || 200;

    response.writeHead(code, {
      "Content-Type": type
    });
    response.write(string);
    response.end();
  }

}).listen(port, function(){
  console.log('Server running on port ' + port);
});


