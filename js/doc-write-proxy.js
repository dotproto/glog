document.wrote = document.write;
document.write = (function(){
  var parser = new DOMParser();

  function appendChildren(parent, target) {
    if(parent.children.length === 0) { return; }

    Array.prototype.forEach.call(parent.children, function(el){
      target.appendChild(el);
    });
  }

  return function(line) {
    console.log(line);
    var parsed = parser.parseFromString(line, "text/html");

    appendChildren(parsed.head, document.head);
    appendChildren(parsed.body, document.body);
    // Array.prototype.forEach.call(parsed.body.children, function(element){
    //   document.body.appendChild(element);
    // });
  }
})()
