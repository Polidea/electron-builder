"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _packager;

function _load_packager() {
  return _packager = require("./packager");
}

Object.defineProperty(exports, "Packager", {
  enumerable: true,
  get: function () {
    return (_packager || _load_packager()).Packager;
  }
});

var _electronBuilderCore;

function _load_electronBuilderCore() {
  return _electronBuilderCore = require("electron-builder-core");
}

Object.defineProperty(exports, "getArchSuffix", {
  enumerable: true,
  get: function () {
    return (_electronBuilderCore || _load_electronBuilderCore()).getArchSuffix;
  }
});
Object.defineProperty(exports, "Platform", {
  enumerable: true,
  get: function () {
    return (_electronBuilderCore || _load_electronBuilderCore()).Platform;
  }
});
Object.defineProperty(exports, "Arch", {
  enumerable: true,
  get: function () {
    return (_electronBuilderCore || _load_electronBuilderCore()).Arch;
  }
});
Object.defineProperty(exports, "archFromString", {
  enumerable: true,
  get: function () {
    return (_electronBuilderCore || _load_electronBuilderCore()).archFromString;
  }
});
Object.defineProperty(exports, "Target", {
  enumerable: true,
  get: function () {
    return (_electronBuilderCore || _load_electronBuilderCore()).Target;
  }
});
Object.defineProperty(exports, "DIR_TARGET", {
  enumerable: true,
  get: function () {
    return (_electronBuilderCore || _load_electronBuilderCore()).DIR_TARGET;
  }
});

var _builder;

function _load_builder() {
  return _builder = require("./builder");
}

Object.defineProperty(exports, "build", {
  enumerable: true,
  get: function () {
    return (_builder || _load_builder()).build;
  }
});
Object.defineProperty(exports, "createTargets", {
  enumerable: true,
  get: function () {
    return (_builder || _load_builder()).createTargets;
  }
});