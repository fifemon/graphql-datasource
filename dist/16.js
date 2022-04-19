(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[16],{

/***/ "../node_modules/codemirror-graphql/results/mode.js":
/*!**********************************************************!*\
  !*** ../node_modules/codemirror-graphql/results/mode.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var codemirror_1 = __importDefault(__webpack_require__(/*! codemirror */ "../node_modules/codemirror/lib/codemirror.js"));
var graphql_language_service_1 = __webpack_require__(/*! graphql-language-service */ "../node_modules/graphql-language-service/esm/index.js");
codemirror_1.default.defineMode('graphql-results', function (config) {
    var parser = graphql_language_service_1.onlineParser({
        eatWhitespace: function (stream) { return stream.eatSpace(); },
        lexRules: LexRules,
        parseRules: ParseRules,
        editorConfig: { tabSize: config.tabSize },
    });
    return {
        config: config,
        startState: parser.startState,
        token: parser.token,
        indent: indent,
        electricInput: /^\s*[}\]]/,
        fold: 'brace',
        closeBrackets: {
            pairs: '[]{}""',
            explode: '[]{}',
        },
    };
});
function indent(state, textAfter) {
    var _a, _b;
    var levels = state.levels;
    var level = !levels || levels.length === 0
        ? state.indentLevel
        : levels[levels.length - 1] -
            (((_a = this.electricInput) === null || _a === void 0 ? void 0 : _a.test(textAfter)) ? 1 : 0);
    return (level || 0) * (((_b = this.config) === null || _b === void 0 ? void 0 : _b.indentUnit) || 0);
}
var LexRules = {
    Punctuation: /^\[|]|\{|\}|:|,/,
    Number: /^-?(?:0|(?:[1-9][0-9]*))(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?/,
    String: /^"(?:[^"\\]|\\(?:"|\/|\\|b|f|n|r|t|u[0-9a-fA-F]{4}))*"?/,
    Keyword: /^true|false|null/,
};
var ParseRules = {
    Document: [graphql_language_service_1.p('{'), graphql_language_service_1.list('Entry', graphql_language_service_1.p(',')), graphql_language_service_1.p('}')],
    Entry: [graphql_language_service_1.t('String', 'def'), graphql_language_service_1.p(':'), 'Value'],
    Value: function (token) {
        switch (token.kind) {
            case 'Number':
                return 'NumberValue';
            case 'String':
                return 'StringValue';
            case 'Punctuation':
                switch (token.value) {
                    case '[':
                        return 'ListValue';
                    case '{':
                        return 'ObjectValue';
                }
                return null;
            case 'Keyword':
                switch (token.value) {
                    case 'true':
                    case 'false':
                        return 'BooleanValue';
                    case 'null':
                        return 'NullValue';
                }
                return null;
        }
    },
    NumberValue: [graphql_language_service_1.t('Number', 'number')],
    StringValue: [graphql_language_service_1.t('String', 'string')],
    BooleanValue: [graphql_language_service_1.t('Keyword', 'builtin')],
    NullValue: [graphql_language_service_1.t('Keyword', 'keyword')],
    ListValue: [graphql_language_service_1.p('['), graphql_language_service_1.list('Value', graphql_language_service_1.p(',')), graphql_language_service_1.p(']')],
    ObjectValue: [graphql_language_service_1.p('{'), graphql_language_service_1.list('ObjectField', graphql_language_service_1.p(',')), graphql_language_service_1.p('}')],
    ObjectField: [graphql_language_service_1.t('String', 'property'), graphql_language_service_1.p(':'), 'Value'],
};
//# sourceMappingURL=mode.js.map

/***/ })

}]);
//# sourceMappingURL=16.js.map