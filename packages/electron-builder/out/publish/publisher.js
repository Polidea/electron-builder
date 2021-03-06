"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getResolvedPublishConfig = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

let getResolvedPublishConfig = exports.getResolvedPublishConfig = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (packager, publishConfig) {
        let getInfo = (() => {
            var _ref2 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
                const info = yield packager.repositoryInfo;
                if (info != null) {
                    return info;
                }
                const message = `Cannot detect repository by .git/config. Please specify "repository" in the package.json (https://docs.npmjs.com/files/package.json#repository).\nPlease see https://github.com/electron-userland/electron-builder/wiki/Publishing-Artifacts`;
                if (errorIfCannot) {
                    throw new Error(message);
                } else {
                    (0, (_log || _load_log()).warn)(message);
                    return null;
                }
            });

            return function getInfo() {
                return _ref2.apply(this, arguments);
            };
        })();

        let errorIfCannot = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        const provider = publishConfig.provider;
        if (provider === "generic") {
            if (publishConfig.url == null) {
                throw new Error(`Please specify "url" for "generic" update server`);
            }
            return publishConfig;
        }
        if (provider === "s3") {
            if (publishConfig.bucket == null) {
                throw new Error(`Please specify "bucket" for "s3" update server`);
            }
            return publishConfig;
        }

        let owner = publishConfig.owner;
        let project = provider === "github" ? publishConfig.repo : publishConfig.package;
        if (provider === "github" && owner == null && project != null) {
            const index = project.indexOf("/");
            if (index > 0) {
                const repo = project;
                project = repo.substring(0, index);
                owner = repo.substring(index + 1);
            }
        }
        if (!owner || !project) {
            const info = yield getInfo();
            if (info == null) {
                return null;
            }
            if (!owner) {
                owner = info.user;
            }
            if (!project) {
                project = info.project;
            }
        }
        if (provider === "github") {
            return Object.assign({ owner, repo: project }, publishConfig);
        } else if (provider === "bintray") {
            return Object.assign({ owner, package: project }, publishConfig);
        } else {
            throw new Error(`Unknown publish provider: ${provider}`);
        }
    });

    return function getResolvedPublishConfig(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

exports.getCiTag = getCiTag;

var _log;

function _load_log() {
    return _log = require("electron-builder-util/out/log");
}

function getCiTag() {
    const tag = process.env.TRAVIS_TAG || process.env.APPVEYOR_REPO_TAG_NAME || process.env.CIRCLE_TAG || process.env.CI_BUILD_TAG;
    return tag != null && tag.length > 0 ? tag : null;
}
//# sourceMappingURL=publisher.js.map