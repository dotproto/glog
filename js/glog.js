// Dependencies:
// * lodash >= 2.4.X

var Gloggy = function(){};

Gloggy.prototype.name = "Gloggy";
Gloggy.prototype.version = "0.0.1a";

// TODO:
// * fetchGists() - Fetch a list of gists so we can try to find glog posts
//    * Request a specific page
//    * Create a list of ALL gists for a given user
// * ???() - Parse the gist list and turn it into a glog list
// * ???() - Some kind of cahce utility to store gist lists, gist data, and glog metadata.
//    * Use local storage to persist this data across sessoins, avoid unecessary calls
//    * May need to store metadata about the request (e.g. when it was fetched from GitHub)
//    * Consider tagging glog posts somehow so they can be expressly queried.

// Optimizations
// * Identify client in all GitHub API requests using the User-Agent header.
// * Use conditional requests to avoid hitting the API call cap
//   (http://developer.github.com/v3/#conditional-requests)

Gloggy.prototype.setHeader = function(xhr, header, value) {
  try {
    xhr.setRequestHeader(header, value);
  } catch(e) {}
  return xhr;
}

Gloggy.prototype.setHeaders= function(xhr, headers) {
  for(header in headers) {
    Gloggy.prototype.setHeader(xhr, header, headers[header])
  }
}

Gloggy.prototype.getConfig = {
  headers: {
    "Accept": "application/vnd.github.v3+json"
  }
}

Gloggy.prototype.fetchGistListConfig = {
  page: 1,
  count: 100
}

// Simple "get" promise courtesy of Jake Archibald (@jaffathecake)
// http://www.html5rocks.com/en/tutorials/es6/promises/
Gloggy.prototype.get = function get(url, config) {
  config = _.defaults({}, config, this.getConfig);

  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();

    req.open('GET', url);

    Gloggy.prototype.setHeaders(req, config.headers);

    req.onload = function() {
      // This is called even on 404, so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req);
      } else {
        // Otherwise reject with the status text which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    // req.send();
  });
}

/**
 * Retrieve a list of gists for a given user (and page offset) via the GitHub API.
 *
 * Requires LoDash's _.defaults to process the config object.
 *
 * @param  {object} config           Page offset
 * @param  {string} config.user      Username of person to look up
 * @param  {number=1} config.page    Page offset for the request
 * @param  {number=100} config.count Number of results to request from GitHub. Maps to the ?per_page
 *                                   parameter. 0 will exclude this parameter from the request.
 * @return {!Object}                 TBD
 */
Gloggy.prototype.fetchGistList = function fetchGistList(config){
  // If the caller passed in a string assume the request was for a specific user
  if (typeof config === "string") {
    config = {"user": config};
  }

  // Prepare base config and url objects
  var conf = _.defaults({}, config, this.fetchGistListConfig);
  var url = "https://api.github.com/users/" + conf.user + "/gists";

  // Sanitize page offset
  conf.page = parseInt(conf.page);
  conf.page = isNaN(conf.page) ? this.fetchGistListConfig.page : conf.page ;
  // Sanitize results per page
  conf.count = parseInt(conf.count);
  conf.count = isNaN(conf.count) ? this.fetchGistListConfig.count : conf.count;

  // Begin processing potential URL parameters
  var params = Object.create(null);

  // Only set the 'per_page' param if the value is a non-zero integer
  if (conf.count !== 0) {
    params["per_page"] = conf.count;
  }
  // Only set the 'page' param if it is an integer other than 1 (the default value)
  if (conf.page !== 1) {
    params["page"] = conf.page;
  }

  // Begin appending special parameters to the URL
  var keys = Object.keys(params);
  if (keys.length > 0) {
    url += "?"
  }
  for (var i = keys.length - 1; i > -1; i--) {
    var key = keys[i];
    var separator = (i ? "&" : "");
    url += key + "=" + params[key] + separator;
  }
  // end URL params

  console.log("Issuing GET request for '" + url + "'");
  return this.get(url);
}

/**
 * Retrieve all gists for a given user via the GitHub API.
 * @param  {string} user Username of the person to look up
 * @return {!Object} TBD
 */
Gloggy.prototype.fetchFullGistList = function(user) {}

var g = new Gloggy();
g.fetchGistList("svincent")
