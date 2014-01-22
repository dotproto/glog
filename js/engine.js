var user = "svincent";

// dead simple "get" function courtesy of Jake Archibald (@jaffathecake)
// http://www.html5rocks.com/en/tutorials/es6/promises/
function get(url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req);
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  });
}

function basicError(err) {
  console.error(err);
}


// https://api.github.com/gists/7899369
function getGists() {
  var url = "https://api.github.com/users/" + user + "/gists";
  return get(url);
}

function getGistsTest() {
  var url = "dummy/getify.json";
  return get(url);
}

function gistPages(link) {
  if (!link.trim()) return;

  var nav = Object.create(null);
  var tagExp = /, /;
  // group 1 is the URL, group 2 describes what it is used for
  var relExp = /<([^>]*)>; rel="([^"]*)"/;
  var items = link.split(tagExp);
  items.forEach(function(value) {
    var match = value.match(relExp);
    Object.defineProperty(nav, match[2], {
      value: match[1],
      enumerable: true,
      configurable: false,
      writable: false
    });
  });

  return nav;
}

/**
 * Convert a XMLHttpRequest getAllResponseHeaders() string into a haeder field object. Here, field
 * names map to keys and field values map to values.
 */
function getHeaders(headerString) {
  var headers = Object.create(null);
  var regexp = /:\s?(.*)/;

  headerString.split(/\r\n/).forEach(function(value){
    if (!value.trim()) return; // Abort, this value is meaningless!
    var chop = value.split(regexp);

    Object.defineProperty(headers, chop[0], {
      value: chop[1],
      enumerable: true,
      configurable: false,
      writable: false
    } );
  })

  return headers;
}

var resp = getGistsTest();
resp.then(function(req) {
  var headers = getHeaders(req.getAllResponseHeaders());
  console.log(headers);
  console.log(gistPages("<https://api.github.com/user/150330/gists?page=2>; rel=\"next\", <https://api.github.com/user/150330/gists?page=5>; rel=\"last\""))
}, basicError);

