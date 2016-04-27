
var baseURL = '../';

//*****************************************************************************

function loadFile(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.send(null);

  var s = xhr.status;
  if (s !== 0 && s !== 200 && s !== 1223) {
    var err = Error(xhr.status +' failed to load '+ url);
    err.status = xhr.status;
    err.responseText = xhr.responseText;
    throw err;
  }

  return xhr.responseText;
}

function loadShaders(config) {
  var src, name, Shaders = {};

  for (var i = 0; i < config.length; i++) {
    name = config[i];

    Shaders[name] = {};

    src = loadFile(baseURL +'src/shader/'+ name +'.vs');
    Shaders[name].vertex = src.replace(/'/g, "\'").replace(/[\r\n]+/g, '\n');

    src = loadFile(baseURL +'src/shader/'+ name +'.fs');
    Shaders[name].fragment = src.replace(/'/g, "\'").replace(/[\r\n]+/g, '\n');
  }

  console.log('Shaders', Shaders);
  return 'var Shaders = '+ JSON.stringify(Shaders) +';\n';
}

//*****************************************************************************

var config = JSON.parse(loadFile(baseURL +'config.json'));
var js = '';

// modules

for (var i = 0; i < config.modules.length; i++) {
  js += loadFile(baseURL + config.modules[i]) + '\n';
}

// shaders

js += loadShaders(config.shaders);

// glx

js += "var GLX = (function() {";
for (var i = 0; i < config.glx.length; i++) {
  js += loadFile(baseURL + config.glx[i]) + '\n';
}
js += "\nreturn GLX;\n}());\n";

// basemap

js += "var Basemap = (function() {";
for (var i = 0; i < config.basemap.length; i++) {
  js += loadFile(baseURL + config.basemap[i]) + '\n';
}
js += "\nreturn Basemap;\n}());\n";
js += "\nvar GLMap = Basemap;\n";

// core

js += "(function(global) {";
for (var i = 0; i < config.src.length; i++) {
  js += loadFile(baseURL + config.src[i]) + '\n';
}
js += "}(this));";


var global = this;

try {
  eval(js);
} catch (ex) {
  console.error(ex);
}
