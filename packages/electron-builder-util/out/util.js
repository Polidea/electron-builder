"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Lazy = exports.tmpDirCounter = exports.computeDefaultAppDirectory = exports.debug7z = exports.debug = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

let computeDefaultAppDirectory = exports.computeDefaultAppDirectory = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (projectDir, userAppDir) {
        if (userAppDir != null) {
            const absolutePath = _path.resolve(projectDir, userAppDir);
            const stat = yield (0, (_fs || _load_fs()).statOrNull)(absolutePath);
            if (stat == null) {
                throw new Error(`Application directory ${userAppDir} doesn't exists`);
            } else if (!stat.isDirectory()) {
                throw new Error(`Application directory ${userAppDir} is not a directory`);
            } else if (projectDir === absolutePath) {
                (0, (_log || _load_log()).warn)(`Specified application directory "${userAppDir}" equals to project dir — superfluous or wrong configuration`);
            }
            return absolutePath;
        }
        for (const dir of DEFAULT_APP_DIR_NAMES) {
            const absolutePath = _path.join(projectDir, dir);
            const packageJson = _path.join(absolutePath, "package.json");
            const stat = yield (0, (_fs || _load_fs()).statOrNull)(packageJson);
            if (stat != null && stat.isFile()) {
                return absolutePath;
            }
        }
        return projectDir;
    });

    return function computeDefaultAppDirectory(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

exports.removePassword = removePassword;
exports.execWine = execWine;
exports.prepareArgs = prepareArgs;
exports.exec = exec;
exports.doSpawn = doSpawn;
exports.spawn = spawn;
exports.handleProcess = handleProcess;
exports.use = use;
exports.debug7zArgs = debug7zArgs;
exports.getTempName = getTempName;
exports.isEmptyOrSpaces = isEmptyOrSpaces;
exports.asArray = asArray;
exports.getCacheDirectory = getCacheDirectory;
exports.smarten = smarten;
exports.addValue = addValue;
exports.replaceDefault = replaceDefault;
exports.getPlatformIconFileName = getPlatformIconFileName;

var _chalk;

function _load_chalk() {
    return _chalk = require("chalk");
}

var _child_process;

function _load_child_process() {
    return _child_process = require("child_process");
}

var _crypto;

function _load_crypto() {
    return _crypto = require("crypto");
}

var _debug2;

function _load_debug() {
    return _debug2 = _interopRequireDefault(require("debug"));
}

var _os;

function _load_os() {
    return _os = require("os");
}

var _path = _interopRequireWildcard(require("path"));

require("source-map-support/register");

var _fs;

function _load_fs() {
    return _fs = require("./fs");
}

var _log;

function _load_log() {
    return _log = require("./log");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

const debug = exports.debug = (0, (_debug2 || _load_debug()).default)("electron-builder");
const debug7z = exports.debug7z = (0, (_debug2 || _load_debug()).default)("electron-builder:7z");
const DEFAULT_APP_DIR_NAMES = ["app", "www"];
function removePassword(input) {
    return input.replace(/(-P |pass:| \/p|-pass )([^ ]+)/g, function (match, p1, p2) {
        return `${p1}${(0, (_crypto || _load_crypto()).createHash)("sha256").update(p2).digest("hex")} (sha256 hash)`;
    });
}
function execWine(file, args, options) {
    return exec(process.platform === "win32" ? file : "wine", prepareArgs(args, file), options);
}
function prepareArgs(args, exePath) {
    if (process.platform !== "win32") {
        args.unshift(exePath);
    }
    return args;
}
function exec(file, args, options) {
    if (debug.enabled) {
        debug(`Executing ${file} ${args == null ? "" : removePassword(args.join(" "))}`);
    }
    return new (_bluebirdLst2 || _load_bluebirdLst2()).default((resolve, reject) => {
        (0, (_child_process || _load_child_process()).execFile)(file, args, options, function (error, stdout, stderr) {
            if (error == null) {
                if (debug.enabled) {
                    if (stderr.length !== 0) {
                        (0, (_log || _load_log()).log)(stderr);
                    }
                    if (stdout.length !== 0) {
                        (0, (_log || _load_log()).log)(stdout);
                    }
                }
                resolve(stdout);
            } else {
                let message = (0, (_chalk || _load_chalk()).red)(removePassword(`Exit code: ${error.code}. ${error.message}`));
                if (stdout.length !== 0) {
                    message += `\n${(0, (_chalk || _load_chalk()).yellow)(stdout)}`;
                }
                if (stderr.length !== 0) {
                    message += `\n${(0, (_chalk || _load_chalk()).red)(stderr)}`;
                }
                reject(new Error(message));
            }
        });
    });
}
function doSpawn(command, args, options, pipeInput) {
    if (options == null) {
        options = {};
    }
    if (options.stdio == null) {
        options.stdio = [pipeInput ? "pipe" : "ignore", debug.enabled ? "inherit" : "pipe", "pipe"];
    }
    if (debug.enabled) {
        const argsString = args.join(" ");
        debug(`Spawning ${command} ${command === "docker" ? argsString : removePassword(argsString)}`);
    }
    return (0, (_child_process || _load_child_process()).spawn)(command, args, options);
}
function spawn(command, args, options) {
    return new (_bluebirdLst2 || _load_bluebirdLst2()).default((resolve, reject) => {
        handleProcess("close", doSpawn(command, args || [], options), command, resolve, reject);
    });
}
function handleProcess(event, childProcess, command, resolve, reject) {
    childProcess.on("error", reject);
    let out = "";
    if (!debug.enabled && childProcess.stdout != null) {
        childProcess.stdout.on("data", data => {
            out += data;
        });
    }
    let errorOut = "";
    if (childProcess.stderr != null) {
        childProcess.stderr.on("data", data => {
            errorOut += data;
        });
    }
    childProcess.once(event, code => {
        if (code === 0 && debug.enabled) {
            debug(`${command} (${childProcess.pid}) exited with code ${code}`);
        }
        if (code !== 0) {
            function formatOut(text, title) {
                if (text.length === 0) {
                    return "";
                } else {
                    return `\n${title}:\n${text}`;
                }
            }
            reject(new Error(`${command} exited with code ${code}${formatOut(out, "Output")}${formatOut(errorOut, "Error output")}`));
        } else if (resolve != null) {
            resolve();
        }
    });
}
function use(value, task) {
    return value == null ? null : task(value);
}
function debug7zArgs(command) {
    const args = [command, "-bd"];
    if (debug7z.enabled) {
        args.push("-bb3");
    } else if (!debug.enabled) {
        args.push("-bb0");
    }
    return args;
}
let tmpDirCounter = exports.tmpDirCounter = 0;
// add date to avoid use stale temp dir
const tempDirPrefix = `${process.pid.toString(16)}-${Date.now().toString(16)}`;
function getTempName(prefix) {
    return `${prefix == null ? "" : `${prefix}-`}${tempDirPrefix}-${(exports.tmpDirCounter = tmpDirCounter += 1, tmpDirCounter - 1).toString(16)}`;
}
function isEmptyOrSpaces(s) {
    return s == null || s.trim().length === 0;
}
function asArray(v) {
    if (v == null) {
        return [];
    } else if (Array.isArray(v)) {
        return v;
    } else {
        return [v];
    }
}
function getCacheDirectory() {
    if (process.platform === "darwin") {
        return _path.join((0, (_os || _load_os()).homedir)(), "Library", "Caches", "electron-builder");
    }
    const localappdata = process.env.LOCALAPPDATA;
    if (process.platform === "win32" && localappdata != null) {
        // https://github.com/electron-userland/electron-builder/issues/1164
        if (localappdata.indexOf("\\Windows\\System32\\") !== -1 || process.env.USERNAME === "SYSTEM") {
            return _path.join((0, (_os || _load_os()).tmpdir)(), "electron-builder-cache");
        }
        return _path.join(localappdata, "electron-builder", "cache");
    }
    return _path.join((0, (_os || _load_os()).homedir)(), ".cache", "electron-builder");
}
// fpm bug - rpm build --description is not escaped, well... decided to replace quite to smart quote
// http://leancrew.com/all-this/2010/11/smart-quotes-in-javascript/
function smarten(s) {
    // opening singles
    s = s.replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018");
    // closing singles & apostrophes
    s = s.replace(/'/g, "\u2019");
    // opening doubles
    s = s.replace(/(^|[-\u2014/\[(\u2018\s])"/g, "$1\u201c");
    // closing doubles
    s = s.replace(/"/g, "\u201d");
    return s;
}
class Lazy {
    constructor(creator) {
        this.creator = creator;
    }
    get value() {
        if (this.creator == null) {
            return this._value;
        }
        this._value = this.creator();
        this.creator = null;
        return this._value;
    }
}
exports.Lazy = Lazy;
function addValue(map, key, value) {
    const list = map.get(key);
    if (list == null) {
        map.set(key, [value]);
    } else if (!(list.indexOf(value) !== -1)) {
        list.push(value);
    }
}
function replaceDefault(inList, defaultList) {
    if (inList == null) {
        return defaultList;
    }
    const index = inList.indexOf("default");
    if (index >= 0) {
        let list = inList.slice(0, index);
        list.push.apply(list, _toConsumableArray(defaultList));
        if (index != inList.length - 1) {
            list.push.apply(list, _toConsumableArray(inList.slice(index + 1)));
        }
        inList = list;
    }
    return inList;
}
function getPlatformIconFileName(value, isMac) {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    if (!(value.indexOf(".") !== -1)) {
        return `${value}.${isMac ? "icns" : "ico"}`;
    }
    return value.replace(isMac ? ".ico" : ".icns", isMac ? ".icns" : ".ico");
}
//# sourceMappingURL=util.js.map