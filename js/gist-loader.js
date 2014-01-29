function proxyForEach(arrayLike, callback) {
  Array.prototype.slice.call(arrayLike).forEach(callback);
}

function parseGist(data) {
  var style = document.createElement('link');
  style.setAttribute('rel', 'stylesheet');
  style.setAttribute('href', '//gist.github.com/' + data.stylesheet);
  document.head.appendChild(style);

  var wrap = document.createDocumentFragment().appendChild(document.createElement('div'));
  wrap.innerHTML = data.div;

  var files = wrap.getElementsByClassName('gist-file')
  proxyForEach(files, function(file){
    document.body.appendChild(file);
  });
}

function loadGist(user, id) {
  var script = document.createElement("script");
  script.setAttribute("src", "https://gist.github.com/" + user + "/"+ id + ".json?callback=parseGist");
  document.body.appendChild(script);
}
