"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _electronBuilderCore;

function _load_electronBuilderCore() {
    return _electronBuilderCore = require("electron-builder-core");
}

var _binDownload;

function _load_binDownload() {
    return _binDownload = require("electron-builder-util/out/binDownload");
}

var _log;

function _load_log() {
    return _log = require("electron-builder-util/out/log");
}

var _path = _interopRequireWildcard(require("path"));

var _squirrelPack;

function _load_squirrelPack() {
    return _squirrelPack = require("./squirrelPack");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const SW_VERSION = "1.5.2.0";
//noinspection SpellCheckingInspection
const SW_SHA2 = "e96a109d4641ebb85d163eaefe7770b165ebc25d1cc77c5179f021b232fc3730";
class SquirrelWindowsTarget extends (_electronBuilderCore || _load_electronBuilderCore()).Target {
    constructor(packager, outDir) {
        super("squirrel");
        this.packager = packager;
        this.outDir = outDir;
        this.options = Object.assign({}, this.packager.platformSpecificBuildOptions, this.packager.config.squirrelWindows);
    }
    build(appOutDir, arch) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            (0, (_log || _load_log()).log)(`Building Squirrel.Windows for arch ${(_electronBuilderCore || _load_electronBuilderCore()).Arch[arch]}`);
            if (arch === (_electronBuilderCore || _load_electronBuilderCore()).Arch.ia32) {
                (0, (_log || _load_log()).warn)("For windows consider only distributing 64-bit or use nsis target, see https://github.com/electron-userland/electron-builder/issues/359#issuecomment-214851130");
            }
            const packager = _this.packager;
            const appInfo = packager.appInfo;
            const version = appInfo.version;
            const archSuffix = (0, (_electronBuilderCore || _load_electronBuilderCore()).getArchSuffix)(arch);
            const setupFileName = `${appInfo.productFilename} Setup ${version}${archSuffix}.exe`;
            const installerOutDir = _path.join(_this.outDir, `win${(0, (_electronBuilderCore || _load_electronBuilderCore()).getArchSuffix)(arch)}`);
            const distOptions = yield _this.computeEffectiveDistOptions();
            yield (0, (_squirrelPack || _load_squirrelPack()).buildInstaller)(distOptions, installerOutDir, setupFileName, packager, appOutDir);
            packager.dispatchArtifactCreated(_path.join(installerOutDir, setupFileName), _this, `${appInfo.name}-Setup-${version}${archSuffix}.exe`);
            const packagePrefix = `${appInfo.name}-${(0, (_squirrelPack || _load_squirrelPack()).convertVersion)(version)}-`;
            packager.dispatchArtifactCreated(_path.join(installerOutDir, `${packagePrefix}full.nupkg`), _this);
            if (distOptions.remoteReleases != null) {
                packager.dispatchArtifactCreated(_path.join(installerOutDir, `${packagePrefix}delta.nupkg`), _this);
            }
            packager.dispatchArtifactCreated(_path.join(installerOutDir, "RELEASES"), _this);
        })();
    }
    computeEffectiveDistOptions() {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const packager = _this2.packager;
            let iconUrl = _this2.options.iconUrl || packager.config.iconUrl;
            if (iconUrl == null) {
                const info = yield packager.info.repositoryInfo;
                if (info != null) {
                    iconUrl = `https://github.com/${info.user}/${info.project}/blob/master/${packager.relativeBuildResourcesDirname}/icon.ico?raw=true`;
                }
                if (iconUrl == null) {
                    throw new Error("iconUrl is not specified, please see https://github.com/electron-userland/electron-builder/wiki/Options#WinBuildOptions-iconUrl");
                }
            }
            checkConflictingOptions(_this2.options);
            const appInfo = packager.appInfo;
            const projectUrl = yield appInfo.computePackageUrl();
            const options = Object.assign({
                name: appInfo.name,
                productName: appInfo.productName,
                appId: _this2.options.useAppIdAsId ? appInfo.id : appInfo.name,
                version: appInfo.version,
                description: appInfo.description,
                authors: appInfo.companyName,
                iconUrl: iconUrl,
                extraMetadataSpecs: projectUrl == null ? null : `\n    <projectUrl>${projectUrl}</projectUrl>`,
                copyright: appInfo.copyright,
                packageCompressionLevel: parseInt(process.env.ELECTRON_BUILDER_COMPRESSION_LEVEL) || (packager.config.compression === "store" ? 0 : 9),
                vendorPath: yield (0, (_binDownload || _load_binDownload()).getBinFromBintray)("Squirrel.Windows", SW_VERSION, SW_SHA2)
            }, _this2.options);
            if (options.remoteToken == null) {
                options.remoteToken = process.env.GH_TOKEN;
            }
            if (!("loadingGif" in options)) {
                const resourceList = yield packager.resourceList;
                if (resourceList.indexOf("install-spinner.gif") !== -1) {
                    options.loadingGif = _path.join(packager.buildResourcesDir, "install-spinner.gif");
                }
            }
            if (options.remoteReleases === true) {
                const info = yield packager.info.repositoryInfo;
                if (info == null) {
                    (0, (_log || _load_log()).warn)("remoteReleases set to true, but cannot get repository info");
                } else {
                    options.remoteReleases = `https://github.com/${info.user}/${info.project}`;
                    (0, (_log || _load_log()).log)(`remoteReleases is set to ${options.remoteReleases}`);
                }
            }
            return options;
        })();
    }
}
exports.default = SquirrelWindowsTarget;
function checkConflictingOptions(options) {
    for (const name of ["outputDirectory", "appDirectory", "exe", "fixUpPaths", "usePackageJson", "extraFileSpecs", "extraMetadataSpecs", "skipUpdateIcon", "setupExe"]) {
        if (name in options) {
            throw new Error(`Option ${name} is ignored, do not specify it.`);
        }
    }
    if ("noMsi" in options) {
        (0, (_log || _load_log()).warn)(`noMsi is deprecated, please specify as "msi": true if you want to create an MSI installer`);
        options.msi = !options.noMsi;
    }
    const msi = options.msi;
    if (msi != null && typeof msi !== "boolean") {
        throw new Error(`msi expected to be boolean value, but string '"${msi}"' was specified`);
    }
}
//# sourceMappingURL=squirrelWindows.js.map