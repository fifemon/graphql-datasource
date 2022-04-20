(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[14],{

/***/ "../node_modules/codemirror-graphql/hint.js":
/*!**************************************************!*\
  !*** ../node_modules/codemirror-graphql/hint.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var codemirror_1 = __importDefault(__webpack_require__(/*! codemirror */ "../node_modules/codemirror/lib/codemirror.js"));
__webpack_require__(/*! codemirror/addon/hint/show-hint */ "../node_modules/codemirror/addon/hint/show-hint.js");
var graphql_language_service_1 = __webpack_require__(/*! graphql-language-service */ "../node_modules/graphql-language-service/esm/index.js");
codemirror_1.default.registerHelper('hint', 'graphql', function (editor, options) {
    var schema = options.schema;
    if (!schema) {
        return;
    }
    var cur = editor.getCursor();
    var token = editor.getTokenAt(cur);
    var tokenStart = token.type !== null && /"|\w/.test(token.string[0])
        ? token.start
        : token.end;
    var position = new graphql_language_service_1.Position(cur.line, tokenStart);
    var rawResults = graphql_language_service_1.getAutocompleteSuggestions(schema, editor.getValue(), position, token, options.externalFragments);
    var results = {
        list: rawResults.map(function (item) { return ({
            text: item.label,
            type: item.type,
            description: item.documentation,
            isDeprecated: item.isDeprecated,
            deprecationReason: item.deprecationReason,
        }); }),
        from: { line: cur.line, ch: tokenStart },
        to: { line: cur.line, ch: token.end },
    };
    if (results && results.list && results.list.length > 0) {
        results.from = codemirror_1.default.Pos(results.from.line, results.from.ch);
        results.to = codemirror_1.default.Pos(results.to.line, results.to.ch);
        codemirror_1.default.signal(editor, 'hasCompletion', editor, results, token);
    }
    return results;
});
//# sourceMappingURL=hint.js.map

/***/ })

}]);
//# sourceMappingURL=14.js.map