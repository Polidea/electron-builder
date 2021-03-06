"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getPublishConfigs = exports.getPublishConfigsForUpdateInfo = exports.PublishManager = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

let getPublishConfigsForUpdateInfo = exports.getPublishConfigsForUpdateInfo = (() => {
    var _ref2 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (packager, publishConfigs) {
        if (publishConfigs === null) {
            return null;
        }
        if (publishConfigs.length === 0) {
            // https://github.com/electron-userland/electron-builder/issues/925#issuecomment-261732378
            // default publish config is github, file should be generated regardless of publish state (user can test installer locally or manage the release process manually)
            const repositoryInfo = yield packager.info.repositoryInfo;
            if (repositoryInfo != null && repositoryInfo.type === "github") {
                const resolvedPublishConfig = yield (0, (_publisher || _load_publisher()).getResolvedPublishConfig)(packager.info, { provider: repositoryInfo.type }, false);
                if (resolvedPublishConfig != null) {
                    return [resolvedPublishConfig];
                }
            }
        }
        return publishConfigs;
    });

    return function getPublishConfigsForUpdateInfo(_x2, _x3) {
        return _ref2.apply(this, arguments);
    };
})();

let writeUpdateInfo = (() => {
    var _ref3 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (event, _publishConfigs) {
        const packager = event.packager;
        const publishConfigs = yield getPublishConfigsForUpdateInfo(packager, _publishConfigs);
        if (publishConfigs == null || publishConfigs.length === 0) {
            return;
        }
        const target = event.target;
        let outDir = target.outDir;
        if (target.name.startsWith("nsis-")) {
            outDir = _path.join(outDir, target.name);
            yield (0, (_fsExtraP || _load_fsExtraP()).ensureDir)(outDir);
        }
        for (const publishConfig of publishConfigs) {
            const isGitHub = publishConfig.provider === "github";
            if (!(publishConfig.provider === "generic" || publishConfig.provider === "s3" || isGitHub)) {
                continue;
            }
            const version = packager.appInfo.version;
            const channel = publishConfig.channel || "latest";
            if (packager.platform === (_electronBuilderCore || _load_electronBuilderCore()).Platform.MAC) {
                const updateInfoFile = isGitHub ? _path.join(outDir, "github", `${channel}-mac.json`) : _path.join(outDir, `${channel}-mac.json`);
                yield (0, (_fsExtraP || _load_fsExtraP()).outputJson)(updateInfoFile, {
                    version: version,
                    releaseDate: new Date().toISOString(),
                    url: computeDownloadUrl(publishConfig, packager.generateName2("zip", "mac", isGitHub), packager, null)
                }, { spaces: 2 });
                packager.info.dispatchArtifactCreated({
                    file: updateInfoFile,
                    packager: packager,
                    target: null,
                    publishConfig: publishConfig
                });
            } else {
                yield writeWindowsUpdateInfo(event, version, outDir, channel, publishConfigs);
                break;
            }
        }
    });

    return function writeUpdateInfo(_x4, _x5) {
        return _ref3.apply(this, arguments);
    };
})();

let writeWindowsUpdateInfo = (() => {
    var _ref4 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (event, version, outDir, channel, publishConfigs) {
        const packager = event.packager;
        const sha2 = yield sha256(event.file);
        const updateInfoFile = _path.join(outDir, `${channel}.yml`);
        yield (0, (_fsExtraP || _load_fsExtraP()).writeFile)(updateInfoFile, (0, (_jsYaml || _load_jsYaml()).safeDump)({
            version: version,
            releaseDate: new Date().toISOString(),
            githubArtifactName: event.safeArtifactName,
            path: _path.basename(event.file),
            sha2: sha2
        }));
        const githubPublishConfig = publishConfigs.find(function (it) {
            return it.provider === "github";
        });
        if (githubPublishConfig != null) {
            // to preserve compatibility with old electron-updater (< 0.10.0), we upload file with path specific for GitHub
            packager.info.dispatchArtifactCreated({
                data: new Buffer((0, (_jsYaml || _load_jsYaml()).safeDump)({
                    version: version,
                    path: event.safeArtifactName,
                    sha2: sha2
                })),
                safeArtifactName: `${channel}.yml`,
                packager: packager,
                target: null,
                publishConfig: githubPublishConfig
            });
        }
        const genericPublishConfig = publishConfigs.find(function (it) {
            return it.provider === "generic" || it.provider === "s3";
        });
        if (genericPublishConfig != null) {
            packager.info.dispatchArtifactCreated({
                file: updateInfoFile,
                packager: packager,
                target: null,
                publishConfig: genericPublishConfig
            });
        }
    });

    return function writeWindowsUpdateInfo(_x6, _x7, _x8, _x9, _x10) {
        return _ref4.apply(this, arguments);
    };
})();

let getPublishConfigs = exports.getPublishConfigs = (() => {
    var _ref5 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (packager, targetSpecificOptions) {
        let publishers;
        // check build.nsis (target)
        if (targetSpecificOptions != null) {
            publishers = targetSpecificOptions.publish;
            // if explicitly set to null - do not publish
            if (publishers === null) {
                return null;
            }
        }
        // check build.win (platform)
        if (publishers == null) {
            publishers = packager.platformSpecificBuildOptions.publish;
            if (publishers === null) {
                return null;
            }
        }
        if (publishers == null) {
            publishers = packager.config.publish;
            if (publishers === null) {
                return null;
            }
        }
        if (publishers == null) {
            let serviceName = null;
            if (!(0, (_electronBuilderUtil || _load_electronBuilderUtil()).isEmptyOrSpaces)(process.env.GH_TOKEN)) {
                serviceName = "github";
            } else if (!(0, (_electronBuilderUtil || _load_electronBuilderUtil()).isEmptyOrSpaces)(process.env.BT_TOKEN)) {
                serviceName = "bintray";
            }
            if (serviceName != null) {
                (0, (_electronBuilderUtil || _load_electronBuilderUtil()).debug)(`Detect ${serviceName} as publish provider`);
                return [yield (0, (_publisher || _load_publisher()).getResolvedPublishConfig)(packager.info, { provider: serviceName })];
            }
        }
        if (publishers == null) {
            return [];
        }
        (0, (_electronBuilderUtil || _load_electronBuilderUtil()).debug)(`Explicit publish provider: ${JSON.stringify(publishers, null, 2)}`);
        return yield (_bluebirdLst2 || _load_bluebirdLst2()).default.map((0, (_electronBuilderUtil || _load_electronBuilderUtil()).asArray)(publishers), function (it) {
            return (0, (_publisher || _load_publisher()).getResolvedPublishConfig)(packager.info, typeof it === "string" ? { provider: it } : it);
        });
    });

    return function getPublishConfigs(_x11, _x12) {
        return _ref5.apply(this, arguments);
    };
})();

exports.createPublisher = createPublisher;
exports.computeDownloadUrl = computeDownloadUrl;

var _crypto;

function _load_crypto() {
    return _crypto = require("crypto");
}

var _electronBuilderCore;

function _load_electronBuilderCore() {
    return _electronBuilderCore = require("electron-builder-core");
}

var _publishOptions;

function _load_publishOptions() {
    return _publishOptions = require("electron-builder-http/out/publishOptions");
}

var _electronBuilderUtil;

function _load_electronBuilderUtil() {
    return _electronBuilderUtil = require("electron-builder-util");
}

var _log;

function _load_log() {
    return _log = require("electron-builder-util/out/log");
}

var _promise;

function _load_promise() {
    return _promise = require("electron-builder-util/out/promise");
}

var _BintrayPublisher;

function _load_BintrayPublisher() {
    return _BintrayPublisher = require("electron-publish/out/BintrayPublisher");
}

var _gitHubPublisher;

function _load_gitHubPublisher() {
    return _gitHubPublisher = require("electron-publish/out/gitHubPublisher");
}

var _multiProgress;

function _load_multiProgress() {
    return _multiProgress = require("electron-publish/out/multiProgress");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _isCi;

function _load_isCi() {
    return _isCi = _interopRequireDefault(require("is-ci"));
}

var _jsYaml;

function _load_jsYaml() {
    return _jsYaml = require("js-yaml");
}

var _path = _interopRequireWildcard(require("path"));

var _url;

function _load_url() {
    return _url = _interopRequireWildcard(require("url"));
}

var _publisher;

function _load_publisher() {
    return _publisher = require("./publisher");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PublishManager {
    constructor(packager, publishOptions, cancellationToken) {
        this.publishOptions = publishOptions;
        this.cancellationToken = cancellationToken;
        this.nameToPublisher = new Map();
        this.publishTasks = [];
        this.errors = [];
        this.isPublish = false;
        this.progress = process.stdout.isTTY ? new (_multiProgress || _load_multiProgress()).MultiProgress() : null;
        if (!isPullRequest()) {
            if (publishOptions.publish === undefined) {
                if (process.env.npm_lifecycle_event === "release") {
                    publishOptions.publish = "always";
                } else {
                    const tag = (0, (_publisher || _load_publisher()).getCiTag)();
                    if (tag != null) {
                        (0, (_log || _load_log()).log)(`Tag ${tag} is defined, so artifacts will be published`);
                        publishOptions.publish = "onTag";
                    } else if ((_isCi || _load_isCi()).default) {
                        (0, (_log || _load_log()).log)("CI detected, so artifacts will be published if draft release exists");
                        publishOptions.publish = "onTagOrDraft";
                    }
                }
            }
            if (publishOptions.publish != null && publishOptions.publish !== "never") {
                this.isPublish = publishOptions.publish !== "onTag" || (0, (_publisher || _load_publisher()).getCiTag)() != null;
            }
        } else if (publishOptions.publish !== "never") {
            (0, (_log || _load_log()).log)("Current build is a part of pull request, publishing will be skipped");
        }
        packager.addAfterPackHandler((() => {
            var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (event) {
                const packager = event.packager;
                if (event.electronPlatformName === "darwin") {
                    if (!event.targets.some(function (it) {
                        return it.name === "zip";
                    })) {
                        return;
                    }
                } else if (packager.platform === (_electronBuilderCore || _load_electronBuilderCore()).Platform.WINDOWS) {
                    if (!event.targets.some(function (it) {
                        return isSuitableWindowsTarget(it);
                    })) {
                        return;
                    }
                } else {
                    return;
                }
                const publishConfigs = yield getPublishConfigsForUpdateInfo(packager, (yield getPublishConfigs(packager, null)));
                if (publishConfigs == null || publishConfigs.length === 0) {
                    return;
                }
                let publishConfig = publishConfigs[0];
                if (publishConfig.url != null) {
                    publishConfig = Object.assign({}, publishConfig, {
                        url: packager.expandMacro(publishConfig.url, null)
                    });
                }
                if (packager.platform === (_electronBuilderCore || _load_electronBuilderCore()).Platform.WINDOWS) {
                    const publisherName = yield packager.computedPublisherName.value;
                    if (publisherName != null) {
                        publishConfig = Object.assign({ publisherName: publisherName }, publishConfig);
                    }
                }
                yield (0, (_fsExtraP || _load_fsExtraP()).writeFile)(_path.join(packager.getResourcesDir(event.appOutDir), "app-update.yml"), (0, (_jsYaml || _load_jsYaml()).safeDump)(publishConfig));
            });

            return function (_x) {
                return _ref.apply(this, arguments);
            };
        })());
        packager.artifactCreated(event => this.addTask(this.artifactCreated(event)));
    }
    artifactCreated(event) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const packager = event.packager;
            const target = event.target;
            const publishConfigs = event.publishConfig == null ? yield getPublishConfigs(packager, target == null ? null : packager.config[target.name]) : [event.publishConfig];
            const eventFile = event.file;
            if (publishConfigs == null) {
                if (_this.isPublish) {
                    (0, (_electronBuilderUtil || _load_electronBuilderUtil()).debug)(`${eventFile} is not published: no publish configs`);
                }
                return;
            }
            if (_this.isPublish) {
                for (const publishConfig of publishConfigs) {
                    if (_this.cancellationToken.cancelled) {
                        break;
                    }
                    const publisher = _this.getOrCreatePublisher(publishConfig, packager.info);
                    if (publisher != null) {
                        if (eventFile == null) {
                            _this.addTask(publisher.uploadData(event.data, event.safeArtifactName));
                        } else {
                            _this.addTask(publisher.upload(eventFile, event.safeArtifactName));
                        }
                    }
                }
            }
            if (target != null && eventFile != null && !_this.cancellationToken.cancelled) {
                if (packager.platform === (_electronBuilderCore || _load_electronBuilderCore()).Platform.MAC && target.name === "zip" || packager.platform === (_electronBuilderCore || _load_electronBuilderCore()).Platform.WINDOWS && isSuitableWindowsTarget(target) && eventFile.endsWith(".exe")) {
                    _this.addTask(writeUpdateInfo(event, publishConfigs));
                }
            }
        })();
    }
    addTask(promise) {
        if (this.cancellationToken.cancelled) {
            return;
        }
        this.publishTasks.push(promise.catch(it => this.errors.push(it)));
    }
    getOrCreatePublisher(publishConfig, buildInfo) {
        let publisher = this.nameToPublisher.get(publishConfig.provider);
        if (publisher == null) {
            publisher = createPublisher(this, buildInfo.metadata.version, publishConfig, this.publishOptions);
            this.nameToPublisher.set(publishConfig.provider, publisher);
            (0, (_log || _load_log()).log)(`Publishing to ${publisher}`);
        }
        return publisher;
    }
    cancelTasks() {
        for (const task of this.publishTasks) {
            if ("cancel" in task) {
                task.cancel();
            }
        }
        this.publishTasks.length = 0;
        this.nameToPublisher.clear();
    }
    awaitTasks() {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            if (_this2.errors.length > 0) {
                _this2.cancelTasks();
                (0, (_promise || _load_promise()).throwError)(_this2.errors);
                return;
            }
            const publishTasks = _this2.publishTasks;
            let list = publishTasks.slice();
            publishTasks.length = 0;
            while (list.length > 0) {
                yield (_bluebirdLst2 || _load_bluebirdLst2()).default.all(list);
                if (publishTasks.length === 0) {
                    break;
                } else {
                    list = publishTasks.slice();
                    publishTasks.length = 0;
                }
            }
        })();
    }
}
exports.PublishManager = PublishManager;
function createPublisher(context, version, publishConfig, options) {
    if (publishConfig.provider === "github") {
        return new (_gitHubPublisher || _load_gitHubPublisher()).GitHubPublisher(context, publishConfig, version, options);
    }
    if (publishConfig.provider === "bintray") {
        return new (_BintrayPublisher || _load_BintrayPublisher()).BintrayPublisher(context, publishConfig, version, options);
    }
    if (publishConfig.provider === "s3") {
        const clazz = require(`electron-publisher-${publishConfig.provider}`).default;
        return new clazz(context, publishConfig);
    }
    return null;
}
function computeDownloadUrl(publishConfig, fileName, packager, arch) {
    if (publishConfig.provider === "generic") {
        const baseUrlString = packager.expandMacro(publishConfig.url, arch);
        if (fileName == null) {
            return baseUrlString;
        }
        const baseUrl = (_url || _load_url()).parse(baseUrlString);
        return (_url || _load_url()).format(Object.assign({}, baseUrl, { pathname: _path.posix.resolve(baseUrl.pathname || "/", encodeURI(fileName)) }));
    }
    let baseUrl;
    if (publishConfig.provider === "s3") {
        baseUrl = packager.expandMacro((0, (_publishOptions || _load_publishOptions()).s3Url)(publishConfig), arch);
    } else {
        const gh = publishConfig;
        baseUrl = `${(0, (_publishOptions || _load_publishOptions()).githubUrl)(gh)}/${gh.owner}/${gh.repo}/releases/download/v${packager.appInfo.version}`;
    }
    if (fileName == null) {
        return baseUrl;
    }
    return `${baseUrl}/${encodeURI(fileName)}`;
}

function sha256(file) {
    return new (_bluebirdLst2 || _load_bluebirdLst2()).default((resolve, reject) => {
        const hash = (0, (_crypto || _load_crypto()).createHash)("sha256");
        hash.on("error", reject).setEncoding("hex");
        (0, (_fsExtraP || _load_fsExtraP()).createReadStream)(file).on("error", reject).on("end", () => {
            hash.end();
            resolve(hash.read());
        }).pipe(hash, { end: false });
    });
}
function isPullRequest() {
    // TRAVIS_PULL_REQUEST is set to the pull request number if the current job is a pull request build, or false if it’s not.
    function isSet(value) {
        // value can be or null, or empty string
        return value && value !== "false";
    }
    return isSet(process.env.TRAVIS_PULL_REQUEST) || isSet(process.env.CI_PULL_REQUEST) || isSet(process.env.CI_PULL_REQUESTS);
}
function isSuitableWindowsTarget(target) {
    return target.name === "nsis" || target.name.startsWith("nsis-");
}
//# sourceMappingURL=PublishManager.js.map