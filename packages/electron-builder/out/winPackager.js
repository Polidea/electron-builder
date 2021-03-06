"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.WinPackager = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

let checkIcon = (() => {
    var _ref2 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (file) {
        const fd = yield (0, (_fsExtraP || _load_fsExtraP()).open)(file, "r");
        const buffer = new Buffer(512);
        try {
            yield (0, (_fsExtraP || _load_fsExtraP()).read)(fd, buffer, 0, buffer.length, 0);
        } finally {
            yield (0, (_fsExtraP || _load_fsExtraP()).close)(fd);
        }
        if (!isIco(buffer)) {
            throw new Error(`Windows icon is not valid ico file, please fix "${file}"`);
        }
        const sizes = parseIco(buffer);
        for (const size of sizes) {
            if (size.w >= 256 && size.h >= 256) {
                return;
            }
        }
        throw new Error(`Windows icon size must be at least 256x256, please fix "${file}"`);
    });

    return function checkIcon(_x) {
        return _ref2.apply(this, arguments);
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

var _log;

function _load_log() {
    return _log = require("electron-builder-util/out/log");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _nodeForge;

function _load_nodeForge() {
    return _nodeForge = _interopRequireWildcard(require("node-forge"));
}

var _path = _interopRequireWildcard(require("path"));

var _codeSign;

function _load_codeSign() {
    return _codeSign = require("./codeSign");
}

var _platformPackager;

function _load_platformPackager() {
    return _platformPackager = require("./platformPackager");
}

var _targetFactory;

function _load_targetFactory() {
    return _targetFactory = require("./targets/targetFactory");
}

var _windowsCodeSign;

function _load_windowsCodeSign() {
    return _windowsCodeSign = require("./windowsCodeSign");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WinPackager extends (_platformPackager || _load_platformPackager()).PlatformPackager {
    constructor(info) {
        var _this;

        _this = super(info);
        this.cscInfo = new (_electronBuilderUtil || _load_electronBuilderUtil()).Lazy(() => {
            const platformSpecificBuildOptions = this.platformSpecificBuildOptions;
            const subjectName = platformSpecificBuildOptions.certificateSubjectName;
            if (subjectName != null) {
                return (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve({ subjectName });
            }
            const certificateSha1 = platformSpecificBuildOptions.certificateSha1;
            if (certificateSha1 != null) {
                return (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve({ certificateSha1 });
            }
            const certificateFile = platformSpecificBuildOptions.certificateFile;
            if (certificateFile != null) {
                const certificatePassword = this.getCscPassword();
                return (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve({
                    file: certificateFile,
                    password: certificatePassword == null ? null : certificatePassword.trim()
                });
            } else {
                const cscLink = process.env.WIN_CSC_LINK || this.packagerOptions.cscLink;
                if (cscLink != null) {
                    return (0, (_codeSign || _load_codeSign()).downloadCertificate)(cscLink, this.info.tempDirManager).then(path => {
                        return {
                            file: path,
                            password: this.getCscPassword()
                        };
                    });
                } else {
                    return (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve(null);
                }
            }
        });
        this.computedPublisherName = new (_electronBuilderUtil || _load_electronBuilderUtil()).Lazy((0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            let publisherName = _this.platformSpecificBuildOptions.publisherName;
            if (publisherName === null) {
                return null;
            }
            const cscInfo = yield _this.cscInfo.value;
            if (cscInfo == null) {
                return null;
            }
            if (publisherName == null && cscInfo.file != null) {
                try {
                    // https://github.com/digitalbazaar/forge/issues/338#issuecomment-164831585
                    const p12Asn1 = (_nodeForge || _load_nodeForge()).asn1.fromDer((yield (0, (_fsExtraP || _load_fsExtraP()).readFile)(cscInfo.file, "binary")), false);
                    const p12 = (_nodeForge || _load_nodeForge()).pkcs12.pkcs12FromAsn1(p12Asn1, false, cscInfo.password);
                    const bagType = (_nodeForge || _load_nodeForge()).pki.oids.certBag;
                    publisherName = p12.getBags({ bagType: bagType })[bagType][0].cert.subject.getField("CN").value;
                } catch (e) {
                    throw new Error(`Cannot extract publisher name from code signing certificate, please file issue. As workaround, set win.publisherName: ${e.stack || e}`);
                }
            }
            return publisherName == null ? null : (0, (_electronBuilderUtil || _load_electronBuilderUtil()).asArray)(publisherName);
        }));
    }
    get defaultTarget() {
        return ["nsis"];
    }
    doGetCscPassword() {
        return this.platformSpecificBuildOptions.certificatePassword || process.env.WIN_CSC_KEY_PASSWORD || super.doGetCscPassword();
    }
    createTargets(targets, mapper, cleanupTasks) {
        for (const name of targets) {
            if (name === (_electronBuilderCore || _load_electronBuilderCore()).DIR_TARGET) {
                continue;
            }
            const targetClass = (() => {
                switch (name) {
                    case "nsis":
                    case "portable":
                        return require("./targets/nsis").default;
                    case "nsis-web":
                        return require("./targets/WebInstaller").default;
                    case "squirrel":
                        try {
                            return require("electron-builder-squirrel-windows").default;
                        } catch (e) {
                            throw new Error(`Module electron-builder-squirrel-windows must be installed in addition to build Squirrel.Windows: ${e.stack || e}`);
                        }
                    case "appx":
                        return require("./targets/appx").default;
                    default:
                        return null;
                }
            })();
            mapper(name, outDir => targetClass === null ? (0, (_targetFactory || _load_targetFactory()).createCommonTarget)(name, outDir, this) : new targetClass(this, outDir, name));
        }
    }
    get platform() {
        return (_electronBuilderCore || _load_electronBuilderCore()).Platform.WINDOWS;
    }
    getIconPath() {
        if (this.iconPath == null) {
            this.iconPath = this.getValidIconPath();
        }
        return this.iconPath;
    }
    getValidIconPath() {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            let iconPath = _this2.platformSpecificBuildOptions.icon || _this2.config.icon;
            if (iconPath != null && !iconPath.endsWith(".ico")) {
                iconPath += ".ico";
            }
            iconPath = iconPath == null ? yield _this2.getDefaultIcon("ico") : _path.resolve(_this2.projectDir, iconPath);
            if (iconPath == null) {
                return null;
            }
            yield checkIcon(iconPath);
            return iconPath;
        })();
    }
    sign(file, logMessagePrefix) {
        var _this3 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const cscInfo = yield _this3.cscInfo.value;
            if (cscInfo == null) {
                if (_this3.forceCodeSigning) {
                    throw new Error(`App is not signed and "forceCodeSigning" is set to true, please ensure that code signing configuration is correct, please see https://github.com/electron-userland/electron-builder/wiki/Code-Signing`);
                }
                return;
            }
            const certFile = cscInfo.file;
            if (logMessagePrefix == null) {
                logMessagePrefix = `Signing ${_path.basename(file)}`;
            }
            if (certFile == null) {
                if (cscInfo.subjectName == null) {
                    (0, (_log || _load_log()).log)(`${logMessagePrefix} (certificate SHA1: "${cscInfo.certificateSha1}")`);
                } else {
                    (0, (_log || _load_log()).log)(`${logMessagePrefix} (certificate subject name: "${cscInfo.subjectName}")`);
                }
            } else {
                (0, (_log || _load_log()).log)(`${logMessagePrefix} (certificate file: "${certFile}")`);
            }
            yield _this3.doSign({
                path: file,
                cert: certFile,
                password: cscInfo.password,
                name: _this3.appInfo.productName,
                site: yield _this3.appInfo.computePackageUrl(),
                options: Object.assign({}, _this3.platformSpecificBuildOptions, {
                    certificateSubjectName: cscInfo.subjectName,
                    certificateSha1: cscInfo.certificateSha1
                })
            });
        })();
    }
    //noinspection JSMethodCanBeStatic
    doSign(options) {
        return (0, (_windowsCodeSign || _load_windowsCodeSign()).sign)(options);
    }
    signAndEditResources(file) {
        var _this4 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const appInfo = _this4.appInfo;
            const args = [file, "--set-version-string", "CompanyName", appInfo.companyName, "--set-version-string", "FileDescription", appInfo.productName, "--set-version-string", "ProductName", appInfo.productName, "--set-version-string", "InternalName", _path.basename(appInfo.productFilename, ".exe"), "--set-version-string", "LegalCopyright", appInfo.copyright, "--set-version-string", "OriginalFilename", "", "--set-file-version", appInfo.buildVersion, "--set-product-version", appInfo.versionInWeirdWindowsForm];
            (0, (_electronBuilderUtil || _load_electronBuilderUtil()).use)(_this4.platformSpecificBuildOptions.legalTrademarks, function (it) {
                return args.push("--set-version-string", "LegalTrademarks", it);
            });
            (0, (_electronBuilderUtil || _load_electronBuilderUtil()).use)((yield _this4.getIconPath()), function (it) {
                return args.push("--set-icon", it);
            });
            const rceditExecutable = _path.join((yield (0, (_windowsCodeSign || _load_windowsCodeSign()).getSignVendorPath)()), "rcedit.exe");
            const isWin = process.platform === "win32";
            if (!isWin) {
                args.unshift(rceditExecutable);
            }
            yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)(isWin ? rceditExecutable : "wine", args);
            yield _this4.sign(file);
        })();
    }
    postInitApp(appOutDir) {
        var _this5 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const executable = _path.join(appOutDir, `${_this5.appInfo.productFilename}.exe`);
            yield (0, (_fsExtraP || _load_fsExtraP()).rename)(_path.join(appOutDir, "electron.exe"), executable);
            yield _this5.signAndEditResources(executable);
        })();
    }
}
exports.WinPackager = WinPackager;

function parseIco(buffer) {
    if (!isIco(buffer)) {
        throw new Error("buffer is not ico");
    }
    const n = buffer.readUInt16LE(4);
    const result = new Array(n);
    for (let i = 0; i < n; i++) {
        result[i] = {
            w: buffer.readUInt8(6 + i * 16) || 256,
            h: buffer.readUInt8(7 + i * 16) || 256
        };
    }
    return result;
}
function isIco(buffer) {
    return buffer.readUInt16LE(0) === 0 && buffer.readUInt16LE(2) === 1;
}
//# sourceMappingURL=winPackager.js.map