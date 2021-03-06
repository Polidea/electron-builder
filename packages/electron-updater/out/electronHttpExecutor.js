"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ElectronHttpExecutor = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _electron;

function _load_electron() {
    return _electron = require("electron");
}

var _electronBuilderHttp;

function _load_electronBuilderHttp() {
    return _electronBuilderHttp = require("electron-builder-http");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _path = _interopRequireWildcard(require("path"));

var _url;

function _load_url() {
    return _url = require("url");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class ElectronHttpExecutor extends (_electronBuilderHttp || _load_electronBuilderHttp()).HttpExecutor {
    download(url, destination, options) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            if (options == null || !options.skipDirCreation) {
                yield (0, (_fsExtraP || _load_fsExtraP()).ensureDir)(_path.dirname(destination));
            }
            return yield options.cancellationToken.createPromise(function (resolve, reject, onCancel) {
                const parsedUrl = (0, (_url || _load_url()).parse)(url);
                _this.doDownload((0, (_electronBuilderHttp || _load_electronBuilderHttp()).configureRequestOptions)({
                    protocol: parsedUrl.protocol,
                    hostname: parsedUrl.hostname,
                    path: parsedUrl.path,
                    port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : undefined,
                    headers: options.headers || undefined
                }), destination, 0, options, function (error) {
                    if (error == null) {
                        resolve(destination);
                    } else {
                        reject(error);
                    }
                }, onCancel);
            });
        })();
    }
    doApiRequest(options, cancellationToken, requestProcessor) {
        let redirectCount = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

        if (this.debug.enabled) {
            this.debug(`request: ${(0, (_electronBuilderHttp || _load_electronBuilderHttp()).dumpRequestOptions)(options)}`);
        }
        return cancellationToken.createPromise((resolve, reject, onCancel) => {
            const request = (_electron || _load_electron()).net.request(options, response => {
                try {
                    this.handleResponse(response, options, cancellationToken, resolve, reject, redirectCount, requestProcessor);
                } catch (e) {
                    reject(e);
                }
            });
            this.addTimeOutHandler(request, reject);
            request.on("error", reject);
            requestProcessor(request, reject);
            onCancel(() => request.abort());
        });
    }
    doRequest(options, callback) {
        return (_electron || _load_electron()).net.request(options, callback);
    }
}
exports.ElectronHttpExecutor = ElectronHttpExecutor; //# sourceMappingURL=electronHttpExecutor.js.map