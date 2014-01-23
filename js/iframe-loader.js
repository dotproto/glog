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

var Loader = function(){ return frame; }
Loader.prototype.update = function src(url){
  frame.src = url
  return frame;
}

var AnotherLoader = (function(id){
  id = id || "frame-loader";
  var frame = document.getElementById(id);
  
  if (frame === null) {
    frame = document.createElement('iframe');
  }
  
  function appendTo(target) {
    return target.append(frame);
  }
  
  return (function(){
    return frame
  })()
})()

// var loader = new Loader();

