(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[9],{

/***/ "../node_modules/codemirror-graphql/info.js":
/*!**************************************************!*\
  !*** ../node_modules/codemirror-graphql/info.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = __webpack_require__(/*! graphql */ "../node_modules/graphql/index.mjs");
var codemirror_1 = __importDefault(__webpack_require__(/*! codemirror */ "../node_modules/codemirror/lib/codemirror.js"));
var getTypeInfo_1 = __importDefault(__webpack_require__(/*! ./utils/getTypeInfo */ "../node_modules/codemirror-graphql/utils/getTypeInfo.js"));
var SchemaReference_1 = __webpack_require__(/*! ./utils/SchemaReference */ "../node_modules/codemirror-graphql/utils/SchemaReference.js");
__webpack_require__(/*! ./utils/info-addon */ "../node_modules/codemirror-graphql/utils/info-addon.js");
codemirror_1.default.registerHelper('info', 'graphql', function (token, options) {
    if (!options.schema || !token.state) {
        return;
    }
    var state = token.state;
    var kind = state.kind;
    var step = state.step;
    var typeInfo = getTypeInfo_1.default(options.schema, token.state);
    if ((kind === 'Field' && step === 0 && typeInfo.fieldDef) ||
        (kind === 'AliasedField' && step === 2 && typeInfo.fieldDef)) {
        var into = document.createElement('div');
        renderField(into, typeInfo, options);
        renderDescription(into, options, typeInfo.fieldDef);
        return into;
    }
    else if (kind === 'Directive' && step === 1 && typeInfo.directiveDef) {
        var into = document.createElement('div');
        renderDirective(into, typeInfo, options);
        renderDescription(into, options, typeInfo.directiveDef);
        return into;
    }
    else if (kind === 'Argument' && step === 0 && typeInfo.argDef) {
        var into = document.createElement('div');
        renderArg(into, typeInfo, options);
        renderDescription(into, options, typeInfo.argDef);
        return into;
    }
    else if (kind === 'EnumValue' &&
        typeInfo.enumValue &&
        typeInfo.enumValue.description) {
        var into = document.createElement('div');
        renderEnumValue(into, typeInfo, options);
        renderDescription(into, options, typeInfo.enumValue);
        return into;
    }
    else if (kind === 'NamedType' &&
        typeInfo.type &&
        typeInfo.type.description) {
        var into = document.createElement('div');
        renderType(into, typeInfo, options, typeInfo.type);
        renderDescription(into, options, typeInfo.type);
        return into;
    }
});
function renderField(into, typeInfo, options) {
    renderQualifiedField(into, typeInfo, options);
    renderTypeAnnotation(into, typeInfo, options, typeInfo.type);
}
function renderQualifiedField(into, typeInfo, options) {
    var _a;
    var fieldName = ((_a = typeInfo.fieldDef) === null || _a === void 0 ? void 0 : _a.name) || '';
    if (fieldName.slice(0, 2) !== '__') {
        renderType(into, typeInfo, options, typeInfo.parentType);
        text(into, '.');
    }
    text(into, fieldName, 'field-name', options, SchemaReference_1.getFieldReference(typeInfo));
}
function renderDirective(into, typeInfo, options) {
    var _a;
    var name = '@' + (((_a = typeInfo.directiveDef) === null || _a === void 0 ? void 0 : _a.name) || '');
    text(into, name, 'directive-name', options, SchemaReference_1.getDirectiveReference(typeInfo));
}
function renderArg(into, typeInfo, options) {
    var _a;
    if (typeInfo.directiveDef) {
        renderDirective(into, typeInfo, options);
    }
    else if (typeInfo.fieldDef) {
        renderQualifiedField(into, typeInfo, options);
    }
    var name = ((_a = typeInfo.argDef) === null || _a === void 0 ? void 0 : _a.name) || '';
    text(into, '(');
    text(into, name, 'arg-name', options, SchemaReference_1.getArgumentReference(typeInfo));
    renderTypeAnnotation(into, typeInfo, options, typeInfo.inputType);
    text(into, ')');
}
function renderTypeAnnotation(into, typeInfo, options, t) {
    text(into, ': ');
    renderType(into, typeInfo, options, t);
}
function renderEnumValue(into, typeInfo, options) {
    var _a;
    var name = ((_a = typeInfo.enumValue) === null || _a === void 0 ? void 0 : _a.name) || '';
    renderType(into, typeInfo, options, typeInfo.inputType);
    text(into, '.');
    text(into, name, 'enum-value', options, SchemaReference_1.getEnumValueReference(typeInfo));
}
function renderType(into, typeInfo, options, t) {
    if (t instanceof graphql_1.GraphQLNonNull) {
        renderType(into, typeInfo, options, t.ofType);
        text(into, '!');
    }
    else if (t instanceof graphql_1.GraphQLList) {
        text(into, '[');
        renderType(into, typeInfo, options, t.ofType);
        text(into, ']');
    }
    else {
        text(into, (t === null || t === void 0 ? void 0 : t.name) || '', 'type-name', options, SchemaReference_1.getTypeReference(typeInfo, t));
    }
}
function renderDescription(into, options, def) {
    var description = def.description;
    if (description) {
        var descriptionDiv = document.createElement('div');
        descriptionDiv.className = 'info-description';
        if (options.renderDescription) {
            descriptionDiv.innerHTML = options.renderDescription(description);
        }
        else {
            descriptionDiv.appendChild(document.createTextNode(description));
        }
        into.appendChild(descriptionDiv);
    }
    renderDeprecation(into, options, def);
}
function renderDeprecation(into, options, def) {
    var reason = def.deprecationReason;
    if (reason) {
        var deprecationDiv = document.createElement('div');
        deprecationDiv.className = 'info-deprecation';
        if (options.renderDescription) {
            deprecationDiv.innerHTML = options.renderDescription(reason);
        }
        else {
            deprecationDiv.appendChild(document.createTextNode(reason));
        }
        var label = document.createElement('span');
        label.className = 'info-deprecation-label';
        label.appendChild(document.createTextNode('Deprecated: '));
        deprecationDiv.insertBefore(label, deprecationDiv.firstChild);
        into.appendChild(deprecationDiv);
    }
}
function text(into, content, className, options, ref) {
    if (className === void 0) { className = ''; }
    if (options === void 0) { options = { onClick: null }; }
    if (ref === void 0) { ref = null; }
    if (className) {
        var onClick_1 = options.onClick;
        var node = void 0;
        if (onClick_1) {
            node = document.createElement('a');
            node.href = 'javascript:void 0';
            node.addEventListener('click', function (e) {
                onClick_1(ref, e);
            });
        }
        else {
            node = document.createElement('span');
        }
        node.className = className;
        node.appendChild(document.createTextNode(content));
        into.appendChild(node);
    }
    else {
        into.appendChild(document.createTextNode(content));
    }
}
//# sourceMappingURL=info.js.map

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

/***/ "../node_modules/codemirror-graphql/utils/info-addon.js":
/*!**************************************************************!*\
  !*** ../node_modules/codemirror-graphql/utils/info-addon.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var codemirror_1 = __importDefault(__webpack_require__(/*! codemirror */ "../node_modules/codemirror/lib/codemirror.js"));
codemirror_1.default.defineOption('info', false, function (cm, options, old) {
    if (old && old !== codemirror_1.default.Init) {
        var oldOnMouseOver = cm.state.info.onMouseOver;
        codemirror_1.default.off(cm.getWrapperElement(), 'mouseover', oldOnMouseOver);
        clearTimeout(cm.state.info.hoverTimeout);
        delete cm.state.info;
    }
    if (options) {
        var state = (cm.state.info = createState(options));
        state.onMouseOver = onMouseOver.bind(null, cm);
        codemirror_1.default.on(cm.getWrapperElement(), 'mouseover', state.onMouseOver);
    }
});
function createState(options) {
    return {
        options: options instanceof Function
            ? { render: options }
            : options === true
                ? {}
                : options,
    };
}
function getHoverTime(cm) {
    var options = cm.state.info.options;
    return (options && options.hoverTime) || 500;
}
function onMouseOver(cm, e) {
    var state = cm.state.info;
    var target = e.target || e.srcElement;
    if (!(target instanceof HTMLElement)) {
        return;
    }
    if (target.nodeName !== 'SPAN' || state.hoverTimeout !== undefined) {
        return;
    }
    var box = target.getBoundingClientRect();
    var onMouseMove = function () {
        clearTimeout(state.hoverTimeout);
        state.hoverTimeout = setTimeout(onHover, hoverTime);
    };
    var onMouseOut = function () {
        codemirror_1.default.off(document, 'mousemove', onMouseMove);
        codemirror_1.default.off(cm.getWrapperElement(), 'mouseout', onMouseOut);
        clearTimeout(state.hoverTimeout);
        state.hoverTimeout = undefined;
    };
    var onHover = function () {
        codemirror_1.default.off(document, 'mousemove', onMouseMove);
        codemirror_1.default.off(cm.getWrapperElement(), 'mouseout', onMouseOut);
        state.hoverTimeout = undefined;
        onMouseHover(cm, box);
    };
    var hoverTime = getHoverTime(cm);
    state.hoverTimeout = setTimeout(onHover, hoverTime);
    codemirror_1.default.on(document, 'mousemove', onMouseMove);
    codemirror_1.default.on(cm.getWrapperElement(), 'mouseout', onMouseOut);
}
function onMouseHover(cm, box) {
    var pos = cm.coordsChar({
        left: (box.left + box.right) / 2,
        top: (box.top + box.bottom) / 2,
    });
    var state = cm.state.info;
    var options = state.options;
    var render = options.render || cm.getHelper(pos, 'info');
    if (render) {
        var token = cm.getTokenAt(pos, true);
        if (token) {
            var info = render(token, options, cm, pos);
            if (info) {
                showPopup(cm, box, info);
            }
        }
    }
}
function showPopup(cm, box, info) {
    var popup = document.createElement('div');
    popup.className = 'CodeMirror-info';
    popup.appendChild(info);
    document.body.appendChild(popup);
    var popupBox = popup.getBoundingClientRect();
    var popupStyle = window.getComputedStyle(popup);
    var popupWidth = popupBox.right -
        popupBox.left +
        parseFloat(popupStyle.marginLeft) +
        parseFloat(popupStyle.marginRight);
    var popupHeight = popupBox.bottom -
        popupBox.top +
        parseFloat(popupStyle.marginTop) +
        parseFloat(popupStyle.marginBottom);
    var topPos = box.bottom;
    if (popupHeight > window.innerHeight - box.bottom - 15 &&
        box.top > window.innerHeight - box.bottom) {
        topPos = box.top - popupHeight;
    }
    if (topPos < 0) {
        topPos = box.bottom;
    }
    var leftPos = Math.max(0, window.innerWidth - popupWidth - 15);
    if (leftPos > box.left) {
        leftPos = box.left;
    }
    popup.style.opacity = '1';
    popup.style.top = topPos + 'px';
    popup.style.left = leftPos + 'px';
    var popupTimeout;
    var onMouseOverPopup = function () {
        clearTimeout(popupTimeout);
    };
    var onMouseOut = function () {
        clearTimeout(popupTimeout);
        popupTimeout = setTimeout(hidePopup, 200);
    };
    var hidePopup = function () {
        codemirror_1.default.off(popup, 'mouseover', onMouseOverPopup);
        codemirror_1.default.off(popup, 'mouseout', onMouseOut);
        codemirror_1.default.off(cm.getWrapperElement(), 'mouseout', onMouseOut);
        if (popup.style.opacity) {
            popup.style.opacity = '0';
            setTimeout(function () {
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
            }, 600);
        }
        else if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    };
    codemirror_1.default.on(popup, 'mouseover', onMouseOverPopup);
    codemirror_1.default.on(popup, 'mouseout', onMouseOut);
    codemirror_1.default.on(cm.getWrapperElement(), 'mouseout', onMouseOut);
}
//# sourceMappingURL=info-addon.js.map

/***/ })

}]);
//# sourceMappingURL=9.js.map