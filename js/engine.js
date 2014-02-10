var user = "svincent";
var blogTag = "POST:";

(function(){
  var PostAuthor   = function() {}
  PostAuthor.prototype.name    = null;
  PostAuthor.prototype.url     = null;
  PostAuthor.prototype.image   = null;

  var PostTime     = function() {}
  PostTime.prototype.created   = null;
  PostTime.prototype.edited    = null;

  var PostFile     = function() {}
  PostFile.prototype.name      = null;
  PostFile.prototype.type      = null;
  PostFile.prototype.url       = null;

  var PostComments = function() {}
  PostComments.prototype.count = 0;
  PostComments.prototype.url   = null;

  var Post = function() {};
  Post.prototype.title = null;
  Post.prototype.author = new PostAuthor();
  Post.prototype.time   = new PostTime();
  Post.prototype.comments = new PostComments();
  Post.prototype.files = [];

  this.Post = Post;
  this.PostFile = PostFile;
})()


// Simple "get" promise courtesy of Jake Archibald (@jaffathecake)
// http://www.html5rocks.com/en/tutorials/es6/promises/
function get(url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('GET', url);

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

function basicError(err) {
  console.error(err);
}


// https://api.github.com/gists/7899369
// Fetch a list of gists for a given user.
//
// TODO: User is implicitly defined in the caller's scope? That's ... just weird.
function getGists() {
  var url = "https://api.github.com/users/" + user + "/gists";
  return get(url);
}

function getGistsTest() {
  var url = "dummy/getify_gists.json";
  return get(url);
}

// TODO: What does this function do?
function gistPages(link) {
  if (!link || !link.trim()) return;

  var nav = Object.create(null);
  var tagExp = /,\s*/;                     // Links are provided as a CSV
  var relExp = /<([^>]*)>; rel="([^"]*)"/; // Group 1 is a URL, group 2 describes the URL's purpose
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
 * Convert a XMLHttpRequest getAllResponseHeaders() string into a header field object. Here, field
 * names map to keys and field values map to values.
 */
function getHeaders(headerString) {
  var headers = Object.create(null);
  var regexp = /:\s?(.*)/;

  headerString.split(/\r\n/).forEach(function(value){
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

function gistToPost(gist) {
   post = new Post();
   // Preapre Author record
   post.author.name  = gist.user.login;
   post.author.url   = gist.user.html_url;
   post.author.image = "//gravatar.com/avatar/" + gist.user.gravatar_id;
   // Prepare Time record
   post.time.created = Date(gist.created_at);
   post.time.edited  = Date(gist.updated_at);
   // Prepare Comment record
   post.comments.count = gist.comments;
   post.comments.url = gist.comments_url;
   // Prepare File records
   for (var key in gist.files) {
     var file = new PostFile();
     var current = gist.files[key];
     file.name = current.filename;
     file.type = current.type;
     file.url  = current.raw_url;

     post.files.push(file);
   }

   return post;
}

function appendPost(post) {
  var getList = [];
  var files = post.files;
  post.files.forEach(function(file, index, array){
    // get(file.url).then(function(req){
    get("https://gist.github.com/svincent/8555854.js").then(function(req){
      console.log(req.response);
    });
  });
}

getGists().then(function(req) {
  var headers = getHeaders(req.getAllResponseHeaders());
  // console.log(headers);
  // console.log(gistPages(headers.Link))

  var gistList = JSON.parse(req.response);
  filteredGists = gistList.filter(function(obj, index, array){
    return obj.description.indexOf(blogTag) !== -1
  });

  var postList = [];
  filteredGists.forEach(function(item){
    postList.push(gistToPost(item));
  });

  postList.forEach(function(post, index, array) {
    appendPost(post);
  });

}, function(error){
  console.error(error);
  throw error;
});
