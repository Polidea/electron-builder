"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.githubUrl = githubUrl;
exports.s3Url = s3Url;
function githubUrl(options) {
    return `${options.protocol || "https"}://${options.host || "github.com"}`;
}
function s3Url(options) {
    let url = `https://${options.bucket}.s3.amazonaws.com`;
    if (options.path != null) {
        url += `/${options.path}`;
    }
    return url;
}
//# sourceMappingURL=publishOptions.js.map