"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.checkFileInArchive = exports.createAsarArchive = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

let createAsarArchive = exports.createAsarArchive = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (src, resourcesPath, options, filter, unpackPattern) {
        // sort files to minimize file change (i.e. asar file is not changed dramatically on small change)
        yield new AsarPackager(src, resourcesPath, options, unpackPattern).pack(filter);
    });

    return function createAsarArchive(_x, _x2, _x3, _x4, _x5) {
        return _ref.apply(this, arguments);
    };
})();

let checkFileInArchive = exports.checkFileInArchive = (() => {
    var _ref3 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (asarFile, relativeFile, messagePrefix) {
        function error(text) {
            return new Error(`${messagePrefix} "${relativeFile}" in the "${asarFile}" ${text}`);
        }
        let fs;
        try {
            fs = yield (0, (_asar || _load_asar()).readAsar)(asarFile);
        } catch (e) {
            throw error(`is corrupted: ${e}`);
        }
        let stat;
        try {
            stat = fs.getFile(relativeFile);
        } catch (e) {
            const fileStat = yield (0, (_fs || _load_fs()).statOrNull)(asarFile);
            if (fileStat == null) {
                throw error(`does not exist. Seems like a wrong configuration.`);
            }
            // asar throws error on access to undefined object (info.link)
            stat = null;
        }
        if (stat == null) {
            throw error(`does not exist. Seems like a wrong configuration.`);
        }
        if (stat.size === 0) {
            throw error(`is corrupted: size 0`);
        }
    });

    return function checkFileInArchive(_x7, _x8, _x9) {
        return _ref3.apply(this, arguments);
    };
})();
//# sourceMappingURL=asarUtil.js.map


var _electronBuilderUtil;

function _load_electronBuilderUtil() {
    return _electronBuilderUtil = require("electron-builder-util");
}

var _deepAssign;

function _load_deepAssign() {
    return _deepAssign = require("electron-builder-util/out/deepAssign");
}

var _fs;

function _load_fs() {
    return _fs = require("electron-builder-util/out/fs");
}

var _log;

function _load_log() {
    return _log = require("electron-builder-util/out/log");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _path = _interopRequireWildcard(require("path"));

var _asar;

function _load_asar() {
    return _asar = require("./asar");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const isBinaryFile = (_bluebirdLst2 || _load_bluebirdLst2()).default.promisify(require("isbinaryfile"));
const pickle = require("chromium-pickle-js");
const NODE_MODULES_PATTERN = `${_path.sep}node_modules${_path.sep}`;

function addValue(map, key, value) {
    let list = map.get(key);
    if (list == null) {
        list = [value];
        map.set(key, list);
    } else {
        list.push(value);
    }
}
function writeUnpackedFiles(filesToUnpack, fileCopier) {
    return (_bluebirdLst2 || _load_bluebirdLst2()).default.map(filesToUnpack, it => {
        if (it.data == null) {
            return fileCopier.copy(it.src, it.destination, it.stats);
        } else {
            return (0, (_fsExtraP || _load_fsExtraP()).writeFile)(it.destination, it.data);
        }
    });
}
class AsarPackager {
    constructor(src, destination, options, unpackPattern) {
        this.src = src;
        this.options = options;
        this.unpackPattern = unpackPattern;
        this.toPack = [];
        this.fs = new (_asar || _load_asar()).AsarFilesystem(this.src);
        this.changedFiles = new Map();
        this.outFile = _path.join(destination, "app.asar");
    }
    pack(filter) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const metadata = new Map();
            const files = yield (0, (_fs || _load_fs()).walk)(_this.src, filter, function (file, fileStat) {
                metadata.set(file, fileStat);
                if (fileStat.isSymbolicLink()) {
                    return (0, (_fsExtraP || _load_fsExtraP()).readlink)(file).then(function (linkTarget) {
                        // http://unix.stackexchange.com/questions/105637/is-symlinks-target-relative-to-the-destinations-parent-directory-and-if-so-wh
                        const resolved = _path.resolve(_path.dirname(file), linkTarget);
                        const link = _path.relative(_this.src, linkTarget);
                        if (link.startsWith("..")) {
                            // outside of project, linked module (https://github.com/electron-userland/electron-builder/issues/675)
                            return (0, (_fsExtraP || _load_fsExtraP()).stat)(resolved).then(function (targetFileStat) {
                                metadata.set(file, targetFileStat);
                                return targetFileStat;
                            });
                        } else {
                            fileStat.relativeLink = link;
                        }
                        return null;
                    });
                }
                return null;
            });
            yield _this.createPackageFromFiles(_this.options.ordering == null ? files : yield _this.order(files), metadata);
            yield _this.writeAsarFile();
        })();
    }
    detectUnpackedDirs(files, metadata, autoUnpackDirs, unpackedDest, fileIndexToModulePackageData) {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const packageJsonStringLength = "package.json".length;
            const dirToCreate = new Map();
            /* tslint:disable:rule1 prefer-const */
            for (let i = 0, n = files.length; i < n; i++) {
                const file = files[i];
                const index = file.lastIndexOf(NODE_MODULES_PATTERN);
                if (index < 0) {
                    continue;
                }
                const nextSlashIndex = file.indexOf(_path.sep, index + NODE_MODULES_PATTERN.length + 1);
                if (nextSlashIndex < 0) {
                    continue;
                }
                if (!metadata.get(file).isFile()) {
                    continue;
                }
                const nodeModuleDir = file.substring(0, nextSlashIndex);
                if (file.length === nodeModuleDir.length + 1 + packageJsonStringLength && file.endsWith("package.json")) {
                    fileIndexToModulePackageData.set(i, (0, (_fsExtraP || _load_fsExtraP()).readJson)(file).then(function (it) {
                        return cleanupPackageJson(it);
                    }));
                }
                if (autoUnpackDirs.has(nodeModuleDir)) {
                    const fileParent = _path.dirname(file);
                    if (fileParent !== nodeModuleDir && !autoUnpackDirs.has(fileParent)) {
                        autoUnpackDirs.add(fileParent);
                        addValue(dirToCreate, _path.relative(_this2.src, nodeModuleDir), _path.relative(nodeModuleDir, fileParent));
                    }
                    continue;
                }
                const ext = _path.extname(file);
                let shouldUnpack = false;
                if (ext === ".dll" || ext === ".exe") {
                    shouldUnpack = true;
                } else if (ext === "") {
                    shouldUnpack = yield isBinaryFile(file);
                }
                if (!shouldUnpack) {
                    continue;
                }
                (0, (_electronBuilderUtil || _load_electronBuilderUtil()).debug)(`${_path.relative(_this2.src, nodeModuleDir)} is not packed into asar archive - contains executable code`);
                let fileParent = _path.dirname(file);
                // create parent dir to be able to copy file later without directory existence check
                addValue(dirToCreate, _path.relative(_this2.src, nodeModuleDir), _path.relative(nodeModuleDir, fileParent));
                while (fileParent !== nodeModuleDir) {
                    autoUnpackDirs.add(fileParent);
                    fileParent = _path.dirname(fileParent);
                }
                autoUnpackDirs.add(nodeModuleDir);
            }
            if (fileIndexToModulePackageData.size > 0) {
                yield (_bluebirdLst2 || _load_bluebirdLst2()).default.all(fileIndexToModulePackageData.values());
            }
            if (dirToCreate.size > 0) {
                // child directories should be not created asynchronously - parent directories should be created first
                yield (_bluebirdLst2 || _load_bluebirdLst2()).default.map(dirToCreate.keys(), (() => {
                    var _ref2 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (it) {
                        const base = _path.join(unpackedDest, it);
                        yield (0, (_fsExtraP || _load_fsExtraP()).ensureDir)(base);
                        yield (_bluebirdLst2 || _load_bluebirdLst2()).default.each(dirToCreate.get(it), function (it) {
                            return (0, (_fsExtraP || _load_fsExtraP()).ensureDir)(_path.join(base, it));
                        });
                    });

                    return function (_x6) {
                        return _ref2.apply(this, arguments);
                    };
                })(), (_fs || _load_fs()).CONCURRENCY);
            }
        })();
    }
    createPackageFromFiles(files, metadata) {
        var _this3 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            // search auto unpacked dir
            const unpackedDirs = new Set();
            const unpackedDest = `${_this3.outFile}.unpacked`;
            const fileIndexToModulePackageData = new Map();
            yield (0, (_fsExtraP || _load_fsExtraP()).ensureDir)(_path.dirname(_this3.outFile));
            if (_this3.options.smartUnpack !== false) {
                yield _this3.detectUnpackedDirs(files, metadata, unpackedDirs, unpackedDest, fileIndexToModulePackageData);
            }
            const dirToCreateForUnpackedFiles = new Set(unpackedDirs);
            const filesToUnpack = [];
            const mainPackageJson = _path.join(_this3.src, "package.json");
            const fileCopier = new (_fs || _load_fs()).FileCopier();
            /* tslint:disable:rule1 prefer-const */
            for (let i = 0, n = files.length; i < n; i++) {
                const file = files[i];
                const stat = metadata.get(file);
                if (stat.isFile()) {
                    const fileParent = _path.dirname(file);
                    const dirNode = _this3.fs.getOrCreateNode(fileParent);
                    const packageDataPromise = fileIndexToModulePackageData.get(i);
                    let newData = null;
                    if (packageDataPromise == null) {
                        if (file === mainPackageJson) {
                            const mainPackageData = yield (0, (_fsExtraP || _load_fsExtraP()).readJson)(file);
                            if (_this3.options.extraMetadata != null) {
                                (0, (_deepAssign || _load_deepAssign()).deepAssign)(mainPackageData, _this3.options.extraMetadata);
                            }
                            // https://github.com/electron-userland/electron-builder/issues/1212
                            const serializedDataIfChanged = cleanupPackageJson(mainPackageData);
                            if (serializedDataIfChanged != null) {
                                newData = serializedDataIfChanged;
                            } else if (_this3.options.extraMetadata != null) {
                                newData = JSON.stringify(mainPackageData, null, 2);
                            }
                        }
                    } else {
                        newData = packageDataPromise.value();
                    }
                    const fileSize = newData == null ? stat.size : Buffer.byteLength(newData);
                    const node = _this3.fs.getOrCreateNode(file);
                    node.size = fileSize;
                    if (dirNode.unpacked || _this3.unpackPattern != null && _this3.unpackPattern(file, stat)) {
                        node.unpacked = true;
                        if (!dirNode.unpacked && !dirToCreateForUnpackedFiles.has(fileParent)) {
                            dirToCreateForUnpackedFiles.add(fileParent);
                            yield (0, (_fsExtraP || _load_fsExtraP()).ensureDir)(fileParent.replace(_this3.src, unpackedDest));
                        }
                        const unpackedFile = file.replace(_this3.src, unpackedDest);
                        filesToUnpack.push(newData == null ? { src: file, destination: unpackedFile, stats: stat } : { destination: unpackedFile, data: newData, stats: stat });
                        if (filesToUnpack.length > (_fs || _load_fs()).MAX_FILE_REQUESTS) {
                            yield writeUnpackedFiles(filesToUnpack, fileCopier);
                            filesToUnpack.length = 0;
                        }
                    } else {
                        if (newData != null) {
                            _this3.changedFiles.set(file, newData);
                        }
                        _this3.fs.insertFileNode(node, stat, file);
                        _this3.toPack.push(file);
                    }
                } else if (stat.isDirectory()) {
                    let unpacked = false;
                    if (unpackedDirs.has(file)) {
                        unpacked = true;
                    } else {
                        for (const dir of unpackedDirs) {
                            if (file.length > dir.length + 2 && file[dir.length] === _path.sep && file.startsWith(dir)) {
                                unpacked = true;
                                unpackedDirs.add(file);
                                // not all dirs marked as unpacked after first iteration - because node module dir can be marked as unpacked after processing node module dir content
                                // e.g. node-notifier/example/advanced.js processed, but only on process vendor/terminal-notifier.app module will be marked as unpacked
                                yield (0, (_fsExtraP || _load_fsExtraP()).ensureDir)(file.replace(_this3.src, unpackedDest));
                                break;
                            }
                        }
                    }
                    _this3.fs.insertDirectory(file, unpacked);
                } else if (stat.isSymbolicLink()) {
                    _this3.fs.getOrCreateNode(file).link = stat.relativeLink;
                }
            }
            if (filesToUnpack.length > 0) {
                yield writeUnpackedFiles(filesToUnpack, fileCopier);
            }
        })();
    }
    writeAsarFile() {
        const headerPickle = pickle.createEmpty();
        headerPickle.writeString(JSON.stringify(this.fs.header));
        const headerBuf = headerPickle.toBuffer();
        const sizePickle = pickle.createEmpty();
        sizePickle.writeUInt32(headerBuf.length);
        const sizeBuf = sizePickle.toBuffer();
        const writeStream = (0, (_fsExtraP || _load_fsExtraP()).createWriteStream)(this.outFile);
        return new (_bluebirdLst2 || _load_bluebirdLst2()).default((resolve, reject) => {
            writeStream.on("error", reject);
            writeStream.on("close", resolve);
            writeStream.write(sizeBuf);
            let w;
            w = (list, index) => {
                if (list.length === index) {
                    writeStream.end();
                    return;
                }
                const file = list[index];
                const data = this.changedFiles.get(file);
                if (data != null) {
                    writeStream.write(data, () => w(list, index + 1));
                    return;
                }
                const readStream = (0, (_fsExtraP || _load_fsExtraP()).createReadStream)(file);
                readStream.on("error", reject);
                readStream.once("end", () => w(list, index + 1));
                readStream.pipe(writeStream, {
                    end: false
                });
            };
            writeStream.write(headerBuf, () => w(this.toPack, 0));
        });
    }
    order(filenames) {
        var _this4 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const orderingFiles = (yield (0, (_fsExtraP || _load_fsExtraP()).readFile)(_this4.options.ordering, "utf8")).split("\n").map(function (line) {
                if (line.indexOf(":") !== -1) {
                    line = line.split(":").pop();
                }
                line = line.trim();
                if (line[0] === "/") {
                    line = line.slice(1);
                }
                return line;
            });
            const ordering = [];
            for (const file of orderingFiles) {
                const pathComponents = file.split(_path.sep);
                let str = _this4.src;
                for (const pathComponent of pathComponents) {
                    str = _path.join(str, pathComponent);
                    ordering.push(str);
                }
            }
            const filenamesSorted = [];
            let missing = 0;
            const total = filenames.length;
            for (const file of ordering) {
                if (!(filenamesSorted.indexOf(file) !== -1) && filenames.indexOf(file) !== -1) {
                    filenamesSorted.push(file);
                }
            }
            for (const file of filenames) {
                if (!(filenamesSorted.indexOf(file) !== -1)) {
                    filenamesSorted.push(file);
                    missing += 1;
                }
            }
            (0, (_log || _load_log()).log)(`Ordering file has ${(total - missing) / total * 100}% coverage.`);
            return filenamesSorted;
        })();
    }
}
function cleanupPackageJson(data) {
    try {
        let changed = false;
        for (const prop of Object.getOwnPropertyNames(data)) {
            if (prop[0] === "_" || prop === "dist" || prop === "gitHead" || prop === "keywords" || prop === "build" || prop === "devDependencies" || prop === "scripts") {
                delete data[prop];
                changed = true;
            }
        }
        if (changed) {
            return JSON.stringify(data, null, 2);
        }
    } catch (e) {
        (0, (_electronBuilderUtil || _load_electronBuilderUtil()).debug)(e);
    }
    return null;
}