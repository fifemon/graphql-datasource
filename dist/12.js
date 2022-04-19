(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[12],{

/***/ "../node_modules/codemirror-graphql/utils/forEachState.js":
/*!****************************************************************!*\
  !*** ../node_modules/codemirror-graphql/utils/forEachState.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function forEachState(stack, fn) {
    var reverseStateStack = [];
    var state = stack;
    while (state && state.kind) {
        reverseStateStack.push(state);
        state = state.prevState;
    }
    for (var i = reverseStateStack.length - 1; i >= 0; i--) {
        fn(reverseStateStack[i]);
    }
}
exports.default = forEachState;
//# sourceMappingURL=forEachState.js.map

/***/ }),

/***/ "../node_modules/codemirror-graphql/utils/hintList.js":
/*!************************************************************!*\
  !*** ../node_modules/codemirror-graphql/utils/hintList.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function hintList(cursor, token, list) {
    var hints = filterAndSortList(list, normalizeText(token.string));
    if (!hints) {
        return;
    }
    var tokenStart = token.type !== null && /"|\w/.test(token.string[0])
        ? token.start
        : token.end;
    return {
        list: hints,
        from: { line: cursor.line, ch: tokenStart },
        to: { line: cursor.line, ch: token.end },
    };
}
exports.default = hintList;
function filterAndSortList(list, text) {
    if (!text) {
        return filterNonEmpty(list, function (entry) { return !entry.isDeprecated; });
    }
    var byProximity = list.map(function (entry) { return ({
        proximity: getProximity(normalizeText(entry.text), text),
        entry: entry,
    }); });
    var conciseMatches = filterNonEmpty(filterNonEmpty(byProximity, function (pair) { return pair.proximity <= 2; }), function (pair) { return !pair.entry.isDeprecated; });
    var sortedMatches = conciseMatches.sort(function (a, b) {
        return (a.entry.isDeprecated ? 1 : 0) - (b.entry.isDeprecated ? 1 : 0) ||
            a.proximity - b.proximity ||
            a.entry.text.length - b.entry.text.length;
    });
    return sortedMatches.map(function (pair) { return pair.entry; });
}
function filterNonEmpty(array, predicate) {
    var filtered = array.filter(predicate);
    return filtered.length === 0 ? array : filtered;
}
function normalizeText(text) {
    return text.toLowerCase().replace(/\W/g, '');
}
function getProximity(suggestion, text) {
    var proximity = lexicalDistance(text, suggestion);
    if (suggestion.length > text.length) {
        proximity -= suggestion.length - text.length - 1;
        proximity += suggestion.indexOf(text) === 0 ? 0 : 0.5;
    }
    return proximity;
}
function lexicalDistance(a, b) {
    var i;
    var j;
    var d = [];
    var aLength = a.length;
    var bLength = b.length;
    for (i = 0; i <= aLength; i++) {
        d[i] = [i];
    }
    for (j = 1; j <= bLength; j++) {
        d[0][j] = j;
    }
    for (i = 1; i <= aLength; i++) {
        for (j = 1; j <= bLength; j++) {
            var cost = a[i - 1] === b[j - 1] ? 0 : 1;
            d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
            }
        }
    }
    return d[aLength][bLength];
}
//# sourceMappingURL=hintList.js.map

/***/ }),

/***/ "../node_modules/codemirror-graphql/variables/hint.js":
/*!************************************************************!*\
  !*** ../node_modules/codemirror-graphql/variables/hint.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var codemirror_1 = __importDefault(__webpack_require__(/*! codemirror */ "../node_modules/codemirror/lib/codemirror.js"));
var graphql_1 = __webpack_require__(/*! graphql */ "../node_modules/graphql/index.mjs");
var forEachState_1 = __importDefault(__webpack_require__(/*! ../utils/forEachState */ "../node_modules/codemirror-graphql/utils/forEachState.js"));
var hintList_1 = __importDefault(__webpack_require__(/*! ../utils/hintList */ "../node_modules/codemirror-graphql/utils/hintList.js"));
codemirror_1.default.registerHelper('hint', 'graphql-variables', function (editor, options) {
    var cur = editor.getCursor();
    var token = editor.getTokenAt(cur);
    var results = getVariablesHint(cur, token, options);
    if (results && results.list && results.list.length > 0) {
        results.from = codemirror_1.default.Pos(results.from.line, results.from.ch);
        results.to = codemirror_1.default.Pos(results.to.line, results.to.ch);
        codemirror_1.default.signal(editor, 'hasCompletion', editor, results, token);
    }
    return results;
});
function getVariablesHint(cur, token, options) {
    var state = token.state.kind === 'Invalid' ? token.state.prevState : token.state;
    var kind = state.kind;
    var step = state.step;
    if (kind === 'Document' && step === 0) {
        return hintList_1.default(cur, token, [{ text: '{' }]);
    }
    var variableToType = options.variableToType;
    if (!variableToType) {
        return;
    }
    var typeInfo = getTypeInfo(variableToType, token.state);
    if (kind === 'Document' || (kind === 'Variable' && step === 0)) {
        var variableNames = Object.keys(variableToType);
        return hintList_1.default(cur, token, variableNames.map(function (name) { return ({
            text: "\"" + name + "\": ",
            type: variableToType[name],
        }); }));
    }
    if (kind === 'ObjectValue' || (kind === 'ObjectField' && step === 0)) {
        if (typeInfo.fields) {
            var inputFields = Object.keys(typeInfo.fields).map(function (fieldName) { return typeInfo.fields[fieldName]; });
            return hintList_1.default(cur, token, inputFields.map(function (field) { return ({
                text: "\"" + field.name + "\": ",
                type: field.type,
                description: field.description,
            }); }));
        }
    }
    if (kind === 'StringValue' ||
        kind === 'NumberValue' ||
        kind === 'BooleanValue' ||
        kind === 'NullValue' ||
        (kind === 'ListValue' && step === 1) ||
        (kind === 'ObjectField' && step === 2) ||
        (kind === 'Variable' && step === 2)) {
        var namedInputType_1 = typeInfo.type
            ? graphql_1.getNamedType(typeInfo.type)
            : undefined;
        if (namedInputType_1 instanceof graphql_1.GraphQLInputObjectType) {
            return hintList_1.default(cur, token, [{ text: '{' }]);
        }
        else if (namedInputType_1 instanceof graphql_1.GraphQLEnumType) {
            var values = namedInputType_1.getValues();
            return hintList_1.default(cur, token, values.map(function (value) { return ({
                text: "\"" + value.name + "\"",
                type: namedInputType_1,
                description: value.description,
            }); }));
        }
        else if (namedInputType_1 === graphql_1.GraphQLBoolean) {
            return hintList_1.default(cur, token, [
                { text: 'true', type: graphql_1.GraphQLBoolean, description: 'Not false.' },
                { text: 'false', type: graphql_1.GraphQLBoolean, description: 'Not true.' },
            ]);
        }
    }
}
function getTypeInfo(variableToType, tokenState) {
    var info = {
        type: null,
        fields: null,
    };
    forEachState_1.default(tokenState, function (state) {
        if (state.kind === 'Variable') {
            info.type = variableToType[state.name];
        }
        else if (state.kind === 'ListValue') {
            var nullableType = info.type ? graphql_1.getNullableType(info.type) : undefined;
            info.type =
                nullableType instanceof graphql_1.GraphQLList ? nullableType.ofType : null;
        }
        else if (state.kind === 'ObjectValue') {
            var objectType = info.type ? graphql_1.getNamedType(info.type) : undefined;
            info.fields =
                objectType instanceof graphql_1.GraphQLInputObjectType
                    ? objectType.getFields()
                    : null;
        }
        else if (state.kind === 'ObjectField') {
            var objectField = state.name && info.fields ? info.fields[state.name] : null;
            info.type = objectField && objectField.type;
        }
    });
    return info;
}
//# sourceMappingURL=hint.js.map

/***/ })

}]);
//# sourceMappingURL=12.js.map