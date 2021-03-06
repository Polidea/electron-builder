"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.NoOpTarget = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

exports.computeArchToTargetNamesMap = computeArchToTargetNamesMap;
exports.createTargets = createTargets;
exports.createCommonTarget = createCommonTarget;

var _electronBuilderCore;

function _load_electronBuilderCore() {
    return _electronBuilderCore = require("electron-builder-core");
}

var _electronBuilderUtil;

function _load_electronBuilderUtil() {
    return _electronBuilderUtil = require("electron-builder-util");
}

var _ArchiveTarget;

function _load_ArchiveTarget() {
    return _ArchiveTarget = require("./ArchiveTarget");
}

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

const archiveTargets = new Set(["zip", "7z", "tar.xz", "tar.lz", "tar.gz", "tar.bz2"]);
function computeArchToTargetNamesMap(raw, options, platform) {
    const result = new Map(raw);
    const defaultArch = platform === (_electronBuilderCore || _load_electronBuilderCore()).Platform.MAC ? "x64" : process.arch;
    for (const target of (0, (_electronBuilderUtil || _load_electronBuilderUtil()).asArray)(options.target).map(it => typeof it === "string" ? { target: it } : it)) {
        let name = target.target;
        let archs = target.arch;
        const suffixPos = name.lastIndexOf(":");
        if (suffixPos > 0) {
            name = target.target.substring(0, suffixPos);
            if (archs == null) {
                archs = target.target.substring(suffixPos + 1);
            }
        }
        for (const arch of (0, (_electronBuilderUtil || _load_electronBuilderUtil()).asArray)(archs || defaultArch)) {
            (0, (_electronBuilderUtil || _load_electronBuilderUtil()).addValue)(result, (0, (_electronBuilderCore || _load_electronBuilderCore()).archFromString)(arch), name);
        }
    }
    if (result.size === 0) {
        result.set((0, (_electronBuilderCore || _load_electronBuilderCore()).archFromString)(defaultArch), []);
    }
    return result;
}
function createTargets(nameToTarget, rawList, outDir, packager, cleanupTasks) {
    const result = [];
    const mapper = (name, factory) => {
        let target = nameToTarget.get(name);
        if (target == null) {
            target = factory(outDir);
            nameToTarget.set(name, target);
        }
        result.push(target);
    };
    const targets = normalizeTargets(rawList, packager.defaultTarget);
    packager.createTargets(targets, mapper, cleanupTasks);
    return result;
}
function normalizeTargets(targets, defaultTarget) {
    const list = [];
    for (const t of targets) {
        const name = t.toLowerCase().trim();
        if (name === (_electronBuilderCore || _load_electronBuilderCore()).DEFAULT_TARGET) {
            list.push.apply(list, _toConsumableArray(defaultTarget));
        } else {
            list.push(name);
        }
    }
    return list;
}
function createCommonTarget(target, outDir, packager) {
    if (archiveTargets.has(target)) {
        return new (_ArchiveTarget || _load_ArchiveTarget()).ArchiveTarget(target, outDir, packager);
    } else if (target === (_electronBuilderCore || _load_electronBuilderCore()).DIR_TARGET) {
        return new NoOpTarget((_electronBuilderCore || _load_electronBuilderCore()).DIR_TARGET);
    } else {
        throw new Error(`Unknown target: ${target}`);
    }
}
class NoOpTarget extends (_electronBuilderCore || _load_electronBuilderCore()).Target {
    get outDir() {
        throw new Error("NoOpTarget");
    }
    build(appOutDir, arch) {
        // no build

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {})();
    }
}
exports.NoOpTarget = NoOpTarget; //# sourceMappingURL=targetFactory.js.map