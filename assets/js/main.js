(function(){
  // Determine this script's directory and load components.js from the same folder
  var currentScript = document.currentScript || (function(){
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();
  var src = (currentScript && currentScript.src) ? currentScript.src : '/assets/js/main.js';
  var dir = src.substring(0, src.lastIndexOf('/') + 1);
  var componentsPath = dir + 'components.js';

  var s = document.createElement('script');
  s.src = componentsPath;
  s.async = false; // preserve execution order
  document.head.appendChild(s);
})();
