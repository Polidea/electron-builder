"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

let writeConfigFile = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (tmpDir, templatePath, options) {
        //noinspection JSUnusedLocalSymbols
        function replacer(match, p1) {
            if (p1 in options) {
                return options[p1];
            } else {
                throw new Error(`Macro ${p1} is not defined`);
            }
        }
        const config = (yield (0, (_fsExtraP || _load_fsExtraP()).readFile)(templatePath, "utf8")).replace(/\$\{([a-zA-Z]+)\}/g, replacer).replace(/<%=([a-zA-Z]+)%>/g, function (match, p1) {
            (0, (_log || _load_log()).warn)("<%= varName %> is deprecated, please use ${varName} instead");
            return replacer(match, p1.trim());
        });
        const outputPath = yield tmpDir.getTempFile(_path.basename(templatePath, ".tpl"));
        yield (0, (_fsExtraP || _load_fsExtraP()).outputFile)(outputPath, config);
        return outputPath;
    });

    return function writeConfigFile(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
})();
//# sourceMappingURL=fpm.js.map


var _electronBuilderCore;

function _load_electronBuilderCore() {
    return _electronBuilderCore = require("electron-builder-core");
}

var _electronBuilderUtil;

function _load_electronBuilderUtil() {
    return _electronBuilderUtil = require("electron-builder-util");
}

var _binDownload;

function _load_binDownload() {
    return _binDownload = require("electron-builder-util/out/binDownload");
}

var _fs;

function _load_fs() {
    return _fs = require("electron-builder-util/out/fs");
}

var _log;

function _load_log() {
    return _log = require("electron-builder-util/out/log");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _path = _interopRequireWildcard(require("path"));

var _errorMessages;

function _load_errorMessages() {
    return _errorMessages = _interopRequireWildcard(require("../errorMessages"));
}

var _LinuxTargetHelper;

function _load_LinuxTargetHelper() {
    return _LinuxTargetHelper = require("./LinuxTargetHelper");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

const fpmPath = process.platform === "win32" || process.env.USE_SYSTEM_FPM === "true" ? (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve("fpm") : downloadFpm();
// can be called in parallel, all calls for the same version will get the same promise - will be downloaded only once
function downloadFpm() {
    const version = process.platform === "darwin" ? "fpm-1.6.3-20150715-2.2.2" : "fpm-1.6.3-2.3.1";
    const osAndArch = process.platform === "darwin" ? "mac" : `linux-x86${process.arch === "ia32" ? "" : "_64"}`;
    //noinspection SpellCheckingInspection
    const sha2 = process.platform === "darwin" ? "1b13080ecfd2b6fddb984ed6e1dfcb38cdf5b051a04d609c2a95227ed9a5ecbc" : process.arch === "ia32" ? "b55f25749a27097140171f073466c52e59f733a275fea99e2334c540627ffc62" : "4c6fc529e996f7ff850da2d0bb6c85080e43be672494b14c0c6bdcc03bf57328";
    return (0, (_binDownload || _load_binDownload()).getBin)("fpm", version, `https://dl.bintray.com/electron-userland/bin/${version}-${osAndArch}.7z`, sha2).then(it => _path.join(it, "fpm"));
}
class FpmTarget extends (_electronBuilderCore || _load_electronBuilderCore()).Target {
    constructor(name, packager, helper, outDir) {
        super(name, false);
        this.packager = packager;
        this.helper = helper;
        this.outDir = outDir;
        this.options = Object.assign({}, this.packager.platformSpecificBuildOptions, this.packager.config[this.name]);
        this.scriptFiles = this.createScripts();
    }
    createScripts() {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const defaultTemplatesDir = _path.join(__dirname, "..", "..", "templates", "linux");
            const packager = _this.packager;
            const templateOptions = Object.assign({
                // old API compatibility
                executable: packager.executableName,
                productFilename: packager.appInfo.productFilename
            }, packager.platformSpecificBuildOptions);
            function getResource(value, defaultFile) {
                if (value == null) {
                    return _path.join(defaultTemplatesDir, defaultFile);
                }
                return _path.resolve(packager.projectDir, value);
            }
            //noinspection ES6MissingAwait
            return yield (_bluebirdLst2 || _load_bluebirdLst2()).default.all([writeConfigFile(packager.info.tempDirManager, getResource(packager.platformSpecificBuildOptions.afterInstall, "after-install.tpl"), templateOptions), writeConfigFile(packager.info.tempDirManager, getResource(packager.platformSpecificBuildOptions.afterRemove, "after-remove.tpl"), templateOptions)]);
        })();
    }
    build(appOutDir, arch) {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const target = _this2.name;
            (0, (_log || _load_log()).log)(`Building ${target}`);
            const destination = _path.join(_this2.outDir, _this2.packager.generateName(target, arch, true /* on Linux we use safe name — without space */));
            yield (0, (_fs || _load_fs()).unlinkIfExists)(destination);
            if (_this2.packager.info.prepackaged != null) {
                yield (0, (_fsExtraP || _load_fsExtraP()).ensureDir)(_this2.outDir);
            }
            const scripts = yield _this2.scriptFiles;
            const packager = _this2.packager;
            const appInfo = packager.appInfo;
            const projectUrl = yield appInfo.computePackageUrl();
            if (projectUrl == null) {
                throw new Error("Please specify project homepage, see https://github.com/electron-userland/electron-builder/wiki/Options#AppMetadata-homepage");
            }
            const options = _this2.options;
            let author = options.maintainer;
            if (author == null) {
                const a = appInfo.metadata.author;
                if (a.email == null) {
                    throw new Error((_errorMessages || _load_errorMessages()).authorEmailIsMissed);
                }
                author = `${a.name} <${a.email}>`;
            }
            const synopsis = options.synopsis;
            const args = ["-s", "dir", "-t", target, "--architecture", target === "pacman" && arch === (_electronBuilderCore || _load_electronBuilderCore()).Arch.ia32 ? "i686" : (0, (_electronBuilderCore || _load_electronBuilderCore()).toLinuxArchString)(arch), "--name", appInfo.name, "--force", "--after-install", scripts[0], "--after-remove", scripts[1], "--description", (0, (_electronBuilderUtil || _load_electronBuilderUtil()).smarten)(target === "rpm" ? _this2.helper.getDescription(options) : `${synopsis || ""}\n ${_this2.helper.getDescription(options)}`), "--maintainer", author, "--vendor", options.vendor || author, "--version", appInfo.version, "--package", destination, "--url", projectUrl];
            const packageCategory = options.packageCategory;
            if (packageCategory != null && packageCategory !== null) {
                args.push("--category", packageCategory);
            }
            if (target === "deb") {
                args.push("--deb-compression", options.compression || (packager.config.compression === "store" ? "gz" : "xz"));
                (0, (_electronBuilderUtil || _load_electronBuilderUtil()).use)(options.priority, function (it) {
                    return args.push("--deb-priority", it);
                });
            } else if (target === "rpm") {
                // args.push("--rpm-compression", options.compression || (this.config.compression === "store" ? "none" : "xz"))
                args.push("--rpm-os", "linux");
                if (synopsis != null) {
                    args.push("--rpm-summary", (0, (_electronBuilderUtil || _load_electronBuilderUtil()).smarten)(synopsis));
                }
            }
            let depends = options.depends;
            if (depends == null) {
                if (target === "deb") {
                    depends = ["gconf2", "gconf-service", "libnotify4", "libappindicator1", "libxtst6", "libnss3"];
                } else if (target === "pacman") {
                    depends = ["c-ares", "ffmpeg", "gtk3", "http-parser", "libevent", "libvpx", "libxslt", "libxss", "minizip", "nss", "re2", "snappy", "libnotify", "libappindicator-gtk2", "libappindicator-gtk3", "libappindicator-sharp"];
                } else if (target === "rpm") {
                    depends = ["libnotify", "libappindicator"];
                } else {
                    depends = [];
                }
            } else if (!Array.isArray(depends)) {
                if (typeof depends === "string") {
                    depends = [depends];
                } else {
                    throw new Error(`depends must be Array or String, but specified as: ${depends}`);
                }
            }
            for (const dep of depends) {
                args.push("--depends", dep);
            }
            (0, (_electronBuilderUtil || _load_electronBuilderUtil()).use)(packager.appInfo.metadata.license, function (it) {
                return args.push("--license", it);
            });
            (0, (_electronBuilderUtil || _load_electronBuilderUtil()).use)(appInfo.buildNumber, function (it) {
                return args.push("--iteration", it);
            });
            (0, (_electronBuilderUtil || _load_electronBuilderUtil()).use)(options.fpm, function (it) {
                return args.push.apply(args, _toConsumableArray(it));
            });
            args.push(`${appOutDir}/=${(_LinuxTargetHelper || _load_LinuxTargetHelper()).installPrefix}/${appInfo.productFilename}`);
            for (const mapping of yield _this2.helper.icons) {
                args.push(mapping.join("=/usr/share/icons/hicolor/"));
            }
            const desktopFilePath = yield _this2.helper.computeDesktopEntry(_this2.options);
            args.push(`${desktopFilePath}=/usr/share/applications/${_this2.packager.executableName}.desktop`);
            if (_this2.packager.packagerOptions.effectiveOptionComputed != null && (yield _this2.packager.packagerOptions.effectiveOptionComputed([args, desktopFilePath]))) {
                return;
            }
            yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)((yield fpmPath), args);
            _this2.packager.dispatchArtifactCreated(destination, _this2);
        })();
    }
}
exports.default = FpmTarget;