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

var _sanitizeFilename;

function _load_sanitizeFilename() {
    return _sanitizeFilename = _interopRequireDefault(require("sanitize-filename"));
}

var _uuid;

function _load_uuid() {
    return _uuid = require("uuid-1345");
}

var _platformPackager;

function _load_platformPackager() {
    return _platformPackager = require("../platformPackager");
}

var _windowsCodeSign;

function _load_windowsCodeSign() {
    return _windowsCodeSign = require("../windowsCodeSign");
}

var _archive;

function _load_archive() {
    return _archive = require("./archive");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ELECTRON_BUILDER_NS_UUID = "50e065bc-3134-11e6-9bab-38c9862bdaf3";
const nsisPathPromise = (0, (_binDownload || _load_binDownload()).getBinFromBintray)("nsis", "3.0.1.10", "302a8adebf0b553f74cddd494154a586719ff9d4767e94d8a76547a9bb06200c");
const nsisResourcePathPromise = (0, (_binDownload || _load_binDownload()).getBinFromBintray)("nsis-resources", "3.0.0", "cde0e77b249e29d74250bf006aa355d3e02b32226e1c6431fb48facae41d8a7e");
const USE_NSIS_BUILT_IN_COMPRESSOR = false;
class NsisTarget extends (_electronBuilderCore || _load_electronBuilderCore()).Target {
    constructor(packager, outDir, targetName) {
        super(targetName);
        this.packager = packager;
        this.outDir = outDir;
        this.archs = new Map();
        this.nsisTemplatesDir = _path.join(__dirname, "..", "..", "templates", "nsis");
        let options = this.packager.config.nsis || Object.create(null);
        if (targetName !== "nsis") {
            options = Object.assign(options, this.packager.config[targetName]);
        }
        this.options = options;
        const deps = packager.info.metadata.dependencies;
        if (deps != null && deps["electron-squirrel-startup"] != null) {
            (0, (_log || _load_log()).warn)('"electron-squirrel-startup" dependency is not required for NSIS');
        }
    }
    build(appOutDir, arch) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            _this.archs.set(arch, appOutDir);
        })();
    }
    buildAppPackage(appOutDir, arch) {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            yield (_bluebirdLst2 || _load_bluebirdLst2()).default.all([(0, (_fs || _load_fs()).copyFile)(_path.join((yield nsisPathPromise), "elevate.exe"), _path.join(appOutDir, "resources", "elevate.exe"), null, false), (0, (_fs || _load_fs()).copyFile)(_path.join((yield (0, (_windowsCodeSign || _load_windowsCodeSign()).getSignVendorPath)()), "windows-10", (_electronBuilderCore || _load_electronBuilderCore()).Arch[arch], "signtool.exe"), _path.join(appOutDir, "resources", "signtool.exe"), null, false)]);
            const packager = _this2.packager;
            const format = _this2.options.useZip ? "zip" : "7z";
            const archiveFile = _path.join(_this2.outDir, `${packager.appInfo.name}-${packager.appInfo.version}-${(_electronBuilderCore || _load_electronBuilderCore()).Arch[arch]}.nsis.${format}`);
            return yield (0, (_archive || _load_archive()).archive)(packager.config.compression, format, archiveFile, appOutDir, true);
        })();
    }
    finishBuild() {
        var _this3 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            (0, (_log || _load_log()).log)("Building NSIS installer");
            const filesToDelete = [];
            try {
                yield _this3.buildInstaller(filesToDelete);
            } finally {
                if (filesToDelete.length > 0) {
                    yield (_bluebirdLst2 || _load_bluebirdLst2()).default.map(filesToDelete, function (it) {
                        return (0, (_fsExtraP || _load_fsExtraP()).unlink)(it);
                    });
                }
            }
        })();
    }
    get installerFilenamePattern() {
        return "${productName} " + (this.isPortable ? "" : "Setup ") + "${version}.${ext}";
    }
    get isPortable() {
        return this.name === "portable";
    }
    buildInstaller(filesToDelete) {
        var _this4 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const isPortable = _this4.isPortable;
            const packager = _this4.packager;
            const appInfo = packager.appInfo;
            const version = appInfo.version;
            const options = _this4.options;
            const installerFilename = packager.expandArtifactNamePattern(options, "exe", null, _this4.installerFilenamePattern);
            const iconPath = (isPortable ? null : yield packager.getResource(options.installerIcon, "installerIcon.ico")) || (yield packager.getIconPath());
            const oneClick = options.oneClick !== false;
            const installerPath = _path.join(_this4.outDir, installerFilename);
            const guid = options.guid || (yield (_bluebirdLst2 || _load_bluebirdLst2()).default.promisify((_uuid || _load_uuid()).v5)({ namespace: ELECTRON_BUILDER_NS_UUID, name: appInfo.id }));
            const defines = {
                APP_ID: appInfo.id,
                APP_GUID: guid,
                PRODUCT_NAME: appInfo.productName,
                PRODUCT_FILENAME: appInfo.productFilename,
                APP_FILENAME: (!oneClick || options.perMachine === true) && /^[-_+0-9a-zA-Z ]+$/.test(appInfo.productFilename) ? appInfo.productFilename : appInfo.name,
                APP_DESCRIPTION: appInfo.description,
                VERSION: version,
                COMPANY_NAME: appInfo.companyName,
                PROJECT_DIR: packager.projectDir,
                BUILD_RESOURCES_DIR: packager.buildResourcesDir
            };
            // electron uses product file name as app data, define it as well to remove on uninstall
            if (defines.APP_FILENAME != appInfo.productFilename) {
                defines.APP_PRODUCT_FILENAME = appInfo.productFilename;
            }
            const commands = {
                OutFile: `"${installerPath}"`,
                VIProductVersion: appInfo.versionInWeirdWindowsForm,
                VIAddVersionKey: _this4.computeVersionKey(),
                Unicode: _this4.isUnicodeEnabled
            };
            if (iconPath != null) {
                if (isPortable) {
                    commands.Icon = iconPath;
                } else {
                    defines.MUI_ICON = iconPath;
                    defines.MUI_UNICON = iconPath;
                }
            }
            if (_this4.archs.size === 1 && USE_NSIS_BUILT_IN_COMPRESSOR) {
                defines.APP_BUILD_DIR = _this4.archs.get(_this4.archs.keys().next().value);
            } else {
                yield (_bluebirdLst2 || _load_bluebirdLst2()).default.map(_this4.archs.keys(), (() => {
                    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (arch) {
                        const file = yield (0, (_log || _load_log()).subTask)(`Packaging NSIS installer for arch ${(_electronBuilderCore || _load_electronBuilderCore()).Arch[arch]}`, _this4.buildAppPackage(_this4.archs.get(arch), arch));
                        defines[arch === (_electronBuilderCore || _load_electronBuilderCore()).Arch.x64 ? "APP_64" : "APP_32"] = file;
                        defines[(arch === (_electronBuilderCore || _load_electronBuilderCore()).Arch.x64 ? "APP_64" : "APP_32") + "_NAME"] = _path.basename(file);
                        if (_this4.isWebInstaller) {
                            packager.dispatchArtifactCreated(file, _this4);
                        } else {
                            filesToDelete.push(file);
                        }
                    });

                    return function (_x) {
                        return _ref.apply(this, arguments);
                    };
                })());
            }
            _this4.configureDefinesForAllTypeOfInstaller(defines);
            if (!isPortable) {
                yield _this4.configureDefines(oneClick, defines);
            }
            if (packager.config.compression === "store") {
                commands.SetCompress = "off";
            } else {
                commands.SetCompressor = "lzma";
                if (!_this4.isWebInstaller) {
                    defines.COMPRESS = "auto";
                }
            }
            (0, (_electronBuilderUtil || _load_electronBuilderUtil()).debug)(defines);
            (0, (_electronBuilderUtil || _load_electronBuilderUtil()).debug)(commands);
            if (packager.packagerOptions.effectiveOptionComputed != null && (yield packager.packagerOptions.effectiveOptionComputed([defines, commands]))) {
                return;
            }
            const script = isPortable ? yield (0, (_fsExtraP || _load_fsExtraP()).readFile)(_path.join(_this4.nsisTemplatesDir, "portable.nsi"), "utf8") : yield _this4.computeScriptAndSignUninstaller(defines, commands, installerPath);
            yield _this4.executeMakensis(defines, commands, (yield _this4.computeFinalScript(script, true)));
            yield packager.sign(installerPath);
            packager.dispatchArtifactCreated(installerPath, _this4, _this4.generateGitHubInstallerName());
        })();
    }
    generateGitHubInstallerName() {
        return `${this.packager.appInfo.name}-${this.isPortable ? "" : "Setup-"}${this.packager.appInfo.version}.exe`;
    }
    get isUnicodeEnabled() {
        return this.options.unicode == null ? true : this.options.unicode;
    }
    get isWebInstaller() {
        return false;
    }
    computeScriptAndSignUninstaller(defines, commands, installerPath) {
        var _this5 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const packager = _this5.packager;
            const customScriptPath = yield packager.getResource(_this5.options.script, "installer.nsi");
            const script = yield (0, (_fsExtraP || _load_fsExtraP()).readFile)(customScriptPath || _path.join(_this5.nsisTemplatesDir, "installer.nsi"), "utf8");
            if (customScriptPath != null) {
                (0, (_log || _load_log()).log)("Custom NSIS script is used - uninstaller is not signed by electron-builder");
                return script;
            }
            const uninstallerPath = yield packager.getTempFile("uninstaller.exe");
            const isWin = process.platform === "win32";
            defines.BUILD_UNINSTALLER = null;
            defines.UNINSTALLER_OUT_FILE = isWin ? uninstallerPath : _path.win32.join("Z:", uninstallerPath);
            yield _this5.executeMakensis(defines, commands, (yield _this5.computeFinalScript(script, false)));
            yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)(isWin ? installerPath : "wine", isWin ? [] : [installerPath]);
            yield packager.sign(uninstallerPath, "  Signing NSIS uninstaller");
            delete defines.BUILD_UNINSTALLER;
            // platform-specific path, not wine
            defines.UNINSTALLER_OUT_FILE = uninstallerPath;
            return script;
        })();
    }
    computeVersionKey() {
        // Error: invalid VIProductVersion format, should be X.X.X.X
        // so, we must strip beta
        const localeId = this.options.language || "1033";
        const appInfo = this.packager.appInfo;
        const versionKey = [`/LANG=${localeId} ProductName "${appInfo.productName}"`, `/LANG=${localeId} ProductVersion "${appInfo.version}"`, `/LANG=${localeId} CompanyName "${appInfo.companyName}"`, `/LANG=${localeId} LegalCopyright "${appInfo.copyright}"`, `/LANG=${localeId} FileDescription "${appInfo.description}"`, `/LANG=${localeId} FileVersion "${appInfo.buildVersion}"`];
        (0, (_electronBuilderUtil || _load_electronBuilderUtil()).use)(this.packager.platformSpecificBuildOptions.legalTrademarks, it => versionKey.push(`/LANG=${localeId} LegalTrademarks "${it}"`));
        return versionKey;
    }
    configureDefines(oneClick, defines) {
        var _this6 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const packager = _this6.packager;
            const options = _this6.options;
            if (oneClick) {
                defines.ONE_CLICK = null;
                if (options.runAfterFinish !== false) {
                    defines.RUN_AFTER_FINISH = null;
                }
                const installerHeaderIcon = yield packager.getResource(options.installerHeaderIcon, "installerHeaderIcon.ico");
                if (installerHeaderIcon != null) {
                    defines.HEADER_ICO = installerHeaderIcon;
                }
            } else {
                const installerHeader = yield packager.getResource(options.installerHeader, "installerHeader.bmp");
                if (installerHeader != null) {
                    defines.MUI_HEADERIMAGE = null;
                    defines.MUI_HEADERIMAGE_RIGHT = null;
                    defines.MUI_HEADERIMAGE_BITMAP = installerHeader;
                }
                const bitmap = (yield packager.getResource(options.installerSidebar, "installerSidebar.bmp")) || "${NSISDIR}\\Contrib\\Graphics\\Wizard\\nsis3-metro.bmp";
                defines.MUI_WELCOMEFINISHPAGE_BITMAP = bitmap;
                defines.MUI_UNWELCOMEFINISHPAGE_BITMAP = (yield packager.getResource(options.uninstallerSidebar, "uninstallerSidebar.bmp")) || bitmap;
                if (options.allowElevation !== false) {
                    defines.MULTIUSER_INSTALLMODE_ALLOW_ELEVATION = null;
                }
            }
            if (options.perMachine === true) {
                defines.INSTALL_MODE_PER_ALL_USERS = null;
            }
            if (!oneClick || options.perMachine === true) {
                defines.INSTALL_MODE_PER_ALL_USERS_REQUIRED = null;
            }
            if (options.allowToChangeInstallationDirectory) {
                if (oneClick) {
                    throw new Error("allowToChangeInstallationDirectory makes sense only for boring installer (please set oneClick to false)");
                }
                defines.allowToChangeInstallationDirectory = null;
            }
            if (options.menuCategory != null) {
                const menu = (0, (_sanitizeFilename || _load_sanitizeFilename()).default)(options.menuCategory === true ? packager.appInfo.companyName : options.menuCategory);
                if (!(0, (_electronBuilderUtil || _load_electronBuilderUtil()).isEmptyOrSpaces)(menu)) {
                    defines.MENU_FILENAME = menu;
                }
            }
            (0, (_electronBuilderUtil || _load_electronBuilderUtil()).use)((yield packager.getResource(options.license, "license.rtf", "license.txt")), function (it) {
                return defines.LICENSE_FILE = it;
            });
            if (options.multiLanguageInstaller == null ? _this6.isUnicodeEnabled : options.multiLanguageInstaller) {
                defines.MULTI_LANGUAGE_INSTALLER = null;
            }
            if (options.deleteAppDataOnUninstall) {
                defines.DELETE_APP_DATA_ON_UNINSTALL = null;
            }
        })();
    }
    configureDefinesForAllTypeOfInstaller(defines) {
        const options = this.options;
        if (!this.isWebInstaller && defines.APP_BUILD_DIR == null) {
            if (options.useZip) {
                defines.ZIP_COMPRESSION = null;
            }
            defines.COMPRESSION_METHOD = options.useZip ? "zip" : "7z";
        }
    }
    executeMakensis(defines, commands, script) {
        var _this7 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const args = _this7.options.warningsAsErrors === false ? [] : ["-WX"];
            for (const name of Object.keys(defines)) {
                const value = defines[name];
                if (value == null) {
                    args.push(`-D${name}`);
                } else {
                    args.push(`-D${name}=${value}`);
                }
            }
            for (const name of Object.keys(commands)) {
                const value = commands[name];
                if (Array.isArray(value)) {
                    for (const c of value) {
                        args.push(`-X${name} ${c}`);
                    }
                } else {
                    args.push(`-X${name} ${value}`);
                }
            }
            args.push("-");
            if ((_electronBuilderUtil || _load_electronBuilderUtil()).debug.enabled) {
                process.stdout.write("\n\nNSIS script:\n\n" + script + "\n\n---\nEnd of NSIS script.\n\n");
            }
            const nsisPath = yield nsisPathPromise;
            yield new (_bluebirdLst2 || _load_bluebirdLst2()).default(function (resolve, reject) {
                const command = _path.join(nsisPath, process.platform === "darwin" ? "mac" : process.platform === "win32" ? "Bin" : "linux", process.platform === "win32" ? "makensis.exe" : "makensis");
                const childProcess = (0, (_electronBuilderUtil || _load_electronBuilderUtil()).doSpawn)(command, args, {
                    // we use NSIS_CONFIG_CONST_DATA_PATH=no to build makensis on Linux, but in any case it doesn't use stubs as MacOS/Windows version, so, we explicitly set NSISDIR
                    env: Object.assign({}, process.env, { NSISDIR: nsisPath }),
                    cwd: _this7.nsisTemplatesDir
                }, true);
                (0, (_electronBuilderUtil || _load_electronBuilderUtil()).handleProcess)("close", childProcess, command, resolve, reject);
                childProcess.stdin.end(script);
            });
        })();
    }
    computeFinalScript(originalScript, isInstaller) {
        var _this8 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const packager = _this8.packager;
            let scriptHeader = `!addincludedir "${_path.win32.join(__dirname, "..", "..", "templates", "nsis", "include")}"\n`;
            const pluginArch = _this8.isUnicodeEnabled ? "x86-unicode" : "x86-ansi";
            scriptHeader += `!addplugindir /${pluginArch} "${_path.join((yield nsisResourcePathPromise), "plugins", pluginArch)}"\n`;
            scriptHeader += `!addplugindir /${pluginArch} "${_path.join(packager.buildResourcesDir, pluginArch)}"\n`;
            if (_this8.isPortable) {
                return scriptHeader + originalScript;
            }
            const customInclude = yield packager.getResource(_this8.options.include, "installer.nsh");
            if (customInclude != null) {
                scriptHeader += `!addincludedir "${packager.buildResourcesDir}"\n`;
                scriptHeader += `!include "${customInclude}"\n\n`;
            }
            const fileAssociations = packager.fileAssociations;
            if (fileAssociations.length !== 0) {
                if (_this8.options.perMachine !== true) {
                    // https://github.com/electron-userland/electron-builder/issues/772
                    throw new Error(`Please set perMachine to true — file associations works on Windows only if installed for all users`);
                }
                scriptHeader += "!include FileAssociation.nsh\n";
                if (isInstaller) {
                    let registerFileAssociationsScript = "";
                    for (const item of fileAssociations) {
                        const extensions = (0, (_electronBuilderUtil || _load_electronBuilderUtil()).asArray)(item.ext).map((_platformPackager || _load_platformPackager()).normalizeExt);
                        for (const ext of extensions) {
                            const customIcon = yield packager.getResource((0, (_electronBuilderUtil || _load_electronBuilderUtil()).getPlatformIconFileName)(item.icon, false), `${extensions[0]}.ico`);
                            let installedIconPath = "$appExe,0";
                            if (customIcon != null) {
                                installedIconPath = `$INSTDIR\\resources\\${_path.basename(customIcon)}`;
                                //noinspection SpellCheckingInspection
                                registerFileAssociationsScript += `  File "/oname=${installedIconPath}" "${customIcon}"\n`;
                            }
                            const icon = `"${installedIconPath}"`;
                            const commandText = `"Open with ${packager.appInfo.productName}"`;
                            const command = '"$appExe $\\"%1$\\""';
                            registerFileAssociationsScript += `  !insertmacro APP_ASSOCIATE "${ext}" "${item.name || ext}" "${item.description || ""}" ${icon} ${commandText} ${command}\n`;
                        }
                    }
                    scriptHeader += `!macro registerFileAssociations\n${registerFileAssociationsScript}!macroend\n`;
                } else {
                    let unregisterFileAssociationsScript = "";
                    for (const item of fileAssociations) {
                        for (const ext of (0, (_electronBuilderUtil || _load_electronBuilderUtil()).asArray)(item.ext)) {
                            unregisterFileAssociationsScript += `  !insertmacro APP_UNASSOCIATE "${(0, (_platformPackager || _load_platformPackager()).normalizeExt)(ext)}" "${item.name || ext}"\n`;
                        }
                    }
                    scriptHeader += `!macro unregisterFileAssociations\n${unregisterFileAssociationsScript}!macroend\n`;
                }
            }
            return scriptHeader + originalScript;
        })();
    }
}
exports.default = NsisTarget; //# sourceMappingURL=nsis.js.map