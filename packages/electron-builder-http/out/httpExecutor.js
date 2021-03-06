"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HttpExecutor = exports.HttpError = exports.executorHolder = exports.HttpExecutorHolder = undefined;
exports.download = download;
exports.request = request;
exports.configureRequestOptions = configureRequestOptions;
exports.dumpRequestOptions = dumpRequestOptions;

var _crypto;

function _load_crypto() {
    return _crypto = require("crypto");
}

var _debug2;

function _load_debug() {
    return _debug2 = _interopRequireDefault(require("debug"));
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _jsYaml;

function _load_jsYaml() {
    return _jsYaml = require("js-yaml");
}

var _stream;

function _load_stream() {
    return _stream = require("stream");
}

var _url;

function _load_url() {
    return _url = require("url");
}

var _CancellationToken;

function _load_CancellationToken() {
    return _CancellationToken = require("./CancellationToken");
}

var _ProgressCallbackTransform;

function _load_ProgressCallbackTransform() {
    return _ProgressCallbackTransform = require("./ProgressCallbackTransform");
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class HttpExecutorHolder {
    get httpExecutor() {
        if (this._httpExecutor == null) {
            this._httpExecutor = new (require("electron-builder-util/out/nodeHttpExecutor").NodeHttpExecutor)();
        }
        return this._httpExecutor;
    }
    set httpExecutor(value) {
        this._httpExecutor = value;
    }
}
exports.HttpExecutorHolder = HttpExecutorHolder;
const executorHolder = exports.executorHolder = new HttpExecutorHolder();
function download(url, destination, options) {
    return executorHolder.httpExecutor.download(url, destination, options || { cancellationToken: new (_CancellationToken || _load_CancellationToken()).CancellationToken() });
}
class HttpError extends Error {
    constructor(response) {
        let description = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        super(response.statusCode + " " + response.statusMessage + (description == null ? "" : "\n" + JSON.stringify(description, null, "  ")) + "\nHeaders: " + JSON.stringify(response.headers, null, "  "));
        this.response = response;
        this.description = description;
        this.name = "HttpError";
    }
}
exports.HttpError = HttpError;
class HttpExecutor {
    constructor() {
        this.maxRedirects = 10;
        this.debug = (0, (_debug2 || _load_debug()).default)("electron-builder");
    }
    request(options, cancellationToken, data) {
        configureRequestOptions(options);
        const encodedData = data == null ? undefined : new Buffer(JSON.stringify(data));
        if (encodedData != null) {
            options.method = "post";
            options.headers["Content-Type"] = "application/json";
            options.headers["Content-Length"] = encodedData.length;
        }
        return this.doApiRequest(options, cancellationToken, it => it.end(encodedData), 0);
    }
    handleResponse(response, options, cancellationToken, resolve, reject, redirectCount, requestProcessor) {
        if (this.debug.enabled) {
            this.debug(`Response status: ${response.statusCode} ${response.statusMessage}, request options: ${dumpRequestOptions(options)}`);
        }
        // we handle any other >= 400 error on request end (read detailed message in the response body)
        if (response.statusCode === 404) {
            // error is clear, we don't need to read detailed error description
            reject(new HttpError(response, `method: ${options.method} url: https://${options.hostname}${options.path}

    Please double check that your authentication token is correct. Due to security reasons actual status maybe not reported, but 404.
    `));
            return;
        } else if (response.statusCode === 204) {
            // on DELETE request
            resolve();
            return;
        }
        const redirectUrl = safeGetHeader(response, "location");
        if (redirectUrl != null) {
            if (redirectCount > 10) {
                reject(new Error("Too many redirects (> 10)"));
                return;
            }
            this.doApiRequest(Object.assign({}, options, (0, (_url || _load_url()).parse)(redirectUrl)), cancellationToken, requestProcessor, redirectCount).then(resolve).catch(reject);
            return;
        }
        let data = "";
        response.setEncoding("utf8");
        response.on("data", chunk => {
            data += chunk;
        });
        response.on("end", () => {
            try {
                const contentType = response.headers["content-type"];
                const isJson = contentType != null && (Array.isArray(contentType) ? contentType.find(it => it.indexOf("json") !== -1) != null : contentType.indexOf("json") !== -1);
                if (response.statusCode != null && response.statusCode >= 400) {
                    reject(new HttpError(response, isJson ? JSON.parse(data) : data));
                } else {
                    const pathname = options.pathname || options.path;
                    if (data.length === 0) {
                        resolve();
                    } else if (pathname != null && pathname.endsWith(".yml")) {
                        resolve((0, (_jsYaml || _load_jsYaml()).safeLoad)(data));
                    } else {
                        resolve(isJson || pathname != null && pathname.endsWith(".json") ? JSON.parse(data) : data);
                    }
                }
            } catch (e) {
                reject(e);
            }
        });
    }
    doDownload(requestOptions, destination, redirectCount, options, callback, onCancel) {
        const request = this.doRequest(requestOptions, response => {
            if (response.statusCode >= 400) {
                callback(new Error(`Cannot download "${requestOptions.protocol || "https"}://${requestOptions.hostname}/${requestOptions.path}", status ${response.statusCode}: ${response.statusMessage}`));
                return;
            }
            const redirectUrl = safeGetHeader(response, "location");
            if (redirectUrl != null) {
                if (redirectCount < this.maxRedirects) {
                    const parsedUrl = (0, (_url || _load_url()).parse)(redirectUrl);
                    this.doDownload(Object.assign({}, requestOptions, {
                        hostname: parsedUrl.hostname,
                        path: parsedUrl.path,
                        port: parsedUrl.port == null ? undefined : parsedUrl.port
                    }), destination, redirectCount++, options, callback, onCancel);
                } else {
                    callback(new Error(`Too many redirects (> ${this.maxRedirects})`));
                }
                return;
            }
            configurePipes(options, response, destination, callback, options.cancellationToken);
        });
        this.addTimeOutHandler(request, callback);
        request.on("error", callback);
        onCancel(() => request.abort());
        request.end();
    }
    addTimeOutHandler(request, callback) {
        request.on("socket", function (socket) {
            socket.setTimeout(60 * 1000, () => {
                callback(new Error("Request timed out"));
                request.abort();
            });
        });
    }
}
exports.HttpExecutor = HttpExecutor;
class DigestTransform extends (_stream || _load_stream()).Transform {
    constructor(expected) {
        super();
        this.expected = expected;
        this.digester = (0, (_crypto || _load_crypto()).createHash)("sha256");
    }
    _transform(chunk, encoding, callback) {
        this.digester.update(chunk);
        callback(null, chunk);
    }
    _flush(callback) {
        const hash = this.digester.digest("hex");
        callback(hash === this.expected ? null : new Error(`SHA2 checksum mismatch, expected ${this.expected}, got ${hash}`));
    }
}
function request(options, cancellationToken, data) {
    return executorHolder.httpExecutor.request(options, cancellationToken, data);
}
function checkSha2(sha2Header, sha2, callback) {
    if (sha2Header != null && sha2 != null) {
        // todo why bintray doesn't send this header always
        if (sha2Header == null) {
            callback(new Error("checksum is required, but server response doesn't contain X-Checksum-Sha2 header"));
            return false;
        } else if (sha2Header !== sha2) {
            callback(new Error(`checksum mismatch: expected ${sha2} but got ${sha2Header} (X-Checksum-Sha2 header)`));
            return false;
        }
    }
    return true;
}
function safeGetHeader(response, headerKey) {
    const value = response.headers[headerKey];
    if (value == null) {
        return null;
    } else if (Array.isArray(value)) {
        // electron API
        return value.length === 0 ? null : value[value.length - 1];
    } else {
        return value;
    }
}
function configurePipes(options, response, destination, callback, cancellationToken) {
    if (!checkSha2(safeGetHeader(response, "X-Checksum-Sha2"), options.sha2, callback)) {
        return;
    }
    const streams = [];
    if (options.onProgress != null) {
        const contentLength = safeGetHeader(response, "content-length");
        if (contentLength != null) {
            streams.push(new (_ProgressCallbackTransform || _load_ProgressCallbackTransform()).ProgressCallbackTransform(parseInt(contentLength, 10), options.cancellationToken, options.onProgress));
        }
    }
    if (options.sha2 != null) {
        streams.push(new DigestTransform(options.sha2));
    }
    const fileOut = (0, (_fsExtraP || _load_fsExtraP()).createWriteStream)(destination);
    streams.push(fileOut);
    let lastStream = response;
    for (const stream of streams) {
        stream.on("error", error => {
            if (!cancellationToken.cancelled) {
                callback(error);
            }
        });
        lastStream = lastStream.pipe(stream);
    }
    fileOut.on("finish", () => {
        fileOut.close(callback);
    });
}
function configureRequestOptions(options, token, method) {
    if (method != null) {
        options.method = method;
    }
    let headers = options.headers;
    if (headers == null) {
        headers = {};
        options.headers = headers;
    }
    if (token != null) {
        headers.authorization = token.startsWith("Basic") ? token : `token ${token}`;
    }
    if (headers["User-Agent"] == null) {
        headers["User-Agent"] = "electron-builder";
    }
    if (method == null || method === "GET" || headers["Cache-Control"] == null) {
        headers["Cache-Control"] = "no-cache";
    }
    return options;
}
function dumpRequestOptions(options) {
    const safe = Object.assign({}, options);
    if (safe.headers != null && safe.headers.authorization != null) {
        safe.headers.authorization = "<skipped>";
    }
    return JSON.stringify(safe, null, 2);
}
//# sourceMappingURL=httpExecutor.js.map