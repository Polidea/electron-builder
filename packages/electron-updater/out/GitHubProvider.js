"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GitHubProvider = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _api;

function _load_api() {
    return _api = require("./api");
}

var _publishOptions;

function _load_publishOptions() {
    return _publishOptions = require("electron-builder-http/out/publishOptions");
}

var _GenericProvider;

function _load_GenericProvider() {
    return _GenericProvider = require("./GenericProvider");
}

var _path = _interopRequireWildcard(require("path"));

var _electronBuilderHttp;

function _load_electronBuilderHttp() {
    return _electronBuilderHttp = require("electron-builder-http");
}

var _CancellationToken;

function _load_CancellationToken() {
    return _CancellationToken = require("electron-builder-http/out/CancellationToken");
}

var _url;

function _load_url() {
    return _url = require("url");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class GitHubProvider extends (_api || _load_api()).Provider {
    constructor(options) {
        super();
        this.options = options;
        const baseUrl = (0, (_url || _load_url()).parse)(`${options.protocol || "https"}://${options.host || "github.com"}`);
        this.baseUrl = {
            protocol: baseUrl.protocol,
            hostname: baseUrl.hostname,
            port: baseUrl.port
        };
    }
    getLatestVersion() {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const basePath = _this.getBasePath();
            const cancellationToken = new (_CancellationToken || _load_CancellationToken()).CancellationToken();
            const version = yield _this.getLatestVersionString(basePath, cancellationToken);
            let result;
            const channelFile = (0, (_api || _load_api()).getChannelFilename)((0, (_api || _load_api()).getDefaultChannelName)());
            const requestOptions = Object.assign({ path: `${basePath}/download/v${version}/${channelFile}`, headers: _this.requestHeaders || undefined }, _this.baseUrl);
            try {
                result = yield (0, (_electronBuilderHttp || _load_electronBuilderHttp()).request)(requestOptions, cancellationToken);
            } catch (e) {
                if (e instanceof (_electronBuilderHttp || _load_electronBuilderHttp()).HttpError && e.response.statusCode === 404) {
                    throw new Error(`Cannot find ${channelFile} in the latest release artifacts (${formatUrl(requestOptions)}): ${e.stack || e.message}`);
                }
                throw e;
            }
            (0, (_GenericProvider || _load_GenericProvider()).validateUpdateInfo)(result);
            if ((0, (_api || _load_api()).getCurrentPlatform)() === "darwin") {
                result.releaseJsonUrl = `${(0, (_publishOptions || _load_publishOptions()).githubUrl)(_this.options)}/${requestOptions.path}`;
            }
            return result;
        })();
    }
    getLatestVersionString(basePath, cancellationToken) {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const requestOptions = Object.assign({
                path: `${basePath}/latest`,
                headers: Object.assign({ Accept: "application/json" }, _this2.requestHeaders)
            }, _this2.baseUrl);
            try {
                // do not use API to avoid limit
                const releaseInfo = yield (0, (_electronBuilderHttp || _load_electronBuilderHttp()).request)(requestOptions, cancellationToken);
                return releaseInfo.tag_name.startsWith("v") ? releaseInfo.tag_name.substring(1) : releaseInfo.tag_name;
            } catch (e) {
                throw new Error(`Unable to find latest version on GitHub (${formatUrl(requestOptions)}), please ensure a production release exists: ${e.stack || e.message}`);
            }
        })();
    }
    getBasePath() {
        return `/${this.options.owner}/${this.options.repo}/releases`;
    }
    getUpdateFile(versionInfo) {
        var _this3 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            if ((0, (_api || _load_api()).getCurrentPlatform)() === "darwin") {
                return versionInfo;
            }
            const basePath = _this3.getBasePath();
            // space is not supported on GitHub
            const name = versionInfo.githubArtifactName || _path.posix.basename(versionInfo.path).replace(/ /g, "-");
            return {
                name: name,
                url: formatUrl(Object.assign({ path: `${basePath}/download/v${versionInfo.version}/${name}` }, _this3.baseUrl)),
                sha2: versionInfo.sha2
            };
        })();
    }
}
exports.GitHubProvider = GitHubProvider; // url.format doesn't correctly use path and requires explicit pathname

function formatUrl(url) {
    if (url.path != null && url.pathname == null) {
        url.pathname = url.path;
    }
    return (0, (_url || _load_url()).format)(url);
}
//# sourceMappingURL=GitHubProvider.js.map