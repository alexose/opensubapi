var http = require("http")
  , url = require("url")
  , fs = require("fs")
  , SubAPI = require("./lib/api")
  , cache = require("memory-store");

var port = process.argv && process.argv.length > 2 ? process.argv[2] : 3000;

http.createServer(function(request, response) {

  var arr = request.url.split('?');

  if (arr[1]){
    var queries = querystring.parse(arr[1]);

    new SubAPI(queries, finish);
  } else {
    explain();
  }

  function error(string){
    respond(string, "text", 500);
  }

  function finish(results){

    var string = JSON.stringify(results)
      , type = "text/plain";

    if (queries.callback){
      type = "application/x-javascript"
      string = queries.callback + '(' + string + ')';
    }

    respond(string, type);
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


