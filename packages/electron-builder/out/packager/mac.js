"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createApp = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

let createApp = exports.createApp = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (packager, appOutDir) {
        const appInfo = packager.appInfo;
        const appFilename = appInfo.productFilename;
        const contentsPath = _path.join(appOutDir, "Electron.app", "Contents");
        const frameworksPath = _path.join(contentsPath, "Frameworks");
        const appPlistFilename = _path.join(contentsPath, "Info.plist");
        const helperPlistFilename = _path.join(frameworksPath, "Electron Helper.app", "Contents", "Info.plist");
        const helperEHPlistFilename = _path.join(frameworksPath, "Electron Helper EH.app", "Contents", "Info.plist");
        const helperNPPlistFilename = _path.join(frameworksPath, "Electron Helper NP.app", "Contents", "Info.plist");
        const buildMetadata = packager.config;
        const fileContents = yield (_bluebirdLst2 || _load_bluebirdLst2()).default.map([appPlistFilename, helperPlistFilename, helperEHPlistFilename, helperNPPlistFilename, buildMetadata["extend-info"]], function (it) {
            return it == null ? it : (0, (_fsExtraP || _load_fsExtraP()).readFile)(it, "utf8");
        });
        const appPlist = (0, (_plist || _load_plist()).parse)(fileContents[0]);
        const helperPlist = (0, (_plist || _load_plist()).parse)(fileContents[1]);
        const helperEHPlist = (0, (_plist || _load_plist()).parse)(fileContents[2]);
        const helperNPPlist = (0, (_plist || _load_plist()).parse)(fileContents[3]);
        // If an extend-info file was supplied, copy its contents in first
        if (fileContents[4] != null) {
            Object.assign(appPlist, (0, (_plist || _load_plist()).parse)(fileContents[4]));
        }
        const macOptions = buildMetadata.mac;
        if (macOptions != null && macOptions.extendInfo != null) {
            Object.assign(appPlist, macOptions.extendInfo);
        }
        const appBundleIdentifier = filterCFBundleIdentifier(appInfo.id);
        const oldHelperBundleId = buildMetadata["helper-bundle-id"];
        if (oldHelperBundleId != null) {
            (0, (_log || _load_log()).warn)("build.helper-bundle-id is deprecated, please set as build.mac.helperBundleId");
        }
        const helperBundleIdentifier = filterCFBundleIdentifier(packager.platformSpecificBuildOptions.helperBundleId || oldHelperBundleId || `${appBundleIdentifier}.helper`);
        const icon = yield packager.getIconPath();
        const oldIcon = appPlist.CFBundleIconFile;
        if (icon != null) {
            appPlist.CFBundleIconFile = `${appFilename}.icns`;
        }
        appPlist.CFBundleDisplayName = appInfo.productName;
        appPlist.CFBundleIdentifier = appBundleIdentifier;
        appPlist.CFBundleName = appInfo.productName;
        // https://github.com/electron-userland/electron-builder/issues/1278
        appPlist.CFBundleExecutable = !appFilename.endsWith(" Helper") ? appFilename : appFilename.substring(0, appFilename.length - " Helper".length);
        helperPlist.CFBundleExecutable = `${appFilename} Helper`;
        helperEHPlist.CFBundleExecutable = `${appFilename} Helper EH`;
        helperNPPlist.CFBundleExecutable = `${appFilename} Helper NP`;
        helperPlist.CFBundleDisplayName = `${appInfo.productName} Helper`;
        helperEHPlist.CFBundleDisplayName = `${appInfo.productName} Helper EH`;
        helperNPPlist.CFBundleDisplayName = `${appInfo.productName} Helper NP`;
        helperPlist.CFBundleIdentifier = helperBundleIdentifier;
        helperEHPlist.CFBundleIdentifier = `${helperBundleIdentifier}.EH`;
        helperNPPlist.CFBundleIdentifier = `${helperBundleIdentifier}.NP`;
        appPlist.CFBundleShortVersionString = appInfo.version;
        appPlist.CFBundleVersion = appInfo.buildVersion;
        const protocols = (0, (_electronBuilderUtil || _load_electronBuilderUtil()).asArray)(buildMetadata.protocols).concat((0, (_electronBuilderUtil || _load_electronBuilderUtil()).asArray)(packager.platformSpecificBuildOptions.protocols));
        if (protocols.length > 0) {
            appPlist.CFBundleURLTypes = protocols.map(function (protocol) {
                const schemes = (0, (_electronBuilderUtil || _load_electronBuilderUtil()).asArray)(protocol.schemes);
                if (schemes.length === 0) {
                    throw new Error(`Protocol "${protocol.name}": must be at least one scheme specified`);
                }
                return {
                    CFBundleURLName: protocol.name,
                    CFBundleTypeRole: protocol.role || "Editor",
                    CFBundleURLSchemes: schemes.slice()
                };
            });
        }
        const resourcesPath = _path.join(contentsPath, "Resources");
        const fileAssociations = packager.fileAssociations;
        if (fileAssociations.length > 0) {
            appPlist.CFBundleDocumentTypes = yield (_bluebirdLst2 || _load_bluebirdLst2()).default.map(fileAssociations, (() => {
                var _ref2 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (fileAssociation) {
                    const extensions = (0, (_electronBuilderUtil || _load_electronBuilderUtil()).asArray)(fileAssociation.ext).map((_platformPackager || _load_platformPackager()).normalizeExt);
                    const customIcon = yield packager.getResource((0, (_electronBuilderUtil || _load_electronBuilderUtil()).getPlatformIconFileName)(fileAssociation.icon, true), `${extensions[0]}.icns`);
                    let iconFile = appPlist.CFBundleIconFile;
                    if (customIcon != null) {
                        iconFile = _path.basename(customIcon);
                        yield (0, (_fs || _load_fs()).copyFile)(customIcon, _path.join(resourcesPath, iconFile));
                    }
                    const result = {
                        CFBundleTypeExtensions: extensions,
                        CFBundleTypeName: fileAssociation.name || extensions[0],
                        CFBundleTypeRole: fileAssociation.role || "Editor",
                        CFBundleTypeIconFile: iconFile
                    };
                    if (fileAssociation.isPackage) {
                        result.LSTypeIsPackage = true;
                    }
                    return result;
                });

                return function (_x3) {
                    return _ref2.apply(this, arguments);
                };
            })());
        }
        (0, (_electronBuilderUtil || _load_electronBuilderUtil()).use)(packager.platformSpecificBuildOptions.category || buildMetadata.category, function (it) {
            return appPlist.LSApplicationCategoryType = it;
        });
        appPlist.NSHumanReadableCopyright = appInfo.copyright;
        const promises = [(0, (_fsExtraP || _load_fsExtraP()).writeFile)(appPlistFilename, (0, (_plist || _load_plist()).build)(appPlist)), (0, (_fsExtraP || _load_fsExtraP()).writeFile)(helperPlistFilename, (0, (_plist || _load_plist()).build)(helperPlist)), (0, (_fsExtraP || _load_fsExtraP()).writeFile)(helperEHPlistFilename, (0, (_plist || _load_plist()).build)(helperEHPlist)), (0, (_fsExtraP || _load_fsExtraP()).writeFile)(helperNPPlistFilename, (0, (_plist || _load_plist()).build)(helperNPPlist)), doRename(_path.join(contentsPath, "MacOS"), "Electron", appPlist.CFBundleExecutable), (0, (_fs || _load_fs()).unlinkIfExists)(_path.join(appOutDir, "LICENSE")), (0, (_fs || _load_fs()).unlinkIfExists)(_path.join(appOutDir, "LICENSES.chromium.html"))];
        if (icon != null) {
            promises.push((0, (_fsExtraP || _load_fsExtraP()).unlink)(_path.join(resourcesPath, oldIcon)));
            promises.push((0, (_fsExtraP || _load_fsExtraP()).copy)(icon, _path.join(resourcesPath, appPlist.CFBundleIconFile)));
        }
        yield (_bluebirdLst2 || _load_bluebirdLst2()).default.all(promises);
        yield moveHelpers(frameworksPath, appFilename);
        const appPath = _path.join(appOutDir, `${appFilename}.app`);
        yield (0, (_fsExtraP || _load_fsExtraP()).rename)(_path.dirname(contentsPath), appPath);
        // https://github.com/electron-userland/electron-builder/issues/840
        const now = Date.now() / 1000;
        yield (0, (_fsExtraP || _load_fsExtraP()).utimes)(appPath, now, now);
    });

    return function createApp(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();
//# sourceMappingURL=mac.js.map


exports.filterCFBundleIdentifier = filterCFBundleIdentifier;

var _electronBuilderUtil;

function _load_electronBuilderUtil() {
    return _electronBuilderUtil = require("electron-builder-util");
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

var _plist;

function _load_plist() {
    return _plist = require("plist");
}

var _platformPackager;

function _load_platformPackager() {
    return _platformPackager = require("../platformPackager");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function doRename(basePath, oldName, newName) {
    return (0, (_fsExtraP || _load_fsExtraP()).rename)(_path.join(basePath, oldName), _path.join(basePath, newName));
}
function moveHelpers(frameworksPath, appName) {
    return (_bluebirdLst2 || _load_bluebirdLst2()).default.map([" Helper", " Helper EH", " Helper NP"], suffix => {
        const executableBasePath = _path.join(frameworksPath, `Electron${suffix}.app`, "Contents", "MacOS");
        return doRename(executableBasePath, `Electron${suffix}`, appName + suffix).then(() => doRename(frameworksPath, `Electron${suffix}.app`, `${appName}${suffix}.app`));
    });
}
function filterCFBundleIdentifier(identifier) {
    // Remove special characters and allow only alphanumeric (A-Z,a-z,0-9), hyphen (-), and period (.)
    // Apple documentation: https://developer.apple.com/library/mac/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html#//apple_ref/doc/uid/20001431-102070
    return identifier.replace(/ /g, "-").replace(/[^a-zA-Z0-9.-]/g, "");
}