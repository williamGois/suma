import path from "path";
import Module from "module";

export const cthLoadFromContent = (content, filename) => {
  var m = new Module(filename, Module.parent);
  m.filename = filename;
  m.paths = Module._nodeModulePaths(path.dirname(filename));
  m._compile(content, filename);
  return m.exports;
};
