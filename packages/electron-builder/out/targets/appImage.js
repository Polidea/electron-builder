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

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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

var _uuid;

function _load_uuid() {
    return _uuid = require("uuid-1345");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const appImageVersion = process.platform === "darwin" ? "AppImage-09-07-16-mac" : "AppImage-09-07-16-linux";
//noinspection SpellCheckingInspection
const appImageSha256 = process.platform === "darwin" ? "5d4a954876654403698a01ef5bd7f218f18826261332e7d31d93ab4432fa0312" : "ac324e90b502f4e995f6a169451dbfc911bb55c0077e897d746838e720ae0221";
//noinspection SpellCheckingInspection
const appImagePathPromise = (0, (_binDownload || _load_binDownload()).getBin)("AppImage", appImageVersion, `https://dl.bintray.com/electron-userland/bin/${appImageVersion}.7z`, appImageSha256);
class AppImageTarget extends (_electronBuilderCore || _load_electronBuilderCore()).Target {
    constructor(ignored, packager, helper, outDir) {
        super("appImage");
        this.packager = packager;
        this.helper = helper;
        this.outDir = outDir;
        this.options = Object.assign({}, this.packager.platformSpecificBuildOptions, this.packager.config[this.name]);
        // we add X-AppImage-BuildId to ensure that new desktop file will be installed
        this.desktopEntry = (_bluebirdLst2 || _load_bluebirdLst2()).default.promisify((_uuid || _load_uuid()).v1)({ mac: false }).then(uuid => helper.computeDesktopEntry(this.options, "AppRun", null, {
            "X-AppImage-Version": `${packager.appInfo.buildVersion}`,
            "X-AppImage-BuildId": uuid
        }));
    }
    build(appOutDir, arch) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            (0, (_log || _load_log()).log)(`Building AppImage for arch ${(_electronBuilderCore || _load_electronBuilderCore()).Arch[arch]}`);
            const packager = _this.packager;
            // avoid spaces in the file name
            const resultFile = _path.join(_this.outDir, packager.generateName("AppImage", arch, true));
            yield (0, (_fs || _load_fs()).unlinkIfExists)(resultFile);
            const appImagePath = yield appImagePathPromise;
            const desktopFile = yield _this.desktopEntry;
            const args = ["-joliet", "on", "-volid", "AppImage", "-dev", resultFile, "-padding", "0", "-map", appOutDir, "/usr/bin", "-map", _path.join(__dirname, "..", "..", "templates", "linux", "AppRun.sh"), "/AppRun",
            // we get executable name in the AppRun by desktop file name, so, must be named as executable
            "-map", desktopFile, `/${_this.packager.executableName}.desktop`];
            for (const _ref of yield _this.helper.icons) {
                var _ref2 = _slicedToArray(_ref, 2);

                const from = _ref2[0];
                const to = _ref2[1];

                args.push("-map", from, `/usr/share/icons/default/${to}`);
            }
            // must be after this.helper.icons call
            if (_this.helper.maxIconPath == null) {
                throw new Error("Icon is not provided");
            }
            args.push("-map", _this.helper.maxIconPath, "/.DirIcon");
            if (arch === (_electronBuilderCore || _load_electronBuilderCore()).Arch.x64) {
                const libDir = yield (0, (_binDownload || _load_binDownload()).getBin)("AppImage-packages", "22.02.17", "https://bintray.com/electron-userland/bin/download_file?file_path=AppImage-packages-22.02.17-x64.7z", "04842227380e319f80727457ca76017df9e23356408df0d71f2919840cd4ffaf");
                args.push("-map", libDir, "/usr/lib");
            }
            args.push("-chown_r", "0", "/", "--");
            args.push("-zisofs", `level=${process.env.ELECTRON_BUILDER_COMPRESSION_LEVEL || (packager.config.compression === "store" ? "0" : "9")}:block_size=128k:by_magic=off`);
            args.push("set_filter_r", "--zisofs", "/");
            if (_this.packager.packagerOptions.effectiveOptionComputed != null && (yield _this.packager.packagerOptions.effectiveOptionComputed([args, desktopFile]))) {
                return;
            }
            yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)(process.arch !== "x64" || process.env.USE_SYSTEM_XORRISO === "true" || process.env.USE_SYSTEM_XORRISO === "" ? "xorriso" : _path.join(appImagePath, "xorriso"), args, {
                maxBuffer: 2 * 1024 * 1024
            });
            yield new (_bluebirdLst2 || _load_bluebirdLst2()).default(function (resolve, reject) {
                const rd = (0, (_fsExtraP || _load_fsExtraP()).createReadStream)(_path.join(appImagePath, arch === (_electronBuilderCore || _load_electronBuilderCore()).Arch.ia32 ? "32" : "64", "runtime"));
                rd.on("error", reject);
                const wr = (0, (_fsExtraP || _load_fsExtraP()).createWriteStream)(resultFile, { flags: "r+" });
                wr.on("error", reject);
                wr.on("close", resolve);
                rd.pipe(wr);
            });
            const fd = yield (0, (_fsExtraP || _load_fsExtraP()).open)(resultFile, "r+");
            try {
                const magicData = new Buffer([0x41, 0x49, 0x01]);
                yield (0, (_fsExtraP || _load_fsExtraP()).write)(fd, magicData, 0, magicData.length, 8);
            } finally {
                yield (0, (_fsExtraP || _load_fsExtraP()).close)(fd);
            }
            yield (0, (_fsExtraP || _load_fsExtraP()).chmod)(resultFile, "0755");
            packager.dispatchArtifactCreated(resultFile, _this);
        })();
    }
}
exports.default = AppImageTarget; //# sourceMappingURL=appImage.js.map