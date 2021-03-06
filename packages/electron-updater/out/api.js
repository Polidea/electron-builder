"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getDefaultChannelName = getDefaultChannelName;
exports.getCustomChannelName = getCustomChannelName;
exports.getCurrentPlatform = getCurrentPlatform;
exports.getChannelFilename = getChannelFilename;
class Provider {
    setRequestHeaders(value) {
        this.requestHeaders = value;
    }
}
exports.Provider = Provider; // due to historical reasons for windows we use channel name without platform specifier

function getDefaultChannelName() {
    return `latest${getChannelFilePrefix()}`;
}
function getChannelFilePrefix() {
    return getCurrentPlatform() === "darwin" ? "-mac" : "";
}
function getCustomChannelName(channel) {
    return `${channel}${getChannelFilePrefix()}`;
}
function getCurrentPlatform() {
    return process.env.TEST_UPDATER_PLATFORM || process.platform;
}
function getChannelFilename(channel) {
    return `${channel}.${getCurrentPlatform() === "darwin" ? "json" : "yml"}`;
}
const DOWNLOAD_PROGRESS = exports.DOWNLOAD_PROGRESS = "download-progress";
class UpdaterSignal {
    constructor(emitter) {
        this.emitter = emitter;
    }
    progress(handler) {
        addHandler(this.emitter, DOWNLOAD_PROGRESS, handler);
    }
    updateDownloaded(handler) {
        addHandler(this.emitter, "update-downloaded", handler);
    }
    updateCancelled(handler) {
        addHandler(this.emitter, "update-cancelled", handler);
    }
}
exports.UpdaterSignal = UpdaterSignal;
const isLogEvent = false;
function addHandler(emitter, event, handler) {
    if (isLogEvent) {
        emitter.on(event, function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            console.log("%s %s", event, args);
            handler.apply(null, args);
        });
    } else {
        emitter.on(event, handler);
    }
}
//# sourceMappingURL=api.js.map