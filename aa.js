var path = require('path');
var os = require(os);

module.exports.root = function(relativePath){
  relativePath = relativePath || '';
  return path.join(path.resolve(_dirname,'../../..'), relativePath)
};

module.exports.getRequireString = function(filePath, moduleName, inline){
  return 'require(\" + filePath + '\')[\" + moduleName + '\']';
};

module.exports.getSyncLoader = function(filePath, moduleName, inline){
  var requireString = module.exports.getRequireString(filePath, moduleName);

  var result = [
    'loadChildren: function(){',
    ' return ' + requireString + ';',
    '}'
  ];

  return inline ? result.join('') : result.join('\n');
};

module.exports.getRequireLoader = function(filePath, chunkName, moduleName, inline) {
  var requireString = module.exports.getRequireString(filePath, moduleName);
  var webpackChunkName = chunkName ? ',\" + chunkName + '\" : '';

  var result = [ 'loadChildren: () => new Promise(function(resolve){',
    ' (require as any).ensure([], function(require: any) {',
    ' resolve(' + requireString + '};',
    ' }' + webpackChunkName + ');',
    '})'
  ];

  return inline ? result.join('') : result.join('\n');
};

module.exports.getSystemLoader = function(filePath, moduleName, inline){
  var result = ['loadChildren: () => System.import(\" + filePath + '\')',
    ' .then(function(module){',
    ' return module[\" + moduleName + '\'];',
    ' })'
  ];

  return inline ? result.join('') : result.join('\n');
};

module.exports.getFilename =  function(resourcePath){
  var filename = path.basename(resourcePath);

  return path.basename(resourcePath, path.extname(filename));
};

module.exports.normalizeFilePath = function(resourcePath, filePath) {
  var newPath = filePath;
  var resourceDir = path.dirname(resourcePath);

  newPath = path.relative(resourceDir, this.root('src/' + newPath));

  if(!newPath.startsWidth('./') && !newPath.startsWidth('../')){
    newPath = './' + newPath;
  }

  if(os.platform() === 'win32'){
    var winpath = newPath.replace(/\//g, '\\');
    newPath = winpath.replace(/\\/g, '\\\\');
  }

  return newPath;
};
