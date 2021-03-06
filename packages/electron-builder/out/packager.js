"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.checkWineVersion = exports.Packager = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/**
 * @private
 */
let checkWineVersion = exports.checkWineVersion = (() => {
    var _ref5 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (checkPromise) {
        function wineError(prefix) {
            return `${prefix}, please see https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build#${process.platform === "linux" ? "linux" : "macos"}`;
        }
        let wineVersion;
        try {
            wineVersion = (yield checkPromise).trim();
        } catch (e) {
            if (e.code === "ENOENT") {
                throw new Error(wineError("wine is required"));
            } else {
                throw new Error(`Cannot check wine version: ${e}`);
            }
        }
        if (wineVersion.startsWith("wine-")) {
            wineVersion = wineVersion.substring("wine-".length);
        }
        const spaceIndex = wineVersion.indexOf(" ");
        if (spaceIndex > 0) {
            wineVersion = wineVersion.substring(0, spaceIndex);
        }
        const suffixIndex = wineVersion.indexOf("-");
        if (suffixIndex > 0) {
            wineVersion = wineVersion.substring(0, suffixIndex);
        }
        if (wineVersion.split(".").length === 2) {
            wineVersion += ".0";
        }
        if ((0, (_semver || _load_semver()).lt)(wineVersion, "1.8.0")) {
            throw new Error(wineError(`wine 1.8+ is required, but your version is ${wineVersion}`));
        }
    });

    return function checkWineVersion(_x) {
        return _ref5.apply(this, arguments);
    };
})();

exports.normalizePlatforms = normalizePlatforms;

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

var _promise;

function _load_promise() {
    return _promise = require("electron-builder-util/out/promise");
}

var _tmp;

function _load_tmp() {
    return _tmp = require("electron-builder-util/out/tmp");
}

var _events;

function _load_events() {
    return _events = require("events");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _path = _interopRequireWildcard(require("path"));

var _semver;

function _load_semver() {
    return _semver = require("semver");
}

var _appInfo;

function _load_appInfo() {
    return _appInfo = require("./appInfo");
}

var _asar;

function _load_asar() {
    return _asar = require("./asar");
}

var _repositoryInfo;

function _load_repositoryInfo() {
    return _repositoryInfo = require("./repositoryInfo");
}

var _targetFactory;

function _load_targetFactory() {
    return _targetFactory = require("./targets/targetFactory");
}

var _readPackageJson;

function _load_readPackageJson() {
    return _readPackageJson = require("./util/readPackageJson");
}

var _yarn;

function _load_yarn() {
    return _yarn = require("./yarn");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addHandler(emitter, event, handler) {
    emitter.on(event, handler);
}
class Packager {
    //noinspection JSUnusedGlobalSymbols
    constructor(options, cancellationToken) {
        this.options = options;
        this.cancellationToken = cancellationToken;
        this.isTwoPackageJsonProjectLayoutUsed = true;
        this.eventEmitter = new (_events || _load_events()).EventEmitter();
        this.tempDirManager = new (_tmp || _load_tmp()).TmpDir();
        this._repositoryInfo = new (_electronBuilderUtil || _load_electronBuilderUtil()).Lazy(() => (0, (_repositoryInfo || _load_repositoryInfo()).getRepositoryInfo)(this.projectDir, this.metadata, this.devMetadata));
        this.afterPackHandlers = [];
        this.projectDir = options.projectDir == null ? process.cwd() : _path.resolve(options.projectDir);
        this.prepackaged = options.prepackaged == null ? null : _path.resolve(this.projectDir, options.prepackaged);
    }
    get isPrepackedAppAsar() {
        return this._isPrepackedAppAsar;
    }
    get config() {
        return this._config;
    }
    get repositoryInfo() {
        return this._repositoryInfo.value;
    }
    addAfterPackHandler(handler) {
        this.afterPackHandlers.push(handler);
    }
    artifactCreated(handler) {
        addHandler(this.eventEmitter, "artifactCreated", handler);
        return this;
    }
    dispatchArtifactCreated(event) {
        this.eventEmitter.emit("artifactCreated", event);
    }
    build() {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            //noinspection JSDeprecatedSymbols
            const devMetadataFromOptions = _this.options.devMetadata;
            if (devMetadataFromOptions != null) {
                (0, (_log || _load_log()).warn)("devMetadata is deprecated, please use config instead");
            }
            let configPath = null;
            let configFromOptions = _this.options.config;
            if (typeof configFromOptions === "string") {
                // it is a path to config file
                configPath = configFromOptions;
                configFromOptions = null;
            }
            if (devMetadataFromOptions != null) {
                if (configFromOptions != null) {
                    throw new Error("devMetadata and config cannot be used in conjunction");
                }
                configFromOptions = devMetadataFromOptions.build;
            }
            const projectDir = _this.projectDir;
            const fileOrPackageConfig = yield configPath == null ? (0, (_readPackageJson || _load_readPackageJson()).loadConfig)(projectDir) : (0, (_readPackageJson || _load_readPackageJson()).doLoadConfig)(_path.resolve(projectDir, configPath), projectDir);
            const config = (0, (_deepAssign || _load_deepAssign()).deepAssign)({}, fileOrPackageConfig, configFromOptions);
            const extraMetadata = _this.options.extraMetadata;
            if (extraMetadata != null) {
                const extraBuildMetadata = extraMetadata.build;
                if (extraBuildMetadata != null) {
                    (0, (_deepAssign || _load_deepAssign()).deepAssign)(config, extraBuildMetadata);
                    delete extraMetadata.build;
                }
                if (extraMetadata.directories != null) {
                    (0, (_log || _load_log()).warn)(`--em.directories is deprecated, please specify as --em.build.directories"`);
                    (0, (_deepAssign || _load_deepAssign()).deepAssign)(config, { directories: extraMetadata.directories });
                    delete extraMetadata.directories;
                }
            }
            yield (0, (_readPackageJson || _load_readPackageJson()).validateConfig)(config);
            _this._config = config;
            _this.appDir = yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).computeDefaultAppDirectory)(projectDir, (0, (_electronBuilderUtil || _load_electronBuilderUtil()).use)(config.directories, function (it) {
                return it.app;
            }));
            _this.isTwoPackageJsonProjectLayoutUsed = _this.appDir !== projectDir;
            const devPackageFile = _path.join(projectDir, "package.json");
            const appPackageFile = _this.isTwoPackageJsonProjectLayoutUsed ? _path.join(_this.appDir, "package.json") : devPackageFile;
            yield _this.readProjectMetadata(appPackageFile, extraMetadata);
            if (_this.isTwoPackageJsonProjectLayoutUsed) {
                _this.devMetadata = (0, (_deepAssign || _load_deepAssign()).deepAssign)((yield (0, (_readPackageJson || _load_readPackageJson()).readPackageJson)(devPackageFile)), devMetadataFromOptions);
                (0, (_electronBuilderUtil || _load_electronBuilderUtil()).debug)(`Two package.json structure is used (dev: ${devPackageFile}, app: ${appPackageFile})`);
            } else {
                _this.devMetadata = _this.metadata;
                if (_this.options.appMetadata != null) {
                    (0, (_deepAssign || _load_deepAssign()).deepAssign)(_this.devMetadata, _this.options.appMetadata);
                }
                if (extraMetadata != null) {
                    (0, (_deepAssign || _load_deepAssign()).deepAssign)(_this.devMetadata, extraMetadata);
                }
            }
            _this.checkMetadata(appPackageFile, devPackageFile);
            checkConflictingOptions(_this.config);
            _this.electronVersion = yield (0, (_readPackageJson || _load_readPackageJson()).getElectronVersion)(_this.config, projectDir, _this.isPrepackedAppAsar ? _this.metadata : null);
            _this.appInfo = new (_appInfo || _load_appInfo()).AppInfo(_this.metadata, _this);
            const cleanupTasks = [];
            const outDir = _path.resolve(_this.projectDir, (0, (_electronBuilderUtil || _load_electronBuilderUtil()).use)(_this.config.directories, function (it) {
                return it.output;
            }) || "dist");
            return {
                outDir: outDir,
                platformToTargets: yield (0, (_promise || _load_promise()).executeFinally)(_this.doBuild(outDir, cleanupTasks), function () {
                    return (0, (_promise || _load_promise()).all)(cleanupTasks.map(function (it) {
                        return it();
                    }).concat(_this.tempDirManager.cleanup()));
                })
            };
        })();
    }
    readProjectMetadata(appPackageFile, extraMetadata) {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            try {
                _this2.metadata = (0, (_deepAssign || _load_deepAssign()).deepAssign)((yield (0, (_readPackageJson || _load_readPackageJson()).readPackageJson)(appPackageFile)), _this2.options.appMetadata, extraMetadata);
            } catch (e) {
                if (e.code !== "ENOENT") {
                    throw e;
                }
                try {
                    const data = yield (0, (_asar || _load_asar()).readAsarJson)(_path.join(_this2.projectDir, "app.asar"), "package.json");
                    if (data != null) {
                        _this2.metadata = data;
                        _this2._isPrepackedAppAsar = true;
                        return;
                    }
                } catch (e) {
                    if (e.code !== "ENOENT") {
                        throw e;
                    }
                }
                throw new Error(`Cannot find package.json in the ${_path.dirname(appPackageFile)}`);
            }
        })();
    }
    doBuild(outDir, cleanupTasks) {
        var _this3 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const distTasks = [];
            const platformToTarget = new Map();
            const createdOutDirs = new Set();
            // custom packager - don't check wine
            let checkWine = _this3.prepackaged == null && _this3.options.platformPackagerFactory == null;
            for (const _ref of _this3.options.targets) {
                var _ref2 = _slicedToArray(_ref, 2);

                const platform = _ref2[0];
                const archToType = _ref2[1];

                if (_this3.cancellationToken.cancelled) {
                    break;
                }
                if (platform === (_electronBuilderCore || _load_electronBuilderCore()).Platform.MAC && process.platform === (_electronBuilderCore || _load_electronBuilderCore()).Platform.WINDOWS.nodeName) {
                    throw new Error("Build for macOS is supported only on macOS, please see https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build");
                }
                let wineCheck = null;
                if (checkWine && process.platform !== "win32" && platform === (_electronBuilderCore || _load_electronBuilderCore()).Platform.WINDOWS) {
                    wineCheck = (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("wine", ["--version"]);
                }
                const packager = _this3.createHelper(platform, cleanupTasks);
                const nameToTarget = new Map();
                platformToTarget.set(platform, nameToTarget);
                for (const _ref3 of (0, (_targetFactory || _load_targetFactory()).computeArchToTargetNamesMap)(archToType, packager.platformSpecificBuildOptions, platform)) {
                    var _ref4 = _slicedToArray(_ref3, 2);

                    const arch = _ref4[0];
                    const targetNames = _ref4[1];

                    if (_this3.cancellationToken.cancelled) {
                        break;
                    }
                    yield _this3.installAppDependencies(platform, arch);
                    if (_this3.cancellationToken.cancelled) {
                        break;
                    }
                    if (checkWine && wineCheck != null) {
                        checkWine = false;
                        yield checkWineVersion(wineCheck);
                    }
                    const targetList = (0, (_targetFactory || _load_targetFactory()).createTargets)(nameToTarget, targetNames.length === 0 ? packager.defaultTarget : targetNames, outDir, packager, cleanupTasks);
                    const ourDirs = new Set();
                    for (const target of targetList) {
                        if (!(target instanceof (_targetFactory || _load_targetFactory()).NoOpTarget) && !createdOutDirs.has(target.outDir)) {
                            ourDirs.add(target.outDir);
                        }
                    }
                    if (ourDirs.size > 0) {
                        yield (_bluebirdLst2 || _load_bluebirdLst2()).default.map(Array.from(ourDirs).sort(), function (it) {
                            createdOutDirs.add(it);
                            return (0, (_fsExtraP || _load_fsExtraP()).ensureDir)(it);
                        });
                    }
                    yield packager.pack(outDir, arch, targetList, distTasks);
                }
                if (_this3.cancellationToken.cancelled) {
                    break;
                }
                for (const target of nameToTarget.values()) {
                    distTasks.push(target.finishBuild());
                }
            }
            if (_this3.cancellationToken.cancelled) {
                for (const task of distTasks) {
                    if ("cancel" in task) {
                        task.cancel();
                    }
                }
            } else {
                yield (_bluebirdLst2 || _load_bluebirdLst2()).default.all(distTasks);
            }
            return platformToTarget;
        })();
    }
    createHelper(platform, cleanupTasks) {
        if (this.options.platformPackagerFactory != null) {
            return this.options.platformPackagerFactory(this, platform, cleanupTasks);
        }
        switch (platform) {
            case (_electronBuilderCore || _load_electronBuilderCore()).Platform.MAC:
                {
                    const helperClass = require("./macPackager").default;
                    return new helperClass(this);
                }
            case (_electronBuilderCore || _load_electronBuilderCore()).Platform.WINDOWS:
                {
                    const helperClass = require("./winPackager").WinPackager;
                    return new helperClass(this);
                }
            case (_electronBuilderCore || _load_electronBuilderCore()).Platform.LINUX:
                return new (require("./linuxPackager").LinuxPackager)(this);
            default:
                throw new Error(`Unknown platform: ${platform}`);
        }
    }
    checkMetadata(appPackageFile, devAppPackageFile) {
        const errors = [];
        const reportError = missedFieldName => {
            errors.push(`Please specify '${missedFieldName}' in the package.json (${appPackageFile})`);
        };
        const checkNotEmpty = (name, value) => {
            if ((0, (_electronBuilderUtil || _load_electronBuilderUtil()).isEmptyOrSpaces)(value)) {
                reportError(name);
            }
        };
        const appMetadata = this.metadata;
        checkNotEmpty("name", appMetadata.name);
        if ((0, (_electronBuilderUtil || _load_electronBuilderUtil()).isEmptyOrSpaces)(appMetadata.description)) {
            (0, (_log || _load_log()).warn)(`description is missed in the package.json (${appPackageFile})`);
        }
        checkNotEmpty("version", appMetadata.version);
        checkDependencies(this.devMetadata.dependencies, errors);
        if (appMetadata !== this.devMetadata) {
            checkDependencies(appMetadata.dependencies, errors);
            if (appMetadata.build != null) {
                errors.push(`'build' in the application package.json (${appPackageFile}) is not supported since 3.0 anymore. Please move 'build' into the development package.json (${devAppPackageFile})`);
            }
        }
        const config = this.config;
        if (config["osx-sign"] != null) {
            errors.push("osx-sign is deprecated and not supported — please see https://github.com/electron-userland/electron-builder/wiki/Code-Signing");
        }
        if (config["osx"] != null) {
            errors.push(`osx is deprecated and not supported — please use mac instead`);
        }
        if (config["app-copyright"] != null) {
            errors.push(`app-copyright is deprecated and not supported — please use copyright instead`);
        }
        if (config["app-category-type"] != null) {
            errors.push(`app-category-type is deprecated and not supported — please use mac.category instead`);
        }
        const author = appMetadata.author;
        if (author == null) {
            errors.push(`Please specify "author" in the application package.json (${appPackageFile}) — it is used as company name and copyright owner.`);
        }
        if (config.name != null) {
            errors.push(`'name' in the config is forbidden. Please move 'name' into the package.json (${appPackageFile})`);
        }
        if (config.prune != null) {
            errors.push("prune is deprecated — development dependencies are never copied in any case");
        }
        if (errors.length > 0) {
            throw new Error(errors.join("\n"));
        }
    }
    installAppDependencies(platform, arch) {
        var _this4 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            if (_this4.prepackaged != null) {
                return;
            }
            const options = _this4.config;
            if (options.nodeGypRebuild === true) {
                (0, (_log || _load_log()).log)(`Executing node-gyp rebuild for arch ${(_electronBuilderCore || _load_electronBuilderCore()).Arch[arch]}`);
                yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)(process.platform === "win32" ? "node-gyp.cmd" : "node-gyp", ["rebuild"], {
                    env: (0, (_yarn || _load_yarn()).getGypEnv)(_this4.electronVersion, platform.nodeName, (_electronBuilderCore || _load_electronBuilderCore()).Arch[arch], true)
                });
            }
            if (options.npmRebuild === false) {
                (0, (_log || _load_log()).log)("Skip app dependencies rebuild because npmRebuild is set to false");
                return;
            }
            const beforeBuild = options.beforeBuild;
            if (beforeBuild != null) {
                const performDependenciesInstallOrRebuild = yield beforeBuild({
                    appDir: _this4.appDir,
                    electronVersion: _this4.electronVersion,
                    platform,
                    arch: (_electronBuilderCore || _load_electronBuilderCore()).Arch[arch]
                });
                if (!performDependenciesInstallOrRebuild) return;
            }
            if (options.npmSkipBuildFromSource !== true && platform.nodeName !== process.platform) {
                (0, (_log || _load_log()).log)("Skip app dependencies rebuild because platform is different");
            } else {
                yield (0, (_yarn || _load_yarn()).installOrRebuild)(options, _this4.appDir, _this4.electronVersion, platform.nodeName, (_electronBuilderCore || _load_electronBuilderCore()).Arch[arch]);
            }
        })();
    }
    afterPack(context) {
        const afterPack = this.config.afterPack;
        const handlers = this.afterPackHandlers.slice();
        if (afterPack != null) {
            // user handler should be last
            handlers.push(afterPack);
        }
        return (_bluebirdLst2 || _load_bluebirdLst2()).default.each(handlers, it => it(context));
    }
}
exports.Packager = Packager;
function normalizePlatforms(rawPlatforms) {
    const platforms = rawPlatforms == null || Array.isArray(rawPlatforms) ? rawPlatforms : [rawPlatforms];
    if (platforms == null || platforms.length === 0) {
        return [(_electronBuilderCore || _load_electronBuilderCore()).Platform.fromString(process.platform)];
    } else if (platforms[0] === "all") {
        if (process.platform === (_electronBuilderCore || _load_electronBuilderCore()).Platform.MAC.nodeName) {
            return [(_electronBuilderCore || _load_electronBuilderCore()).Platform.MAC, (_electronBuilderCore || _load_electronBuilderCore()).Platform.LINUX, (_electronBuilderCore || _load_electronBuilderCore()).Platform.WINDOWS];
        } else if (process.platform === (_electronBuilderCore || _load_electronBuilderCore()).Platform.LINUX.nodeName) {
            // macOS code sign works only on macOS
            return [(_electronBuilderCore || _load_electronBuilderCore()).Platform.LINUX, (_electronBuilderCore || _load_electronBuilderCore()).Platform.WINDOWS];
        } else {
            return [(_electronBuilderCore || _load_electronBuilderCore()).Platform.WINDOWS];
        }
    } else {
        return platforms.map(it => it instanceof (_electronBuilderCore || _load_electronBuilderCore()).Platform ? it : (_electronBuilderCore || _load_electronBuilderCore()).Platform.fromString(it));
    }
}
function checkConflictingOptions(options) {
    for (const name of ["all", "out", "tmpdir", "version", "platform", "dir", "arch", "name", "extra-resource"]) {
        if (name in options) {
            throw new Error(`Option ${name} is ignored, do not specify it.`);
        }
    }
}
function checkDependencies(dependencies, errors) {
    if (dependencies == null) {
        return;
    }
    for (const name of ["electron", "electron-prebuilt", "electron-builder", "electron-rebuild"]) {
        if (name in dependencies) {
            errors.push(`Package "${name}" is only allowed in "devDependencies". ` + `Please remove it from the "dependencies" section in your package.json.`);
        }
    }
}
//# sourceMappingURL=packager.js.map