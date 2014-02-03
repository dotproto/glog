var obj = {};
// Parse the JSONP Gist data provided by GitHub
function parseGist(data) {
  var style = document.createElement('link');
  style.setAttribute('rel', 'stylesheet');
  style.setAttribute('href', '//gist.github.com/' + data.stylesheet);
  document.head.appendChild(style);

  var wrap = document.createDocumentFragment().appendChild(document.createElement('div'));
  wrap.innerHTML = data.div;

  var files = wrap.getElementsByClassName('gist-file');
  _.each(files, function(file){
    document.body.appendChild(file.cloneNode(true));
  });

  obj = data;
}

// Asynchronously fetch a Gist via GitHub's public JSONP interface
function loadGist(user, id) {
  var script = document.createElement("script");
  script.setAttribute("src", "https://gist.github.com/" + user + "/"+ id + ".json?callback=parseGist");
  document.body.appendChild(script);
}
