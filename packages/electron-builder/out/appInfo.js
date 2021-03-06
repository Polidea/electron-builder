"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AppInfo = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _electronBuilderUtil;

function _load_electronBuilderUtil() {
    return _electronBuilderUtil = require("electron-builder-util");
}

var _log;

function _load_log() {
    return _log = require("electron-builder-util/out/log");
}

var _sanitizeFilename;

function _load_sanitizeFilename() {
    return _sanitizeFilename = _interopRequireDefault(require("sanitize-filename"));
}

var _semver;

function _load_semver() {
    return _semver = require("semver");
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AppInfo {
    constructor(metadata, info, buildVersion) {
        this.metadata = metadata;
        this.info = info;
        this.description = (0, (_electronBuilderUtil || _load_electronBuilderUtil()).smarten)(this.metadata.description || "");
        this.version = metadata.version;
        this.buildNumber = this.config.buildVersion || process.env.TRAVIS_BUILD_NUMBER || process.env.APPVEYOR_BUILD_NUMBER || process.env.CIRCLE_BUILD_NUM || process.env.BUILD_NUMBER;
        if ((0, (_electronBuilderUtil || _load_electronBuilderUtil()).isEmptyOrSpaces)(buildVersion)) {
            buildVersion = this.version;
            if (!(0, (_electronBuilderUtil || _load_electronBuilderUtil()).isEmptyOrSpaces)(this.buildNumber)) {
                buildVersion += `.${this.buildNumber}`;
            }
            this.buildVersion = buildVersion;
        } else {
            this.buildVersion = buildVersion;
        }
        this.productName = this.config.productName || metadata.productName || metadata.name;
        this.productFilename = (0, (_sanitizeFilename || _load_sanitizeFilename()).default)(this.productName);
    }
    get config() {
        return this.info.config;
    }
    get versionInWeirdWindowsForm() {
        const parsedVersion = new (_semver || _load_semver()).SemVer(this.version);
        return `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}.${this.buildNumber || "0"}`;
    }
    get companyName() {
        return this.metadata.author.name;
    }
    get id() {
        let appId = this.config["app-bundle-id"];
        if (appId != null) {
            (0, (_log || _load_log()).warn)("app-bundle-id is deprecated, please use appId");
        }
        if (this.config.appId != null) {
            appId = this.config.appId;
        }
        const generateDefaultAppId = () => {
            return `com.electron.${this.metadata.name.toLowerCase()}`;
        };
        if (appId === "your.id" || (0, (_electronBuilderUtil || _load_electronBuilderUtil()).isEmptyOrSpaces)(appId)) {
            const incorrectAppId = appId;
            appId = generateDefaultAppId();
            (0, (_log || _load_log()).warn)(`Do not use "${incorrectAppId}" as appId, "${appId}" will be used instead`);
        }
        return appId == null ? generateDefaultAppId() : appId;
    }
    get name() {
        return this.metadata.name;
    }
    get copyright() {
        const copyright = this.config.copyright;
        if (copyright != null) {
            return copyright;
        }
        return `Copyright © ${new Date().getFullYear()} ${this.metadata.author.name || this.productName}`;
    }
    computePackageUrl() {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const url = _this.metadata.homepage;
            if (url != null) {
                return url;
            }
            const info = yield _this.info.repositoryInfo;
            return info == null || info.type !== "github" ? null : `https://${info.domain}/${info.user}/${info.project}`;
        })();
    }
}
exports.AppInfo = AppInfo; //# sourceMappingURL=appInfo.js.map