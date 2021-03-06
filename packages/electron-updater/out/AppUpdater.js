"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AppUpdater = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

require("source-map-support/register");

var _electronBuilderHttp;

function _load_electronBuilderHttp() {
    return _electronBuilderHttp = require("electron-builder-http");
}

var _CancellationToken;

function _load_CancellationToken() {
    return _CancellationToken = require("electron-builder-http/out/CancellationToken");
}

var _publishOptions;

function _load_publishOptions() {
    return _publishOptions = require("electron-builder-http/out/publishOptions");
}

var _events;

function _load_events() {
    return _events = require("events");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _jsYaml;

function _load_jsYaml() {
    return _jsYaml = require("js-yaml");
}

var _path = _interopRequireWildcard(require("path"));

var _semver;

function _load_semver() {
    return _semver = require("semver");
}

var _api;

function _load_api() {
    return _api = require("./api");
}

var _BintrayProvider;

function _load_BintrayProvider() {
    return _BintrayProvider = require("./BintrayProvider");
}

var _electronHttpExecutor;

function _load_electronHttpExecutor() {
    return _electronHttpExecutor = require("./electronHttpExecutor");
}

var _GenericProvider;

function _load_GenericProvider() {
    return _GenericProvider = require("./GenericProvider");
}

var _GitHubProvider;

function _load_GitHubProvider() {
    return _GitHubProvider = require("./GitHubProvider");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AppUpdater extends (_events || _load_events()).EventEmitter {
    constructor(options) {
        super();
        /**
         * Automatically download an update when it is found.
         */
        this.autoDownload = true;
        /**
         * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
         * Set it to `null` if you would like to disable a logging feature.
         */
        this.logger = global.__test_app ? null : console;
        this.signals = new (_api || _load_api()).UpdaterSignal(this);
        this.updateAvailable = false;
        this.on("error", error => {
            if (this.logger != null) {
                this.logger.error(`Error: ${error.stack || error.message}`);
            }
        });
        if (global.__test_app != null) {
            this.app = global.__test_app;
            this.untilAppReady = (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve();
        } else {
            this.app = require("electron").app;
            (_electronBuilderHttp || _load_electronBuilderHttp()).executorHolder.httpExecutor = new (_electronHttpExecutor || _load_electronHttpExecutor()).ElectronHttpExecutor();
            this.untilAppReady = new (_bluebirdLst2 || _load_bluebirdLst2()).default(resolve => {
                if (this.app.isReady()) {
                    if (this.logger != null) {
                        this.logger.info("App is ready");
                    }
                    resolve();
                } else {
                    if (this.logger != null) {
                        this.logger.info("Wait for app ready");
                    }
                    this.app.on("ready", resolve);
                }
            });
        }
        if (options != null) {
            this.setFeedURL(options);
        }
    }
    set updateConfigPath(value) {
        this.clientPromise = null;
        this._appUpdateConfigPath = value;
    }
    //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    getFeedURL() {
        return "Deprecated. Do not use it.";
    }
    /**
     * Configure update provider. If value is `string`, {@link module:electron-builder-http/out/publishOptions.GenericServerOptions} will be set with value as `url`.
     * @param options If you want to override configuration in the `app-update.yml`.
     */
    setFeedURL(options) {
        // https://github.com/electron-userland/electron-builder/issues/1105
        let client;
        if (typeof options === "string") {
            client = new (_GenericProvider || _load_GenericProvider()).GenericProvider({ provider: "generic", url: options });
        } else {
            client = createClient(options);
        }
        this.clientPromise = (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve(client);
    }
    checkForUpdates() {
        let checkForUpdatesPromise = this.checkForUpdatesPromise;
        if (checkForUpdatesPromise != null) {
            return checkForUpdatesPromise;
        }
        checkForUpdatesPromise = this._checkForUpdates();
        this.checkForUpdatesPromise = checkForUpdatesPromise;
        const nullizePromise = () => this.checkForUpdatesPromise = null;
        checkForUpdatesPromise.then(nullizePromise).catch(nullizePromise);
        return checkForUpdatesPromise;
    }
    _checkForUpdates() {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            try {
                yield _this.untilAppReady;
                if (_this.logger != null) {
                    _this.logger.info("Checking for update");
                }
                _this.emit("checking-for-update");
                return yield _this.doCheckForUpdates();
            } catch (e) {
                _this.emit("error", e, `Cannot check for updates: ${(e.stack || e).toString()}`);
                throw e;
            }
        })();
    }
    doCheckForUpdates() {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            if (_this2.clientPromise == null) {
                _this2.clientPromise = _this2.loadUpdateConfig().then(function (it) {
                    return createClient(it);
                });
            }
            const client = yield _this2.clientPromise;
            client.setRequestHeaders(_this2.requestHeaders);
            const versionInfo = yield client.getLatestVersion();
            const latestVersion = (0, (_semver || _load_semver()).valid)(versionInfo.version);
            if (latestVersion == null) {
                throw new Error(`Latest version (from update server) is not valid semver version: "${latestVersion}`);
            }
            const currentVersionString = _this2.app.getVersion();
            const currentVersion = (0, (_semver || _load_semver()).valid)(currentVersionString);
            if (currentVersion == null) {
                throw new Error(`App version is not valid semver version: "${currentVersion}`);
            }
            if (!(0, (_semver || _load_semver()).gt)(latestVersion, currentVersion)) {
                _this2.updateAvailable = false;
                if (_this2.logger != null) {
                    _this2.logger.info(`Update for version ${currentVersionString} is not available (latest version: ${versionInfo.version})`);
                }
                _this2.emit("update-not-available", versionInfo);
                return {
                    versionInfo: versionInfo
                };
            }
            const fileInfo = yield client.getUpdateFile(versionInfo);
            _this2.updateAvailable = true;
            _this2.versionInfo = versionInfo;
            _this2.fileInfo = fileInfo;
            _this2.onUpdateAvailable(versionInfo, fileInfo);
            const cancellationToken = new (_CancellationToken || _load_CancellationToken()).CancellationToken();
            //noinspection ES6MissingAwait
            return {
                versionInfo: versionInfo,
                fileInfo: fileInfo,
                cancellationToken: cancellationToken,
                downloadPromise: _this2.autoDownload ? _this2.downloadUpdate(cancellationToken) : null
            };
        })();
    }
    onUpdateAvailable(versionInfo, fileInfo) {
        if (this.logger != null) {
            this.logger.info(`Found version ${versionInfo.version} (url: ${fileInfo.url})`);
        }
        this.emit("update-available", versionInfo);
    }
    /**
     * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
     * @returns {Promise<string>} Path to downloaded file.
     */
    downloadUpdate() {
        var _this3 = this;

        let cancellationToken = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new (_CancellationToken || _load_CancellationToken()).CancellationToken();
        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const versionInfo = _this3.versionInfo;
            const fileInfo = _this3.fileInfo;
            if (versionInfo == null || fileInfo == null) {
                const message = "Please check update first";
                const error = new Error(message);
                _this3.emit("error", error, message);
                throw error;
            }
            if (_this3.logger != null) {
                _this3.logger.info(`Downloading update from ${fileInfo.url}`);
            }
            try {
                return yield _this3.doDownloadUpdate(versionInfo, fileInfo, cancellationToken);
            } catch (e) {
                _this3.dispatchError(e);
                throw e;
            }
        })();
    }
    dispatchError(e) {
        this.emit("error", e, (e.stack || e).toString());
    }
    loadUpdateConfig() {
        var _this4 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            if (_this4._appUpdateConfigPath == null) {
                _this4._appUpdateConfigPath = _path.join(process.resourcesPath, "app-update.yml");
            }
            return (0, (_jsYaml || _load_jsYaml()).safeLoad)((yield (0, (_fsExtraP || _load_fsExtraP()).readFile)(_this4._appUpdateConfigPath, "utf-8")));
        })();
    }
}
exports.AppUpdater = AppUpdater;
function createClient(data) {
    if (typeof data === "string") {
        throw new Error("Please pass PublishConfiguration object");
    }
    const provider = data.provider;
    switch (provider) {
        case "github":
            return new (_GitHubProvider || _load_GitHubProvider()).GitHubProvider(data);
        case "s3":
            {
                const s3 = data;
                return new (_GenericProvider || _load_GenericProvider()).GenericProvider({
                    provider: "generic",
                    url: (0, (_publishOptions || _load_publishOptions()).s3Url)(s3),
                    channel: s3.channel || ""
                });
            }
        case "generic":
            return new (_GenericProvider || _load_GenericProvider()).GenericProvider(data);
        case "bintray":
            return new (_BintrayProvider || _load_BintrayProvider()).BintrayProvider(data);
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}
//# sourceMappingURL=AppUpdater.js.map