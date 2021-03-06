"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getArchSuffix = getArchSuffix;
exports.toLinuxArchString = toLinuxArchString;
exports.archFromString = archFromString;
var Arch = exports.Arch = undefined;
(function (Arch) {
    Arch[Arch["ia32"] = 0] = "ia32";
    Arch[Arch["x64"] = 1] = "x64";
    Arch[Arch["armv7l"] = 2] = "armv7l";
})(Arch || (exports.Arch = Arch = {}));
function getArchSuffix(arch) {
    return arch === Arch.x64 ? "" : `-${Arch[arch]}`;
}
function toLinuxArchString(arch) {
    return arch === Arch.ia32 ? "i386" : arch === Arch.x64 ? "amd64" : "armv7l";
}
function archFromString(name) {
    if (name === "x64") {
        return Arch.x64;
    }
    if (name === "ia32") {
        return Arch.ia32;
    }
    if (name === "armv7l") {
        return Arch.armv7l;
    }
    throw new Error(`Unsupported arch ${name}`);
}
class Platform {
    constructor(name, buildConfigurationKey, nodeName) {
        this.name = name;
        this.buildConfigurationKey = buildConfigurationKey;
        this.nodeName = nodeName;
    }
    toString() {
        return this.name;
    }
    createTarget(type) {
        for (var _len = arguments.length, archs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            archs[_key - 1] = arguments[_key];
        }

        if (type == null && (archs == null || archs.length === 0)) {
            return new Map([[this, new Map()]]);
        }
        const archToType = new Map();
        if (this === Platform.MAC) {
            archs = [Arch.x64];
        }
        for (const arch of archs == null || archs.length === 0 ? [archFromString(process.arch)] : archs) {
            archToType.set(arch, type == null ? [] : Array.isArray(type) ? type : [type]);
        }
        return new Map([[this, archToType]]);
    }
    static current() {
        return Platform.fromString(process.platform);
    }
    static fromString(name) {
        name = name.toLowerCase();
        switch (name) {
            case Platform.MAC.nodeName:
            case Platform.MAC.name:
                return Platform.MAC;
            case Platform.WINDOWS.nodeName:
            case Platform.WINDOWS.name:
            case Platform.WINDOWS.buildConfigurationKey:
                return Platform.WINDOWS;
            case Platform.LINUX.nodeName:
                return Platform.LINUX;
            default:
                throw new Error(`Unknown platform: ${name}`);
        }
    }
}
exports.Platform = Platform;
Platform.MAC = new Platform("mac", "mac", "darwin");
Platform.LINUX = new Platform("linux", "linux", "linux");
Platform.WINDOWS = new Platform("windows", "win", "win32");
// deprecated
//noinspection JSUnusedGlobalSymbols
Platform.OSX = Platform.MAC;
class Target {
    constructor(name) {
        let isAsyncSupported = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        this.name = name;
        this.isAsyncSupported = isAsyncSupported;
    }
    finishBuild() {
        return Promise.resolve();
    }
}
exports.Target = Target;
const DEFAULT_TARGET = exports.DEFAULT_TARGET = "default";
const DIR_TARGET = exports.DIR_TARGET = "dir";
//# sourceMappingURL=core.js.map