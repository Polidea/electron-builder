"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MacUpdater = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = _interopRequireDefault(require("bluebird-lst"));
}

var _AppUpdater;

function _load_AppUpdater() {
    return _AppUpdater = require("./AppUpdater");
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MacUpdater extends (_AppUpdater || _load_AppUpdater()).AppUpdater {
    constructor(options) {
        super(options);
        this.nativeUpdater = require("electron").autoUpdater;
        this.nativeUpdater.on("error", it => {
            if (this.logger != null) {
                this.logger.warn(it);
            }
            this.emit("error", it);
        });
        this.nativeUpdater.on("update-downloaded", () => {
            if (this.logger != null) {
                this.logger.info(`New version ${this.versionInfo.version} has been downloaded`);
            }
            this.emit("update-downloaded", this.versionInfo);
        });
    }
    onUpdateAvailable(versionInfo, fileInfo) {
        this.nativeUpdater.setFeedURL(versionInfo.releaseJsonUrl, Object.assign({ "Cache-Control": "no-cache" }, this.requestHeaders));
        super.onUpdateAvailable(versionInfo, fileInfo);
    }
    doDownloadUpdate(versionInfo, fileInfo, cancellationToken) {
        this.nativeUpdater.checkForUpdates();
        return (_bluebirdLst || _load_bluebirdLst()).default.resolve();
    }
    quitAndInstall() {
        this.nativeUpdater.quitAndInstall();
    }
}
exports.MacUpdater = MacUpdater; //# sourceMappingURL=MacUpdater.js.map