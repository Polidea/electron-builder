"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LinuxPackager = undefined;

var _electronBuilderCore;

function _load_electronBuilderCore() {
    return _electronBuilderCore = require("electron-builder-core");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _path = _interopRequireWildcard(require("path"));

var _sanitizeFilename;

function _load_sanitizeFilename() {
    return _sanitizeFilename = _interopRequireDefault(require("sanitize-filename"));
}

var _platformPackager;

function _load_platformPackager() {
    return _platformPackager = require("./platformPackager");
}

var _LinuxTargetHelper;

function _load_LinuxTargetHelper() {
    return _LinuxTargetHelper = require("./targets/LinuxTargetHelper");
}

var _targetFactory;

function _load_targetFactory() {
    return _targetFactory = require("./targets/targetFactory");
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class LinuxPackager extends (_platformPackager || _load_platformPackager()).PlatformPackager {
    constructor(info) {
        super(info);
        const executableName = this.platformSpecificBuildOptions.executableName;
        this.executableName = (0, (_sanitizeFilename || _load_sanitizeFilename()).default)(executableName == null ? this.appInfo.name.toLowerCase() : executableName);
    }
    get defaultTarget() {
        return ["appimage"];
    }
    createTargets(targets, mapper, cleanupTasks) {
        let helper;
        const getHelper = () => {
            if (helper == null) {
                helper = new (_LinuxTargetHelper || _load_LinuxTargetHelper()).LinuxTargetHelper(this);
            }
            return helper;
        };
        for (const name of targets) {
            if (name === (_electronBuilderCore || _load_electronBuilderCore()).DIR_TARGET) {
                continue;
            }
            const targetClass = (() => {
                switch (name) {
                    case "appimage":
                        return require("./targets/appImage").default;
                    case "snap":
                        return require("./targets/snap").default;
                    case "deb":
                    case "rpm":
                    case "sh":
                    case "freebsd":
                    case "pacman":
                    case "apk":
                    case "p5p":
                        return require("./targets/fpm").default;
                    default:
                        return null;
                }
            })();
            mapper(name, outDir => targetClass === null ? (0, (_targetFactory || _load_targetFactory()).createCommonTarget)(name, outDir, this) : new targetClass(name, this, getHelper(), outDir));
        }
    }
    get platform() {
        return (_electronBuilderCore || _load_electronBuilderCore()).Platform.LINUX;
    }
    postInitApp(appOutDir) {
        return (0, (_fsExtraP || _load_fsExtraP()).rename)(_path.join(appOutDir, "electron"), _path.join(appOutDir, this.executableName));
    }
}
exports.LinuxPackager = LinuxPackager; //# sourceMappingURL=linuxPackager.js.map