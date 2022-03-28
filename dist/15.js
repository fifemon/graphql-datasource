(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[15],{

/***/ "../node_modules/codemirror-graphql/lint.js":
/*!**************************************************!*\
  !*** ../node_modules/codemirror-graphql/lint.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var codemirror_1 = __importDefault(__webpack_require__(/*! codemirror */ "../node_modules/codemirror/lib/codemirror.js"));
var graphql_language_service_1 = __webpack_require__(/*! graphql-language-service */ "../node_modules/graphql-language-service/esm/index.js");
var SEVERITY = ['error', 'warning', 'information', 'hint'];
var TYPE = {
    'GraphQL: Validation': 'validation',
    'GraphQL: Deprecation': 'deprecation',
    'GraphQL: Syntax': 'syntax',
};
codemirror_1.default.registerHelper('lint', 'graphql', function (text, options) {
    var schema = options.schema;
    var rawResults = graphql_language_service_1.getDiagnostics(text, schema, options.validationRules, undefined, options.externalFragments);
    var results = rawResults.map(function (error) { return ({
        message: error.message,
        severity: error.severity ? SEVERITY[error.severity - 1] : SEVERITY[0],
        type: error.source ? TYPE[error.source] : undefined,
        from: codemirror_1.default.Pos(error.range.start.line, error.range.start.character),
        to: codemirror_1.default.Pos(error.range.end.line, error.range.end.character),
    }); });
    return results;
});
//# sourceMappingURL=lint.js.map

/***/ })

}]);
//# sourceMappingURL=15.js.map