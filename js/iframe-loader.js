/* -------------------------------------------------------------------------------------------------
NEED:

A simple way to append uniquely identifiable iframes to the page in order to load external resources
inaccessable due to the same-origin policy on some resources.

REQUIREMENTS:

* Frames class MUST support the creation of uniquely identifiable frames
* ID will be specified when creating a new frame
* If an iframe with the specified ID already exists, return a reference to the pre-existing iframe
* ...

INTERFACE:

var frame = new Frame("unique-id");
frame // -> return a reference to the iframe element
frame.src = "http://example.com/resource" // immediately update the
frame.body // -> the iframes body
frame.addScript("http://example.com/script.js")
------------------------------------------------------------------------------------------------- */

var Loader = (function(){
  var _frameEl = null;          // iFrame's DOM element
  var _frameId = null;          // iFrame's unique ID
  var _config = {};             // User configuration
  var _defaults = {             // Default configuration
    "class": "loader-frame",
    "url": "",
    "id": "",
    "style": {
      "display": "none"
    },
    "parent": document.body
  }

  function init(config) {
    if (typeof config === "string") {
      config = {url: config};
    }

    _config = config || {};
    _.defaults(_config, _defaults);
  }

  /** Create a new frame element */
  function spawn(url) {
    // Only spawn a new frame if one hasn't been spawned
    if (_frameEl) { return _frameEl; }

    _frameEl = document.createElement('iframe');
    _frameEl.classList.add(_config.class);
    changeUrl(url);

    // Apply user-specified styles to new iFrame element
    for (var style in _config.style) {
      if (_config.style.hasOwnProperty(style)) {
        _frameEl.style[style] = _config.style[style];
      }
    }
    _config.parent.appendChild(_frameEl);
    addScriptToFrame("js/doc-write-proxy.js");

    return _frameEl;
  }

  function changeUrl(url) {
    if (typeof url !== "string") { return false };

    _config.url = url;
    _frameEl.src = _config.url;

    return true;
  }

  function getFrameBody() {
    return _frameEl.contentDocument.body;
  }

  function getFrameHead() {
    return _frameEl.contentDocument.head;
  }

  function getFrameElement() {
    return _frameEl;
  }

  function addScriptToFrame(src, options) {
    options = options || {};
    var el = document.createElement('script');
    getFrameBody().appendChild(el);

    for(var opt in options) {
      if(options.hasOwnProperty(opt)) {
        el.addEventListener(opt, options[opt]);
      }
    }

    el.src = src;
    return el;
  }

  function getGistData() {
    var gists = getFrameBody().getElementsByClassName("gist-file")
    return Array.prototype.slice.call(gists);
  }

  function getStyles() {
    var styles = getFrameHead().querySelectorAll("link[rel='stylesheet']")
    return Array.prototype.slice.call(styles);
  }

  /** Public interface for the iFrame loader */
  var facade = function(config){
    init(config);
    spawn(_config.url);
  };
  facade.prototype.url = changeUrl;
  facade.prototype.getElement = getFrameElement;
  facade.prototype.getBody = getFrameBody;
  facade.prototype.addScript = addScriptToFrame;
  Object.defineProperty(facade.prototype, "body", {
    enumerable: true,
    set: function(val){ console.warn("Cannot be directly modify 'body'"); return undefined },
    get: function(){ return getFrameBody(); }
  })
  Object.defineProperty(facade.prototype, "gists", {
    enumerable: true,
    set: function(val){ console.warn("Cannot be directly modify 'gists'"); return undefined },
    get: function(){ return getGistData(); }
  })
  Object.defineProperty(facade.prototype, "styles", {
    enumerable: true,
    set: function(val){ console.warn("Cannot be directly modify 'styles'"); return undefined },
    get: function(){ return getStyles(); }
  })

  return facade;
})()

var loader = new Loader('about:blank');

loader.addScript("//gist.github.com/svincent/8555854.js", {
  "load": function(event){
    loader.styles.forEach(function(item){
      document.head.appendChild(item);
    });
    loader.gists.forEach(function(item){
      document.body.appendChild(item);
    });
  }
});

