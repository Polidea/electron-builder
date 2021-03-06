"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _electronBuilderCore;

function _load_electronBuilderCore() {
    return _electronBuilderCore = require("electron-builder-core");
}

var _electronBuilderUtil;

function _load_electronBuilderUtil() {
    return _electronBuilderUtil = require("electron-builder-util");
}

var _log;

function _load_log() {
    return _log = require("electron-builder-util/out/log");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _jsYaml;

function _load_jsYaml() {
    return _jsYaml = require("js-yaml");
}

var _os;

function _load_os() {
    return _os = require("os");
}

var _path = _interopRequireWildcard(require("path"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class SnapTarget extends (_electronBuilderCore || _load_electronBuilderCore()).Target {
    constructor(name, packager, helper, outDir) {
        super(name);
        this.packager = packager;
        this.helper = helper;
        this.outDir = outDir;
        this.options = Object.assign({}, this.packager.platformSpecificBuildOptions, this.packager.config[this.name]);
    }
    build(appOutDir, arch) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            (0, (_log || _load_log()).log)(`Building Snap for arch ${(_electronBuilderCore || _load_electronBuilderCore()).Arch[arch]}`);
            const packager = _this.packager;
            const appInfo = packager.appInfo;
            const options = _this.options;
            const stageDir = `${appOutDir}-snap`;
            const snapDir = _path.join(stageDir, "snap");
            yield (0, (_fsExtraP || _load_fsExtraP()).emptyDir)(stageDir);
            const extraSnapSourceDir = _path.join(stageDir, "extra");
            const isUseUbuntuPlatform = options.ubuntuAppPlatformContent != null;
            if (isUseUbuntuPlatform) {
                // ubuntu-app-platform requires empty directory
                yield (0, (_fsExtraP || _load_fsExtraP()).emptyDir)(_path.join(extraSnapSourceDir, "ubuntu-app-platform"));
            }
            const snap = {};
            snap.name = packager.executableName.toLowerCase();
            snap.version = appInfo.version;
            snap.summary = options.summary || appInfo.productName;
            snap.description = _this.helper.getDescription(options);
            snap.confinement = options.confinement || "strict";
            snap.grade = options.grade || "stable";
            yield _this.helper.icons;
            if (_this.helper.maxIconPath != null) {
                snap.icon = "snap/gui/icon.png";
                yield (0, (_fsExtraP || _load_fsExtraP()).copy)(_this.helper.maxIconPath, _path.join(snapDir, "gui", "icon.png"));
            }
            const desktopFile = yield _this.helper.computeDesktopEntry(_this.options, `${packager.executableName}`, _path.join(snapDir, "gui", `${snap.name}.desktop`), {
                "Icon": "${SNAP}/meta/gui/icon.png"
            });
            if (options.assumes != null) {
                if (!Array.isArray(options.assumes)) {
                    throw new Error("snap.assumes must be an array of strings");
                }
                snap.assumes = options.assumes;
            }
            snap.apps = {
                [snap.name]: {
                    command: `desktop-launch $SNAP/${packager.executableName}`,
                    plugs: (0, (_electronBuilderUtil || _load_electronBuilderUtil()).replaceDefault)(options.plugs, ["home", "x11", "unity7", "browser-support", "network", "gsettings", "pulseaudio", "opengl"])
                }
            };
            if (isUseUbuntuPlatform) {
                snap.apps[snap.name].plugs.push("platform");
                snap.plugs = {
                    platform: {
                        interface: "content",
                        content: "ubuntu-app-platform1",
                        target: "ubuntu-app-platform",
                        "default-provider": "ubuntu-app-platform"
                    }
                };
            }
            // libxss1, libasound2, gconf2 - was "error while loading shared libraries: libXss.so.1" on Xubuntu 16.04
            const isUseDocker = process.platform !== "linux";
            const defaultStagePackages = isUseUbuntuPlatform ? ["libnss3"] : ["libnotify4", "libappindicator1", "libxtst6", "libnss3", "libxss1", "fontconfig-config", "gconf2", "libasound2", "pulseaudio"];
            snap.parts = {
                app: {
                    plugin: "dump",
                    "stage-packages": (0, (_electronBuilderUtil || _load_electronBuilderUtil()).replaceDefault)(options.stagePackages, defaultStagePackages),
                    source: isUseDocker ? `/out/${_path.basename(appOutDir)}` : appOutDir,
                    after: isUseUbuntuPlatform ? ["extra", "desktop-ubuntu-app-platform"] : ["desktop-glib-only"]
                }
            };
            if (isUseUbuntuPlatform) {
                snap.parts.extra = {
                    plugin: "dump",
                    source: isUseDocker ? `/out/${_path.basename(stageDir)}/${_path.basename(extraSnapSourceDir)}` : extraSnapSourceDir
                };
            }
            if (packager.packagerOptions.effectiveOptionComputed != null && (yield packager.packagerOptions.effectiveOptionComputed({ snap, desktopFile }))) {
                return;
            }
            const snapcraft = _path.join(snapDir, "snapcraft.yaml");
            yield (0, (_fsExtraP || _load_fsExtraP()).outputFile)(snapcraft, (0, (_jsYaml || _load_jsYaml()).safeDump)(snap, { lineWidth: 160 }));
            const snapFileName = `${snap.name}_${snap.version}_${(0, (_electronBuilderCore || _load_electronBuilderCore()).toLinuxArchString)(arch)}.snap`;
            const resultFile = _path.join(_this.outDir, snapFileName);
            if (isUseDocker) {
                yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).spawn)("docker", ["run", "--rm", "-v", `${packager.info.projectDir}:/project`, "-v", `${(0, (_os || _load_os()).homedir)()}/.electron:/root/.electron`,
                // dist dir can be outside of project dir
                "-v", `${_this.outDir}:/out`, "electronuserland/electron-builder:latest", "/bin/bash", "-c", `snapcraft --version && cp -R /out/${_path.basename(stageDir)} /s/ && cd /s && snapcraft snap --target-arch ${(0, (_electronBuilderCore || _load_electronBuilderCore()).toLinuxArchString)(arch)} -o /out/${snapFileName}`], {
                    cwd: packager.info.projectDir,
                    stdio: ["ignore", "inherit", "inherit"]
                });
            } else {
                yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).spawn)("snapcraft", ["snap", "--target-arch", (0, (_electronBuilderCore || _load_electronBuilderCore()).toLinuxArchString)(arch), "-o", resultFile], {
                    cwd: stageDir,
                    stdio: ["ignore", "inherit", "pipe"]
                });
            }
            packager.dispatchArtifactCreated(resultFile, _this);
        })();
    }
}
exports.default = SnapTarget; //# sourceMappingURL=snap.js.map