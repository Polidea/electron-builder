"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.attachAndExecute = exports.DmgTarget = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

let detach = (() => {
    var _ref2 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (name) {
        try {
            yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("hdiutil", ["detach", name]);
        } catch (e) {
            yield new (_bluebirdLst2 || _load_bluebirdLst2()).default(function (resolve, reject) {
                setTimeout(function () {
                    (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("hdiutil", ["detach", "-force", name]).then(resolve).catch(reject);
                }, 1000);
            });
        }
    });

    return function detach(_x) {
        return _ref2.apply(this, arguments);
    };
})();

let attachAndExecute = exports.attachAndExecute = (() => {
    var _ref3 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (dmgPath, readWrite, task) {
        //noinspection SpellCheckingInspection
        const args = ["attach", "-noverify", "-noautoopen"];
        if (readWrite) {
            args.push("-readwrite");
        }
        // otherwise hangs
        // addVerboseIfNeed(args)
        args.push(dmgPath);
        const attachResult = yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("hdiutil", args, { maxBuffer: 2 * 1024 * 1024 });
        const deviceResult = attachResult == null ? null : /^(\/dev\/\w+)/.exec(attachResult);
        const device = deviceResult == null || deviceResult.length !== 2 ? null : deviceResult[1];
        if (device == null) {
            throw new Error(`Cannot mount: ${attachResult}`);
        }
        return yield (0, (_promise || _load_promise()).executeFinally)(task(), function () {
            return detach(device);
        });
    });

    return function attachAndExecute(_x2, _x3, _x4) {
        return _ref3.apply(this, arguments);
    };
})();

var _electronBuilderCore;

function _load_electronBuilderCore() {
    return _electronBuilderCore = require("electron-builder-core");
}

var _electronBuilderUtil;

function _load_electronBuilderUtil() {
    return _electronBuilderUtil = require("electron-builder-util");
}

var _deepAssign;

function _load_deepAssign() {
    return _deepAssign = require("electron-builder-util/out/deepAssign");
}

var _fs;

function _load_fs() {
    return _fs = require("electron-builder-util/out/fs");
}

var _log;

function _load_log() {
    return _log = require("electron-builder-util/out/log");
}

var _promise;

function _load_promise() {
    return _promise = require("electron-builder-util/out/promise");
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DmgTarget extends (_electronBuilderCore || _load_electronBuilderCore()).Target {
    constructor(packager, outDir) {
        super("dmg");
        this.packager = packager;
        this.outDir = outDir;
        this.helperDir = _path.join(__dirname, "..", "..", "templates", "dmg");
    }
    build(appPath, arch) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const packager = _this.packager;
            const appInfo = packager.appInfo;
            (0, (_log || _load_log()).log)("Building DMG");
            const specification = yield _this.computeDmgOptions();
            const tempDir = yield packager.getTempFile("dmg");
            const tempDmg = _path.join(tempDir, "temp.dmg");
            const backgroundDir = _path.join(tempDir, ".background");
            const backgroundFilename = specification.background == null ? null : _path.basename(specification.background);
            if (backgroundFilename != null) {
                yield (0, (_fsExtraP || _load_fsExtraP()).copy)(_path.resolve(packager.info.projectDir, specification.background), _path.join(backgroundDir, backgroundFilename));
            }
            let preallocatedSize = 32 * 1024;
            if (specification.icon != null) {
                const stat = yield (0, (_fs || _load_fs()).statOrNull)(specification.icon);
                if (stat != null) {
                    preallocatedSize += stat.size;
                }
            }
            // allocate space for .DS_Store
            yield (0, (_fsExtraP || _load_fsExtraP()).outputFile)(_path.join(backgroundDir, "DSStorePlaceHolder"), new Buffer(preallocatedSize));
            const volumeName = (0, (_sanitizeFilename || _load_sanitizeFilename()).default)(_this.computeVolumeName(specification.title));
            //noinspection SpellCheckingInspection
            yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).spawn)("hdiutil", addVerboseIfNeed(["create", "-srcfolder", backgroundDir, "-srcfolder", appPath, "-volname", volumeName, "-anyowners", "-nospotlight", "-fs", "HFS+", "-fsargs", "-c c=64,a=16,e=16", "-format", "UDRW"]).concat(tempDmg));
            const volumePath = _path.join("/Volumes", volumeName);
            if (yield (0, (_fs || _load_fs()).exists)(volumePath)) {
                (0, (_electronBuilderUtil || _load_electronBuilderUtil()).debug)("Unmounting previous disk image");
                yield detach(volumePath);
            }
            const isContinue = yield attachAndExecute(tempDmg, true, (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
                const promises = [specification.background == null ? (0, (_fsExtraP || _load_fsExtraP()).remove)(`${volumePath}/.background`) : (0, (_fsExtraP || _load_fsExtraP()).unlink)(`${volumePath}/.background/DSStorePlaceHolder`)];
                let contents = specification.contents;
                if (contents == null) {
                    contents = [{
                        "x": 130, "y": 220
                    }, {
                        "x": 410, "y": 220, "type": "link", "path": "/Applications"
                    }];
                }
                const window = specification.window;
                const env = Object.assign({}, process.env, {
                    volumePath: volumePath,
                    appFileName: `${packager.appInfo.productFilename}.app`,
                    iconSize: specification.iconSize || 80,
                    iconTextSize: specification.iconTextSize || 12,
                    windowX: window.x,
                    windowY: window.y,
                    VERSIONER_PERL_PREFER_32_BIT: "true"
                });
                if (specification.icon == null) {
                    delete env.volumeIcon;
                } else {
                    const volumeIcon = `${volumePath}/.VolumeIcon.icns`;
                    promises.push((0, (_fsExtraP || _load_fsExtraP()).copy)((yield packager.getResource(specification.icon)), volumeIcon));
                    env.volumeIcon = volumeIcon;
                }
                if (specification.backgroundColor != null || specification.background == null) {
                    env.backgroundColor = specification.backgroundColor || "#ffffff";
                    env.windowWidth = window.width || 540;
                    env.windowHeight = window.height || 380;
                } else {
                    delete env.backgroundColor;
                    if (window.width == null) {
                        delete env.windowWidth;
                    } else {
                        env.windowWidth = window.width;
                    }
                    if (window.height == null) {
                        delete env.windowHeight;
                    } else {
                        env.windowHeight = window.height;
                    }
                    env.backgroundFilename = backgroundFilename;
                }
                let entries = "";
                for (const c of contents) {
                    if (c.path != null && c.path.endsWith(".app") && c.type !== "link") {
                        (0, (_log || _load_log()).warn)(`Do not specify path for application: "${c.path}". Actual path to app will be used instead.`);
                    }
                    let entryPath = c.path || `${packager.appInfo.productFilename}.app`;
                    if (entryPath.startsWith("/")) {
                        entryPath = entryPath.substring(1);
                    }
                    const entryName = c.name || _path.basename(entryPath);
                    entries += `&makeEntries("${entryName}", Iloc_xy => [ ${c.x}, ${c.y} ]),\n`;
                    if (c.type === "link") {
                        promises.push((0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("ln", ["-s", `/${entryPath}`, `${volumePath}/${entryName}`]));
                    }
                }
                (0, (_electronBuilderUtil || _load_electronBuilderUtil()).debug)(entries);
                const dmgPropertiesFile = yield packager.getTempFile("dmgProperties.pl");
                promises.push((0, (_fsExtraP || _load_fsExtraP()).outputFile)(dmgPropertiesFile, (yield (0, (_fsExtraP || _load_fsExtraP()).readFile)(_path.join(_this.helperDir, "dmgProperties.pl"), "utf-8")).replace("$ENTRIES", entries)));
                yield (_bluebirdLst2 || _load_bluebirdLst2()).default.all(promises);
                yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("/usr/bin/perl", [dmgPropertiesFile], {
                    cwd: _path.join(__dirname, "..", "..", "vendor"),
                    env: env
                });
                yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("sync");
                return packager.packagerOptions.effectiveOptionComputed == null || !(yield packager.packagerOptions.effectiveOptionComputed({ volumePath, specification, packager }));
            }));
            if (!isContinue) {
                return;
            }
            const artifactPath = _path.join(_this.outDir, packager.expandArtifactNamePattern(packager.config.dmg, "dmg"));
            // dmg file must not exist otherwise hdiutil failed (https://github.com/electron-userland/electron-builder/issues/1308#issuecomment-282847594), so, -ov must be specified
            //noinspection SpellCheckingInspection
            yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).spawn)("hdiutil", addVerboseIfNeed(["convert", tempDmg, "-ov", "-format", specification.format, "-imagekey", `zlib-level=${process.env.ELECTRON_BUILDER_COMPRESSION_LEVEL || "9"}`, "-o", artifactPath]));
            yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("hdiutil", addVerboseIfNeed(["internet-enable", "-no"]).concat(artifactPath));
            _this.packager.dispatchArtifactCreated(artifactPath, _this, `${appInfo.name}-${appInfo.version}.dmg`);
        })();
    }
    computeVolumeName(custom) {
        const appInfo = this.packager.appInfo;
        if (custom == null) {
            return `${appInfo.productFilename} ${appInfo.version}`;
        }
        return custom.replace(/\$\{version}/g, appInfo.version).replace(/\$\{name}/g, appInfo.name).replace(/\$\{productName}/g, appInfo.productName);
    }
    // public to test
    computeDmgOptions() {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const packager = _this2.packager;
            const specification = (0, (_deepAssign || _load_deepAssign()).deepAssign)({
                window: {
                    x: 400,
                    y: 100
                }
            }, packager.config.dmg);
            // appdmg
            const oldPosition = specification.window.position;
            if (oldPosition != null) {
                specification.window.x = oldPosition.x;
                specification.window.y = oldPosition.y;
            }
            const oldSize = specification.window.size;
            if (oldSize != null) {
                specification.window.width = oldSize.width;
                specification.window.height = oldSize.height;
            }
            if (specification["icon-size"] != null) {
                if (specification.iconSize == null) {
                    specification.iconSize = specification["icon-size"];
                }
                (0, (_log || _load_log()).warn)("dmg.icon-size is deprecated, please use dmg.iconSize instead");
            }
            if (!("icon" in specification)) {
                (0, (_electronBuilderUtil || _load_electronBuilderUtil()).use)((yield packager.getIconPath()), function (it) {
                    specification.icon = it;
                });
            }
            if (specification.icon != null && (0, (_electronBuilderUtil || _load_electronBuilderUtil()).isEmptyOrSpaces)(specification.icon)) {
                throw new Error("dmg.icon cannot be specified as empty string");
            }
            if (specification["background-color"] != null) {
                if (specification.backgroundColor == null) {
                    specification.backgroundColor = specification["background-color"];
                }
                (0, (_log || _load_log()).warn)("dmg.background-color is deprecated, please use dmg.backgroundColor instead");
            }
            if (specification.backgroundColor != null) {
                if (specification.background != null) {
                    throw new Error("Both dmg.backgroundColor and dmg.background are specified — please set the only one");
                }
                specification.backgroundColor = require("parse-color")(specification.backgroundColor).hex;
            }
            if (specification.backgroundColor == null && !("background" in specification)) {
                const resourceList = yield packager.resourceList;
                if (resourceList.indexOf("background.tiff") !== -1) {
                    specification.background = _path.join(packager.buildResourcesDir, "background.tiff");
                } else if (resourceList.indexOf("background.png") !== -1) {
                    specification.background = _path.join(packager.buildResourcesDir, "background.png");
                } else {
                    specification.background = _path.join(_this2.helperDir, "background.tiff");
                }
            }
            if (specification.format == null) {
                if (process.env.ELECTRON_BUILDER_COMPRESSION_LEVEL != null) {
                    specification.format = "UDZO";
                } else if (packager.config.compression === "store") {
                    specification.format = "UDRO";
                } else {
                    specification.format = packager.config.compression === "maximum" ? "UDBZ" : "UDZO";
                }
            }
            return specification;
        })();
    }
}
exports.DmgTarget = DmgTarget;

function addVerboseIfNeed(args) {
    if (process.env.DEBUG_DMG === "true") {
        args.push("-verbose");
    }
    return args;
}
//# sourceMappingURL=dmg.js.map