(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[13],{

/***/ "../node_modules/codemirror-graphql/utils/jsonParse.js":
/*!*************************************************************!*\
  !*** ../node_modules/codemirror-graphql/utils/jsonParse.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function jsonParse(str) {
    string = str;
    strLen = str.length;
    start = end = lastEnd = -1;
    ch();
    lex();
    var ast = parseObj();
    expect('EOF');
    return ast;
}
exports.default = jsonParse;
var string;
var strLen;
var start;
var end;
var lastEnd;
var code;
var kind;
function parseObj() {
    var nodeStart = start;
    var members = [];
    expect('{');
    if (!skip('}')) {
        do {
            members.push(parseMember());
        } while (skip(','));
        expect('}');
    }
    return {
        kind: 'Object',
        start: nodeStart,
        end: lastEnd,
        members: members,
    };
}
function parseMember() {
    var nodeStart = start;
    var key = kind === 'String' ? curToken() : null;
    expect('String');
    expect(':');
    var value = parseVal();
    return {
        kind: 'Member',
        start: nodeStart,
        end: lastEnd,
        key: key,
        value: value,
    };
}
function parseArr() {
    var nodeStart = start;
    var values = [];
    expect('[');
    if (!skip(']')) {
        do {
            values.push(parseVal());
        } while (skip(','));
        expect(']');
    }
    return {
        kind: 'Array',
        start: nodeStart,
        end: lastEnd,
        values: values,
    };
}
function parseVal() {
    switch (kind) {
        case '[':
            return parseArr();
        case '{':
            return parseObj();
        case 'String':
        case 'Number':
        case 'Boolean':
        case 'Null':
            var token = curToken();
            lex();
            return token;
    }
    expect('Value');
}
function curToken() {
    return { kind: kind, start: start, end: end, value: JSON.parse(string.slice(start, end)) };
}
function expect(str) {
    if (kind === str) {
        lex();
        return;
    }
    var found;
    if (kind === 'EOF') {
        found = '[end of file]';
    }
    else if (end - start > 1) {
        found = '`' + string.slice(start, end) + '`';
    }
    else {
        var match = string.slice(start).match(/^.+?\b/);
        found = '`' + (match ? match[0] : string[start]) + '`';
    }
    throw syntaxError("Expected " + str + " but found " + found + ".");
}
function syntaxError(message) {
    return { message: message, start: start, end: end };
}
function skip(k) {
    if (kind === k) {
        lex();
        return true;
    }
}
function ch() {
    if (end < strLen) {
        end++;
        code = end === strLen ? 0 : string.charCodeAt(end);
    }
    return code;
}
function lex() {
    lastEnd = end;
    while (code === 9 || code === 10 || code === 13 || code === 32) {
        ch();
    }
    if (code === 0) {
        kind = 'EOF';
        return;
    }
    start = end;
    switch (code) {
        case 34:
            kind = 'String';
            return readString();
        case 45:
        case 48:
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
            kind = 'Number';
            return readNumber();
        case 102:
            if (string.slice(start, start + 5) !== 'false') {
                break;
            }
            end += 4;
            ch();
            kind = 'Boolean';
            return;
        case 110:
            if (string.slice(start, start + 4) !== 'null') {
                break;
            }
            end += 3;
            ch();
            kind = 'Null';
            return;
        case 116:
            if (string.slice(start, start + 4) !== 'true') {
                break;
            }
            end += 3;
            ch();
            kind = 'Boolean';
            return;
    }
    kind = string[start];
    ch();
}
function readString() {
    ch();
    while (code !== 34 && code > 31) {
        if (code === 92) {
            code = ch();
            switch (code) {
                case 34:
                case 47:
                case 92:
                case 98:
                case 102:
                case 110:
                case 114:
                case 116:
                    ch();
                    break;
                case 117:
                    ch();
                    readHex();
                    readHex();
                    readHex();
                    readHex();
                    break;
                default:
                    throw syntaxError('Bad character escape sequence.');
            }
        }
        else if (end === strLen) {
            throw syntaxError('Unterminated string.');
        }
        else {
            ch();
        }
    }
    if (code === 34) {
        ch();
        return;
    }
    throw syntaxError('Unterminated string.');
}
function readHex() {
    if ((code >= 48 && code <= 57) ||
        (code >= 65 && code <= 70) ||
        (code >= 97 && code <= 102)) {
        return ch();
    }
    throw syntaxError('Expected hexadecimal digit.');
}
function readNumber() {
    if (code === 45) {
        ch();
    }
    if (code === 48) {
        ch();
    }
    else {
        readDigits();
    }
    if (code === 46) {
        ch();
        readDigits();
    }
    if (code === 69 || code === 101) {
        code = ch();
        if (code === 43 || code === 45) {
            ch();
        }
        readDigits();
    }
}
function readDigits() {
    if (code < 48 || code > 57) {
        throw syntaxError('Expected decimal digit.');
    }
    do {
        ch();
    } while (code >= 48 && code <= 57);
}
//# sourceMappingURL=jsonParse.js.map

/***/ }),

/***/ "../node_modules/codemirror-graphql/variables/lint.js":
/*!************************************************************!*\
  !*** ../node_modules/codemirror-graphql/variables/lint.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var codemirror_1 = __importDefault(__webpack_require__(/*! codemirror */ "../node_modules/codemirror/lib/codemirror.js"));
var graphql_1 = __webpack_require__(/*! graphql */ "../node_modules/graphql/index.mjs");
var jsonParse_1 = __importDefault(__webpack_require__(/*! ../utils/jsonParse */ "../node_modules/codemirror-graphql/utils/jsonParse.js"));
codemirror_1.default.registerHelper('lint', 'graphql-variables', function (text, options, editor) {
    if (!text) {
        return [];
    }
    var ast;
    try {
        ast = jsonParse_1.default(text);
    }
    catch (syntaxError) {
        if (syntaxError.stack) {
            throw syntaxError;
        }
        return [lintError(editor, syntaxError, syntaxError.message)];
    }
    var variableToType = options.variableToType;
    if (!variableToType) {
        return [];
    }
    return validateVariables(editor, variableToType, ast);
});
function validateVariables(editor, variableToType, variablesAST) {
    var errors = [];
    variablesAST.members.forEach(function (member) {
        var _a;
        if (member) {
            var variableName = (_a = member.key) === null || _a === void 0 ? void 0 : _a.value;
            var type = variableToType[variableName];
            if (!type) {
                errors.push(lintError(editor, member.key, "Variable \"$" + variableName + "\" does not appear in any GraphQL query."));
            }
            else {
                validateValue(type, member.value).forEach(function (_a) {
                    var _b = __read(_a, 2), node = _b[0], message = _b[1];
                    errors.push(lintError(editor, node, message));
                });
            }
        }
    });
    return errors;
}
function validateValue(type, valueAST) {
    if (!type || !valueAST) {
        return [];
    }
    if (type instanceof graphql_1.GraphQLNonNull) {
        if (valueAST.kind === 'Null') {
            return [[valueAST, "Type \"" + type + "\" is non-nullable and cannot be null."]];
        }
        return validateValue(type.ofType, valueAST);
    }
    if (valueAST.kind === 'Null') {
        return [];
    }
    if (type instanceof graphql_1.GraphQLList) {
        var itemType_1 = type.ofType;
        if (valueAST.kind === 'Array') {
            var values = valueAST.values || [];
            return mapCat(values, function (item) { return validateValue(itemType_1, item); });
        }
        return validateValue(itemType_1, valueAST);
    }
    if (type instanceof graphql_1.GraphQLInputObjectType) {
        if (valueAST.kind !== 'Object') {
            return [[valueAST, "Type \"" + type + "\" must be an Object."]];
        }
        var providedFields_1 = Object.create(null);
        var fieldErrors_1 = mapCat(valueAST.members, function (member) {
            var _a;
            var fieldName = (_a = member === null || member === void 0 ? void 0 : member.key) === null || _a === void 0 ? void 0 : _a.value;
            providedFields_1[fieldName] = true;
            var inputField = type.getFields()[fieldName];
            if (!inputField) {
                return [
                    [
                        member.key,
                        "Type \"" + type + "\" does not have a field \"" + fieldName + "\".",
                    ],
                ];
            }
            var fieldType = inputField ? inputField.type : undefined;
            return validateValue(fieldType, member.value);
        });
        Object.keys(type.getFields()).forEach(function (fieldName) {
            if (!providedFields_1[fieldName]) {
                var fieldType = type.getFields()[fieldName].type;
                if (fieldType instanceof graphql_1.GraphQLNonNull) {
                    fieldErrors_1.push([
                        valueAST,
                        "Object of type \"" + type + "\" is missing required field \"" + fieldName + "\".",
                    ]);
                }
            }
        });
        return fieldErrors_1;
    }
    if ((type.name === 'Boolean' && valueAST.kind !== 'Boolean') ||
        (type.name === 'String' && valueAST.kind !== 'String') ||
        (type.name === 'ID' &&
            valueAST.kind !== 'Number' &&
            valueAST.kind !== 'String') ||
        (type.name === 'Float' && valueAST.kind !== 'Number') ||
        (type.name === 'Int' &&
            (valueAST.kind !== 'Number' || (valueAST.value | 0) !== valueAST.value))) {
        return [[valueAST, "Expected value of type \"" + type + "\"."]];
    }
    if (type instanceof graphql_1.GraphQLEnumType || type instanceof graphql_1.GraphQLScalarType) {
        if ((valueAST.kind !== 'String' &&
            valueAST.kind !== 'Number' &&
            valueAST.kind !== 'Boolean' &&
            valueAST.kind !== 'Null') ||
            isNullish(type.parseValue(valueAST.value))) {
            return [[valueAST, "Expected value of type \"" + type + "\"."]];
        }
    }
    return [];
}
function lintError(editor, node, message) {
    return {
        message: message,
        severity: 'error',
        type: 'validation',
        from: editor.posFromIndex(node.start),
        to: editor.posFromIndex(node.end),
    };
}
function isNullish(value) {
    return value === null || value === undefined || value !== value;
}
function mapCat(array, mapper) {
    return Array.prototype.concat.apply([], array.map(mapper));
}
//# sourceMappingURL=lint.js.map

/***/ })

}]);
//# sourceMappingURL=13.js.map