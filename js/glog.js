// Dependencies:
// * lodash >= 2.4.X

// TODO: Clarify terminology in this file.
// * gist - Only use to refer to an individual Gist (i.e. http request for a specific gist). For clarity this term
//          shouldn't be used as a variable name. See one of the below terms for something more descriptive.
// * gistData - Data returned in a JSONP request for information about a specific gist.
// * gistMeta - Refers to a gist's metadata as returned by a gists api request.
// * gistMetaList - The gists api returns a list of gistMeta data regarding gists.

var Gloggy = function(config){
  this.config = _.defaults({}, config, this.defaults);
};


Gloggy.prototype.name = "Gloggy";
Gloggy.prototype.version = "0.0.1a";
Gloggy.prototype.gistMetaList = [];
Gloggy.prototype.gistMetaListFull = [];
Gloggy.prototype.postMetaList = [];
Gloggy.prototype.el = {
  postIndex: null
}

Gloggy.prototype.defaults = {
  user: 'svincent',
  post: {
    prefix: 'POST: ',
    substring: '',
    postfix: ''
  },
  index: {
    perPage: 10
  }
}

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

/**
 * Simple "get" promise courtesy of Jake Archibald (@jaffathecake)
 * http://www.html5rocks.com/en/tutorials/es6/promises/
 */
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
    req.send();
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
Gloggy.prototype.fetchGistList = function fetchGistList(callConfig){
  // Prepare base config and url objects
  var getConfig = _.defaults({}, callConfig, this.fetchGistListConfig);
  var url = "https://api.github.com/users/" + this.config.user + "/gists";

  // Sanitize page offset
  getConfig.page = parseInt(getConfig.page);
  getConfig.page = isNaN(getConfig.page) ? this.fetchGistListConfig.page : getConfig.page ;
  // Sanitize results per page
  getConfig.count = parseInt(getConfig.count);
  getConfig.count = isNaN(getConfig.count) ? this.fetchGistListConfig.count : getConfig.count;

  // Begin processing potential URL parameters
  var params = Object.create(null);

  // Only set the 'per_page' param if the value is a non-zero integer
  if (getConfig.count !== 0) {
    params["per_page"] = getConfig.count;
  }
  // Only set the 'page' param if it is an integer other than 1 (the default value)
  if (getConfig.page !== 1) {
    params["page"] = getConfig.page;
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
Gloggy.prototype.fetchFullGistList = function(user) {
}

/**
 * Convert a XMLHttpRequest getAllResponseHeaders() string into a header field object. Here, field
 * names map to keys and field values map to values.
 */
Gloggy.prototype.getHeaders = function(headers) {
  // Support strings or XHR objects
  headers = typeof headers === "string" ? headers : headers.getAllResponseHeaders();
  var headers = Object.create(null);
  var regexp = /:\s?(.*)/;

  headers.split(/\r\n/).forEach(function(value){
    if (!value || !value.trim()) return; // Abort, this value is meaningless!
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

Gloggy.prototype.getResponse = function(xhr) {
  return xhr.response;
}

Gloggy.prototype.parseJson = function(msg) {
  return JSON.parse(msg);
}

// Filter a list of gists to a list of Gloggy posts
Gloggy.prototype.filterPosts = function(gistList) {
  this.gistMetaListFull = gistList;

  var prefix = this.config.post.prefix;
  var postfix = this.config.post.postfix;

  var posts = _.filter(gistList, function(gist) {
    var isPost = true;
    var desc = gist.description;

    // Only proceed if the Gist has a description
    if (!(typeof desc === "string" && desc.trim() !== "")) {
      isPost = false;
    }

    // Check whether the prefix string is used
    if (isPost && prefix != "") {
      if(desc.substring(0, prefix.length) !== prefix) {
        isPost = false;
      }
    }

    // Check whether the postfix string is used
    if (isPost && postfix != "") {
      if (desc.substring(desc.length - postfix.length) !== postfix) {
        isPost = false;
      }
    }

    return isPost;
  });

  return posts;
}

// TODO: Retrieve the "link" header from the GitHub response XHR object
Gloggy.prototype.parseLinkHeader = function(header) {}

// Data structure for the Gloggy post data type + helper functions
Gloggy.prototype.postTypeInternal = function(config) {
  return {
    // Full title less the prefix/postix used to mark it as a Gloggy post
    title: function(title)  {
      var prefix = config.post.prefix
        , postfix = config.post.postfix;

      return this.title = title.substring(prefix.length, title.length - postfix.length);
    }

    // Number of comments on this post
    ,comments: function(num) {
      return this.comments = num;
    }

    // URL for the full comments on the post
    ,commentUrl: function(url) {
      return this.commentUrl = url;
    }

    // Date the post was created
    ,created: function(date) {
      return this.created = new Date(date);
    }

    // Date of the most recent edit
    ,edited: function(date)  {
      return this.edited  = new Date(date);
    }

    // Slug converts a filename into a slug that can be used for the current page
    ,slug: function(filename) {
      return this.slug = filename.substring(0, filename.lastIndexOf("."));
    }

    // Post's body text
    ,dataUrl: function(text) {
      return this.dataUrl = text;
    }
  }
}

// Returns a new instance of a bootstrapped post object. To use simply call the appropriately named
// method with your starter values.
Gloggy.prototype.postType = function(){
  return new this.postTypeInternal(this.config);
}

Gloggy.prototype.gistMetaToPostMeta = function(gist) {
  var post = this.postType();

  post.title(gist.description);
  post.comments(gist.comments);
  post.commentUrl(gist.comments_url);
  post.created(gist.created_at);
  post.edited(gist.updated_at);
  post.slug(gist.files[Object.keys(gist.files)[0]].filename);
  post.dataUrl('http://gist.github.com/' + this.config.user + '/' + gist.id + '.json?callback=gistToPost');

  return post;
}

Gloggy.prototype.gistMetaListToPostMetaList = function(gistMetaList) {
  var postMetaList = [] // short for post meta list
    , length = gistMetaList.length
    ;

  for (var i = 0; i < length; i++) {
    postMetaList.push( this.gistMetaToPostMeta(gistMetaList[i]) );
  }

  this.postMetaList = postMetaList;
  return postMetaList;
}

Gloggy.prototype.renderPostList = function(postList){
  // this.config.index.perPage
  this.el.postIndex = document.getElementById('post-index');
  var frag = document.createDocumentFragment();

  for (var i = 0; i < this.postMetaList.length; i++) {
    this.renderPostIndexItem(frag, this.postMetaList[i]);
  }

  this.el.postIndex.appendChild(frag);
}

Gloggy.prototype.renderPostIndexItem = function(frag, postMeta) {
  var el = document.createElement('li');
  el.setAttribute('data-target-post', postMeta.slug);

  var title = document.createElement('h2');
  title.setAttribute('class', 'title');
  title.innerText = postMeta.title;
  el.appendChild(title);

  var date = document.createElement('span');
  date.setAttribute('class', 'date');
  date.innerText = postMeta.created.toString();
  el.appendChild(date);

  frag.appendChild(el);
}

var g = new Gloggy({'user': 'svincent'})
  , r = null;

g.fetchGistList()
  .then(g.getResponse)
  .then(g.parseJson)
  .then(g.filterPosts.bind(g))
  .then(g.gistMetaListToPostMetaList.bind(g))
  .then(g.renderPostList.bind(g))
  .then(function(a){
      console.log("success");
      console.log(a);
      r = a;
    }, function(e){
      console.log("fail");
      throw(e);
      r = e;
    });
