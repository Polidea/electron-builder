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

var _log;

function _load_log() {
    return _log = require("electron-builder-util/out/log");
}

var _electronMacosSign;

function _load_electronMacosSign() {
    return _electronMacosSign = require("electron-macos-sign");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _path = _interopRequireWildcard(require("path"));

var _appInfo;

function _load_appInfo() {
    return _appInfo = require("./appInfo");
}

var _codeSign;

function _load_codeSign() {
    return _codeSign = require("./codeSign");
}

var _platformPackager;

function _load_platformPackager() {
    return _platformPackager = require("./platformPackager");
}

var _dmg;

function _load_dmg() {
    return _dmg = require("./targets/dmg");
}

var _pkg;

function _load_pkg() {
    return _pkg = require("./targets/pkg");
}

var _targetFactory;

function _load_targetFactory() {
    return _targetFactory = require("./targets/targetFactory");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MacPackager extends (_platformPackager || _load_platformPackager()).PlatformPackager {
    constructor(info) {
        super(info);
        if (this.packagerOptions.cscLink == null || process.platform !== "darwin") {
            this.codeSigningInfo = (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve(Object.create(null));
        } else {
            this.codeSigningInfo = (0, (_codeSign || _load_codeSign()).createKeychain)(info.tempDirManager, this.packagerOptions.cscLink, this.getCscPassword(), this.packagerOptions.cscInstallerLink, this.packagerOptions.cscInstallerKeyPassword);
        }
    }
    get defaultTarget() {
        return ["zip", "dmg"];
    }
    prepareAppInfo(appInfo) {
        return new (_appInfo || _load_appInfo()).AppInfo(appInfo.metadata, this.info, this.platformSpecificBuildOptions.bundleVersion);
    }
    getIconPath() {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            let iconPath = _this.platformSpecificBuildOptions.icon || _this.config.icon;
            if (iconPath != null && !iconPath.endsWith(".icns")) {
                iconPath += ".icns";
            }
            return iconPath == null ? yield _this.getDefaultIcon("icns") : yield _this.getResource(iconPath);
        })();
    }
    createTargets(targets, mapper, cleanupTasks) {
        for (const name of targets) {
            switch (name) {
                case (_electronBuilderCore || _load_electronBuilderCore()).DIR_TARGET:
                    break;
                case "dmg":
                    mapper("dmg", outDir => new (_dmg || _load_dmg()).DmgTarget(this, outDir));
                    break;
                case "pkg":
                    mapper("pkg", outDir => new (_pkg || _load_pkg()).PkgTarget(this, outDir));
                    break;
                default:
                    mapper(name, outDir => name === "mas" || name === "mas-dev" ? new (_targetFactory || _load_targetFactory()).NoOpTarget(name) : (0, (_targetFactory || _load_targetFactory()).createCommonTarget)(name, _path.join(outDir, "mac"), this));
                    break;
            }
        }
    }
    get platform() {
        return (_electronBuilderCore || _load_electronBuilderCore()).Platform.MAC;
    }
    pack(outDir, arch, targets, postAsyncTasks) {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            let nonMasPromise = null;
            const hasMas = targets.length !== 0 && targets.some(function (it) {
                return it.name === "mas" || it.name === "mas-dev";
            });
            const prepackaged = _this2.info.prepackaged;
            if (!hasMas || targets.length > 1) {
                const appPath = prepackaged == null ? _path.join(_this2.computeAppOutDir(outDir, arch), `${_this2.appInfo.productFilename}.app`) : prepackaged;
                nonMasPromise = (prepackaged ? (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve() : _this2.doPack(outDir, _path.dirname(appPath), _this2.platform.nodeName, arch, _this2.platformSpecificBuildOptions, targets)).then(function () {
                    return _this2.sign(appPath, null, null);
                }).then(function () {
                    return _this2.packageInDistributableFormat(appPath, (_electronBuilderCore || _load_electronBuilderCore()).Arch.x64, targets, postAsyncTasks);
                });
            }
            for (const target of targets) {
                const targetName = target.name;
                if (!(targetName === "mas" || targetName === "mas-dev")) {
                    continue;
                }
                const masBuildOptions = (0, (_deepAssign || _load_deepAssign()).deepAssign)({}, _this2.platformSpecificBuildOptions, _this2.config.mas);
                if (targetName === "mas-dev") {
                    (0, (_deepAssign || _load_deepAssign()).deepAssign)(masBuildOptions, _this2.config[targetName]);
                    masBuildOptions.type = "development";
                }
                const targetOutDir = _path.join(outDir, targetName);
                if (prepackaged == null) {
                    yield _this2.doPack(outDir, targetOutDir, "mas", arch, masBuildOptions, [target]);
                    yield _this2.sign(_path.join(targetOutDir, `${_this2.appInfo.productFilename}.app`), targetOutDir, masBuildOptions);
                } else {
                    yield _this2.sign(prepackaged, targetOutDir, masBuildOptions);
                }
            }
            if (nonMasPromise != null) {
                yield nonMasPromise;
            }
        })();
    }
    sign(appPath, outDir, masOptions) {
        var _this3 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            if (process.platform !== "darwin") {
                (0, (_log || _load_log()).warn)("macOS application code signing is supported only on macOS, skipping.");
                return;
            }
            const keychainName = (yield _this3.codeSigningInfo).keychainName;
            const isMas = masOptions != null;
            const qualifier = _this3.platformSpecificBuildOptions.identity;
            if (!isMas && qualifier === null) {
                if (_this3.forceCodeSigning) {
                    throw new Error("identity explicitly is set to null, but forceCodeSigning is set to true");
                }
                (0, (_log || _load_log()).log)("identity explicitly is set to null, skipping macOS application code signing.");
                return;
            }
            const masQualifier = isMas ? masOptions.identity || qualifier : null;
            const explicitType = masOptions == null ? _this3.platformSpecificBuildOptions.type : masOptions.type;
            const type = explicitType || "distribution";
            const isDevelopment = type === "development";
            let name = yield (0, (_codeSign || _load_codeSign()).findIdentity)(isDevelopment ? "Mac Developer" : isMas ? "3rd Party Mac Developer Application" : "Developer ID Application", isMas ? masQualifier : qualifier, keychainName);
            if (name == null) {
                if (!isMas && !isDevelopment && explicitType !== "distribution") {
                    name = yield (0, (_codeSign || _load_codeSign()).findIdentity)("Mac Developer", qualifier, keychainName);
                    if (name != null) {
                        (0, (_log || _load_log()).warn)("Mac Developer is used to sign app — it is only for development and testing, not for production");
                    } else if (qualifier != null) {
                        throw new Error(`Identity name "${qualifier}" is specified, but no valid identity with this name in the keychain`);
                    }
                }
                if (name == null) {
                    const message = process.env.CSC_IDENTITY_AUTO_DISCOVERY === "false" ? `App is not signed: env CSC_IDENTITY_AUTO_DISCOVERY is set to false` : `App is not signed: cannot find valid ${isMas ? '"3rd Party Mac Developer Application" identity' : `"Developer ID Application" identity or custom non-Apple code signing certificate`}, see https://github.com/electron-userland/electron-builder/wiki/Code-Signing`;
                    if (isMas || _this3.forceCodeSigning) {
                        throw new Error(message);
                    } else {
                        (0, (_log || _load_log()).warn)(message);
                        return;
                    }
                }
            }
            const signOptions = {
                skipIdentityValidation: true,
                identity: name,
                type: type,
                platform: isMas ? "mas" : "darwin",
                version: _this3.info.electronVersion,
                app: appPath,
                keychain: keychainName || undefined,
                "gatekeeper-assess": (_codeSign || _load_codeSign()).appleCertificatePrefixes.find(function (it) {
                    return name.startsWith(it);
                }) != null
            };
            const resourceList = yield _this3.resourceList;
            if (resourceList.indexOf(`entitlements.osx.plist`) !== -1) {
                throw new Error("entitlements.osx.plist is deprecated name, please use entitlements.mac.plist");
            }
            if (resourceList.indexOf(`entitlements.osx.inherit.plist`) !== -1) {
                throw new Error("entitlements.osx.inherit.plist is deprecated name, please use entitlements.mac.inherit.plist");
            }
            const customSignOptions = masOptions || _this3.platformSpecificBuildOptions;
            if (customSignOptions.entitlements == null) {
                const p = `entitlements.${isMas ? "mas" : "mac"}.plist`;
                if (resourceList.indexOf(p) !== -1) {
                    signOptions.entitlements = _path.join(_this3.buildResourcesDir, p);
                }
            } else {
                signOptions.entitlements = customSignOptions.entitlements;
            }
            if (customSignOptions.entitlementsInherit == null) {
                const p = `entitlements.${isMas ? "mas" : "mac"}.inherit.plist`;
                if (resourceList.indexOf(p) !== -1) {
                    signOptions["entitlements-inherit"] = _path.join(_this3.buildResourcesDir, p);
                }
            } else {
                signOptions["entitlements-inherit"] = customSignOptions.entitlementsInherit;
            }
            yield (0, (_log || _load_log()).task)(`Signing app (identity: ${name})`, _this3.doSign(signOptions));
            if (masOptions != null) {
                const certType = "3rd Party Mac Developer Installer";
                const masInstallerIdentity = yield (0, (_codeSign || _load_codeSign()).findIdentity)(certType, masOptions.identity, keychainName);
                if (masInstallerIdentity == null) {
                    throw new Error(`Cannot find valid "${certType}" identity to sign MAS installer, please see https://github.com/electron-userland/electron-builder/wiki/Code-Signing`);
                }
                const pkg = _path.join(outDir, _this3.expandArtifactNamePattern(masOptions, "pkg"));
                yield _this3.doFlat(appPath, pkg, masInstallerIdentity, keychainName);
                _this3.dispatchArtifactCreated(pkg, null, `${_this3.appInfo.name}-${_this3.appInfo.version}.pkg`);
            }
        })();
    }
    //noinspection JSMethodCanBeStatic
    doSign(opts) {
        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            return (0, (_electronMacosSign || _load_electronMacosSign()).signAsync)(opts);
        })();
    }
    //noinspection JSMethodCanBeStatic
    doFlat(appPath, outFile, identity, keychain) {
        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            // productbuild doesn't created directory for out file
            yield (0, (_fsExtraP || _load_fsExtraP()).ensureDir)(_path.dirname(outFile));
            const args = (0, (_pkg || _load_pkg()).prepareProductBuildArgs)(identity, keychain);
            args.push("--component", appPath, "/Applications");
            args.push(outFile);
            return yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("productbuild", args);
        })();
    }
}
exports.default = MacPackager; //# sourceMappingURL=macPackager.js.map