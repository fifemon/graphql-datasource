(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[10],{

/***/ "../node_modules/codemirror-graphql/jump.js":
/*!**************************************************!*\
  !*** ../node_modules/codemirror-graphql/jump.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var codemirror_1 = __importDefault(__webpack_require__(/*! codemirror */ "../node_modules/codemirror/lib/codemirror.js"));
var getTypeInfo_1 = __importDefault(__webpack_require__(/*! ./utils/getTypeInfo */ "../node_modules/codemirror-graphql/utils/getTypeInfo.js"));
var SchemaReference_1 = __webpack_require__(/*! ./utils/SchemaReference */ "../node_modules/codemirror-graphql/utils/SchemaReference.js");
__webpack_require__(/*! ./utils/jump-addon */ "../node_modules/codemirror-graphql/utils/jump-addon.js");
codemirror_1.default.registerHelper('jump', 'graphql', function (token, options) {
    if (!options.schema || !options.onClick || !token.state) {
        return;
    }
    var state = token.state;
    var kind = state.kind;
    var step = state.step;
    var typeInfo = getTypeInfo_1.default(options.schema, state);
    if ((kind === 'Field' && step === 0 && typeInfo.fieldDef) ||
        (kind === 'AliasedField' && step === 2 && typeInfo.fieldDef)) {
        return SchemaReference_1.getFieldReference(typeInfo);
    }
    else if (kind === 'Directive' && step === 1 && typeInfo.directiveDef) {
        return SchemaReference_1.getDirectiveReference(typeInfo);
    }
    else if (kind === 'Argument' && step === 0 && typeInfo.argDef) {
        return SchemaReference_1.getArgumentReference(typeInfo);
    }
    else if (kind === 'EnumValue' && typeInfo.enumValue) {
        return SchemaReference_1.getEnumValueReference(typeInfo);
    }
    else if (kind === 'NamedType' && typeInfo.type) {
        return SchemaReference_1.getTypeReference(typeInfo);
    }
});
//# sourceMappingURL=jump.js.map

/***/ }),

/***/ "../node_modules/codemirror-graphql/utils/SchemaReference.js":
/*!*******************************************************************!*\
  !*** ../node_modules/codemirror-graphql/utils/SchemaReference.js ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeReference = exports.getEnumValueReference = exports.getArgumentReference = exports.getDirectiveReference = exports.getFieldReference = void 0;
var graphql_1 = __webpack_require__(/*! graphql */ "../node_modules/graphql/index.mjs");
function getFieldReference(typeInfo) {
    return {
        kind: 'Field',
        schema: typeInfo.schema,
        field: typeInfo.fieldDef,
        type: isMetaField(typeInfo.fieldDef) ? null : typeInfo.parentType,
    };
}
exports.getFieldReference = getFieldReference;
function getDirectiveReference(typeInfo) {
    return {
        kind: 'Directive',
        schema: typeInfo.schema,
        directive: typeInfo.directiveDef,
    };
}
exports.getDirectiveReference = getDirectiveReference;
function getArgumentReference(typeInfo) {
    return typeInfo.directiveDef
        ? {
            kind: 'Argument',
            schema: typeInfo.schema,
            argument: typeInfo.argDef,
            directive: typeInfo.directiveDef,
        }
        : {
            kind: 'Argument',
            schema: typeInfo.schema,
            argument: typeInfo.argDef,
            field: typeInfo.fieldDef,
            type: isMetaField(typeInfo.fieldDef) ? null : typeInfo.parentType,
        };
}
exports.getArgumentReference = getArgumentReference;
function getEnumValueReference(typeInfo) {
    return {
        kind: 'EnumValue',
        value: typeInfo.enumValue || undefined,
        type: typeInfo.inputType
            ? graphql_1.getNamedType(typeInfo.inputType)
            : undefined,
    };
}
exports.getEnumValueReference = getEnumValueReference;
function getTypeReference(typeInfo, type) {
    return {
        kind: 'Type',
        schema: typeInfo.schema,
        type: type || typeInfo.type,
    };
}
exports.getTypeReference = getTypeReference;
function isMetaField(fieldDef) {
    return fieldDef.name.slice(0, 2) === '__';
}
//# sourceMappingURL=SchemaReference.js.map

/***/ }),

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

/***/ "../node_modules/codemirror-graphql/utils/getTypeInfo.js":
/*!***************************************************************!*\
  !*** ../node_modules/codemirror-graphql/utils/getTypeInfo.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = __webpack_require__(/*! graphql */ "../node_modules/graphql/index.mjs");
var introspection_1 = __webpack_require__(/*! graphql/type/introspection */ "../node_modules/graphql/type/introspection.js");
var forEachState_1 = __importDefault(__webpack_require__(/*! ./forEachState */ "../node_modules/codemirror-graphql/utils/forEachState.js"));
function getTypeInfo(schema, tokenState) {
    var info = {
        schema: schema,
        type: null,
        parentType: null,
        inputType: null,
        directiveDef: null,
        fieldDef: null,
        argDef: null,
        argDefs: null,
        objectFieldDefs: null,
    };
    forEachState_1.default(tokenState, function (state) {
        switch (state.kind) {
            case 'Query':
            case 'ShortQuery':
                info.type = schema.getQueryType();
                break;
            case 'Mutation':
                info.type = schema.getMutationType();
                break;
            case 'Subscription':
                info.type = schema.getSubscriptionType();
                break;
            case 'InlineFragment':
            case 'FragmentDefinition':
                if (state.type) {
                    info.type = schema.getType(state.type);
                }
                break;
            case 'Field':
            case 'AliasedField':
                info.fieldDef =
                    info.type && state.name
                        ? getFieldDef(schema, info.parentType, state.name)
                        : null;
                info.type = info.fieldDef && info.fieldDef.type;
                break;
            case 'SelectionSet':
                info.parentType = info.type ? graphql_1.getNamedType(info.type) : null;
                break;
            case 'Directive':
                info.directiveDef = state.name ? schema.getDirective(state.name) : null;
                break;
            case 'Arguments':
                var parentDef = state.prevState
                    ? state.prevState.kind === 'Field'
                        ? info.fieldDef
                        : state.prevState.kind === 'Directive'
                            ? info.directiveDef
                            : state.prevState.kind === 'AliasedField'
                                ? state.prevState.name &&
                                    getFieldDef(schema, info.parentType, state.prevState.name)
                                : null
                    : null;
                info.argDefs = parentDef ? parentDef.args : null;
                break;
            case 'Argument':
                info.argDef = null;
                if (info.argDefs) {
                    for (var i = 0; i < info.argDefs.length; i++) {
                        if (info.argDefs[i].name === state.name) {
                            info.argDef = info.argDefs[i];
                            break;
                        }
                    }
                }
                info.inputType = info.argDef && info.argDef.type;
                break;
            case 'EnumValue':
                var enumType = info.inputType ? graphql_1.getNamedType(info.inputType) : null;
                info.enumValue =
                    enumType instanceof graphql_1.GraphQLEnumType
                        ? find(enumType.getValues(), function (val) { return val.value === state.name; })
                        : null;
                break;
            case 'ListValue':
                var nullableType = info.inputType
                    ? graphql_1.getNullableType(info.inputType)
                    : null;
                info.inputType =
                    nullableType instanceof graphql_1.GraphQLList ? nullableType.ofType : null;
                break;
            case 'ObjectValue':
                var objectType = info.inputType ? graphql_1.getNamedType(info.inputType) : null;
                info.objectFieldDefs =
                    objectType instanceof graphql_1.GraphQLInputObjectType
                        ? objectType.getFields()
                        : null;
                break;
            case 'ObjectField':
                var objectField = state.name && info.objectFieldDefs
                    ? info.objectFieldDefs[state.name]
                    : null;
                info.inputType = objectField && objectField.type;
                break;
            case 'NamedType':
                info.type = state.name ? schema.getType(state.name) : null;
                break;
        }
    });
    return info;
}
exports.default = getTypeInfo;
function getFieldDef(schema, type, fieldName) {
    if (fieldName === introspection_1.SchemaMetaFieldDef.name && schema.getQueryType() === type) {
        return introspection_1.SchemaMetaFieldDef;
    }
    if (fieldName === introspection_1.TypeMetaFieldDef.name && schema.getQueryType() === type) {
        return introspection_1.TypeMetaFieldDef;
    }
    if (fieldName === introspection_1.TypeNameMetaFieldDef.name && graphql_1.isCompositeType(type)) {
        return introspection_1.TypeNameMetaFieldDef;
    }
    if (type && type.getFields) {
        return type.getFields()[fieldName];
    }
}
function find(array, predicate) {
    for (var i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
            return array[i];
        }
    }
}
//# sourceMappingURL=getTypeInfo.js.map

/***/ }),

/***/ "../node_modules/codemirror-graphql/utils/jump-addon.js":
/*!**************************************************************!*\
  !*** ../node_modules/codemirror-graphql/utils/jump-addon.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var codemirror_1 = __importDefault(__webpack_require__(/*! codemirror */ "../node_modules/codemirror/lib/codemirror.js"));
codemirror_1.default.defineOption('jump', false, function (cm, options, old) {
    if (old && old !== codemirror_1.default.Init) {
        var oldOnMouseOver = cm.state.jump.onMouseOver;
        codemirror_1.default.off(cm.getWrapperElement(), 'mouseover', oldOnMouseOver);
        var oldOnMouseOut = cm.state.jump.onMouseOut;
        codemirror_1.default.off(cm.getWrapperElement(), 'mouseout', oldOnMouseOut);
        codemirror_1.default.off(document, 'keydown', cm.state.jump.onKeyDown);
        delete cm.state.jump;
    }
    if (options) {
        var state = (cm.state.jump = {
            options: options,
            onMouseOver: onMouseOver.bind(null, cm),
            onMouseOut: onMouseOut.bind(null, cm),
            onKeyDown: onKeyDown.bind(null, cm),
        });
        codemirror_1.default.on(cm.getWrapperElement(), 'mouseover', state.onMouseOver);
        codemirror_1.default.on(cm.getWrapperElement(), 'mouseout', state.onMouseOut);
        codemirror_1.default.on(document, 'keydown', state.onKeyDown);
    }
});
function onMouseOver(cm, event) {
    var target = event.target || event.srcElement;
    if (!(target instanceof HTMLElement)) {
        return;
    }
    if ((target === null || target === void 0 ? void 0 : target.nodeName) !== 'SPAN') {
        return;
    }
    var box = target.getBoundingClientRect();
    var cursor = {
        left: (box.left + box.right) / 2,
        top: (box.top + box.bottom) / 2,
    };
    cm.state.jump.cursor = cursor;
    if (cm.state.jump.isHoldingModifier) {
        enableJumpMode(cm);
    }
}
function onMouseOut(cm) {
    if (!cm.state.jump.isHoldingModifier && cm.state.jump.cursor) {
        cm.state.jump.cursor = null;
        return;
    }
    if (cm.state.jump.isHoldingModifier && cm.state.jump.marker) {
        disableJumpMode(cm);
    }
}
function onKeyDown(cm, event) {
    if (cm.state.jump.isHoldingModifier || !isJumpModifier(event.key)) {
        return;
    }
    cm.state.jump.isHoldingModifier = true;
    if (cm.state.jump.cursor) {
        enableJumpMode(cm);
    }
    var onKeyUp = function (upEvent) {
        if (upEvent.code !== event.code) {
            return;
        }
        cm.state.jump.isHoldingModifier = false;
        if (cm.state.jump.marker) {
            disableJumpMode(cm);
        }
        codemirror_1.default.off(document, 'keyup', onKeyUp);
        codemirror_1.default.off(document, 'click', onClick);
        cm.off('mousedown', onMouseDown);
    };
    var onClick = function (clickEvent) {
        var destination = cm.state.jump.destination;
        if (destination) {
            cm.state.jump.options.onClick(destination, clickEvent);
        }
    };
    var onMouseDown = function (_, downEvent) {
        if (cm.state.jump.destination) {
            downEvent.codemirrorIgnore = true;
        }
    };
    codemirror_1.default.on(document, 'keyup', onKeyUp);
    codemirror_1.default.on(document, 'click', onClick);
    cm.on('mousedown', onMouseDown);
}
var isMac = typeof navigator !== 'undefined' &&
    navigator &&
    navigator.appVersion.indexOf('Mac') !== -1;
function isJumpModifier(key) {
    return key === (isMac ? 'Meta' : 'Control');
}
function enableJumpMode(cm) {
    if (cm.state.jump.marker) {
        return;
    }
    var cursor = cm.state.jump.cursor;
    var pos = cm.coordsChar(cursor);
    var token = cm.getTokenAt(pos, true);
    var options = cm.state.jump.options;
    var getDestination = options.getDestination || cm.getHelper(pos, 'jump');
    if (getDestination) {
        var destination = getDestination(token, options, cm);
        if (destination) {
            var marker = cm.markText({ line: pos.line, ch: token.start }, { line: pos.line, ch: token.end }, { className: 'CodeMirror-jump-token' });
            cm.state.jump.marker = marker;
            cm.state.jump.destination = destination;
        }
    }
}
function disableJumpMode(cm) {
    var marker = cm.state.jump.marker;
    cm.state.jump.marker = null;
    cm.state.jump.destination = null;
    marker.clear();
}
//# sourceMappingURL=jump-addon.js.map

/***/ })

}]);
//# sourceMappingURL=10.js.map