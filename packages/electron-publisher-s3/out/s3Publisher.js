"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _awsSdk;

function _load_awsSdk() {
    return _awsSdk = require("aws-sdk");
}

var _electronBuilderUtil;

function _load_electronBuilderUtil() {
    return _electronBuilderUtil = require("electron-builder-util");
}

var _electronPublish;

function _load_electronPublish() {
    return _electronPublish = require("electron-publish");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _mime;

function _load_mime() {
    return _mime = _interopRequireDefault(require("mime"));
}

var _path = require("path");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class S3Publisher extends (_electronPublish || _load_electronPublish()).Publisher {
    constructor(context, info) {
        super(context);
        this.info = info;
        this.s3 = new (_awsSdk || _load_awsSdk()).S3({ signatureVersion: "v4" });
        this.providerName = "S3";
        (0, (_electronBuilderUtil || _load_electronBuilderUtil()).debug)(`Creating S3 Publisher — bucket: ${info.bucket}`);
        if ((0, (_electronBuilderUtil || _load_electronBuilderUtil()).isEmptyOrSpaces)(process.env.AWS_ACCESS_KEY_ID)) {
            throw new Error(`Env AWS_ACCESS_KEY_ID is not set`);
        }
        if ((0, (_electronBuilderUtil || _load_electronBuilderUtil()).isEmptyOrSpaces)(process.env.AWS_SECRET_ACCESS_KEY)) {
            throw new Error(`Env AWS_SECRET_ACCESS_KEY is not set`);
        }
    }
    // http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-creating-buckets.html
    upload(file, safeArtifactName) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const fileName = (0, _path.basename)(file);
            const fileStat = yield (0, (_fsExtraP || _load_fsExtraP()).stat)(file);
            return _this.context.cancellationToken.createPromise(function (resolve, reject, onCancel) {
                const upload = _this.s3.upload({
                    Bucket: _this.info.bucket,
                    Key: (_this.info.path == null ? "" : `${_this.info.path}/`) + fileName,
                    ACL: _this.info.acl || "public-read",
                    Body: _this.createReadStreamAndProgressBar(file, fileStat, _this.createProgressBar(fileName, fileStat), reject),
                    ContentLength: fileStat.size,
                    ContentType: (_mime || _load_mime()).default.lookup(fileName),
                    StorageClass: _this.info.storageClass || undefined
                }, function (error, data) {
                    if (error != null) {
                        reject(error);
                        return;
                    }
                    (0, (_electronBuilderUtil || _load_electronBuilderUtil()).debug)(`S3 Publisher: ${fileName} was uploaded to ${data.Location}`);
                    resolve();
                });
                onCancel(function () {
                    return upload.abort();
                });
            });
        })();
    }
    toString() {
        return `S3 (bucket: ${this.info.bucket})`;
    }
}
exports.default = S3Publisher; //# sourceMappingURL=s3Publisher.js.map