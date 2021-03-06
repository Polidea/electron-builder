"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.NsisUpdater = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

require("source-map-support/register");

var _child_process;

function _load_child_process() {
    return _child_process = require("child_process");
}

var _electronBuilderHttp;

function _load_electronBuilderHttp() {
    return _electronBuilderHttp = require("electron-builder-http");
}

var _CancellationToken;

function _load_CancellationToken() {
    return _CancellationToken = require("electron-builder-http/out/CancellationToken");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _os;

function _load_os() {
    return _os = require("os");
}

var _path = _interopRequireWildcard(require("path"));

var _api;

function _load_api() {
    return _api = require("./api");
}

var _AppUpdater;

function _load_AppUpdater() {
    return _AppUpdater = require("./AppUpdater");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class NsisUpdater extends (_AppUpdater || _load_AppUpdater()).AppUpdater {
    constructor(options) {
        super(options);
        this.quitAndInstallCalled = false;
        this.quitHandlerAdded = false;
    }
    /**
     * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
     * @returns {Promise<string>} Path to downloaded file.
     */
    doDownloadUpdate(versionInfo, fileInfo, cancellationToken) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const downloadOptions = {
                skipDirCreation: true,
                headers: _this.requestHeaders || undefined,
                cancellationToken: cancellationToken,
                sha2: fileInfo == null ? null : fileInfo.sha2
            };
            if (_this.listenerCount((_api || _load_api()).DOWNLOAD_PROGRESS) > 0) {
                downloadOptions.onProgress = function (it) {
                    return _this.emit((_api || _load_api()).DOWNLOAD_PROGRESS, it);
                };
            }
            const logger = _this.logger;
            const tempDir = yield (0, (_fsExtraP || _load_fsExtraP()).mkdtemp)(`${_path.join((0, (_os || _load_os()).tmpdir)(), "up")}-`);
            const tempFile = _path.join(tempDir, fileInfo.name);
            try {
                yield (0, (_electronBuilderHttp || _load_electronBuilderHttp()).download)(fileInfo.url, tempFile, downloadOptions);
            } catch (e) {
                try {
                    yield (0, (_fsExtraP || _load_fsExtraP()).remove)(tempDir);
                } catch (ignored) {
                    // ignored
                }
                if (e instanceof (_CancellationToken || _load_CancellationToken()).CancellationError) {
                    _this.emit("update-cancelled", _this.versionInfo);
                    if (logger != null) {
                        logger.info("Cancelled");
                    }
                }
                throw e;
            }
            if (logger != null) {
                logger.info(`New version ${_this.versionInfo.version} has been downloaded to ${tempFile}`);
            }
            _this.setupPath = tempFile;
            _this.addQuitHandler();
            _this.emit("update-downloaded", _this.versionInfo);
            return tempFile;
        })();
    }
    addQuitHandler() {
        if (this.quitHandlerAdded) {
            return;
        }
        this.quitHandlerAdded = true;
        this.app.on("quit", () => {
            if (this.logger != null) {
                this.logger.info("Auto install update on quit");
            }
            this.install(true);
        });
    }
    quitAndInstall() {
        if (this.install(false)) {
            this.app.quit();
        }
    }
    install(isSilent) {
        if (this.quitAndInstallCalled) {
            return false;
        }
        const setupPath = this.setupPath;
        if (!this.updateAvailable || setupPath == null) {
            const message = "No update available, can't quit and install";
            this.emit("error", new Error(message), message);
            return false;
        }
        // prevent calling several times
        this.quitAndInstallCalled = true;
        const args = ["--updated"];
        if (isSilent) {
            args.push("/S");
        }
        const spawnOptions = {
            detached: true,
            stdio: "ignore"
        };
        try {
            (0, (_child_process || _load_child_process()).spawn)(setupPath, args, spawnOptions).unref();
        } catch (e) {
            // yes, such errors dispatched not as error event
            // https://github.com/electron-userland/electron-builder/issues/1129
            if (e.code === "UNKNOWN") {
                if (this.logger != null) {
                    this.logger.info("UNKNOWN error code on spawn, will be executed again using elevate");
                }
                try {
                    (0, (_child_process || _load_child_process()).spawn)(_path.join(process.resourcesPath, "elevate.exe"), [setupPath].concat(args), spawnOptions).unref();
                } catch (e) {
                    this.dispatchError(e);
                }
            } else {
                this.dispatchError(e);
            }
        }
        return true;
    }
}
exports.NsisUpdater = NsisUpdater; //# sourceMappingURL=NsisUpdater.js.map