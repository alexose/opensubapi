var http = require("http")
  , url = require("url")
  , cache = require("memory-store");

var port = process.argv && process.argv.length > 2 ? process.argv[2] : 3000;

http.createServer(function(request, response) {

  var queries = querystring.parse(request.url.split('?')[1]);

  function error(string){
    respond(response, string, "text", 500);
  }

  function finish(results){

    var string = JSON.stringify(results)
      , type = "text/plain";

    if (queries.callback){
      type = "application/x-javascript"
      string = queries.callback + '(' + string + ')';
    }

    respond(response, string, type);
  }
}).listen(port, function(){
  console.log('Server running on port ' + port);
});

function explain(request, response){

  // Load HTML template
  try{
    fs.readFile('README.md', 'utf8', function(err, html){
      respond(response, html);
    });
  } catch(e){
    respond(response, 'Could not find Sieve library.  Did you run npm install?');
  }
}

function respond(response, string, type, code){

  type = type || "text/html";
  code = code || 200;

  response.writeHead(code, {
    "Content-Type": type
  });
  response.write(string);
  response.end();
}
