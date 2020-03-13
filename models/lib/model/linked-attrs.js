import { __extends } from "tslib";
import { Linked } from '@linked/value';
export function addAttributeLinks(Class) {
    var prototype = Class.prototype;
    var _attributesArray = prototype._attributesArray;
    var AttributeRefs = new Function('model', "\n        this._model = model;\n        " + _attributesArray.map(function (_a) {
        var name = _a.name;
        return "this.$" + name + " = void 0; ";
    }).join('\n') + "\n    ");
    AttributeRefs.prototype.__ModelAttrRef = LinkedAttr;
    for (var _i = 0, _attributesArray_1 = _attributesArray; _i < _attributesArray_1.length; _i++) {
        var attr = _attributesArray_1[_i];
        var name_1 = attr.name;
        Object.defineProperty(AttributeRefs.prototype, name_1, {
            get: new Function(attr.isMutableType() ? "\n                var cached = this.$" + name_1 + ",\n                    value = this._model." + name_1 + ",\n                    token = value && value._changeToken;\n\n                return cached && cached._token === token ? cached :\n                    ( this.$" + name_1 + " = new this.__ModelAttrRef( this._model, '" + name_1 + "', value, token ) );\n            " : "\n                var cached = this.$" + name_1 + ";\n\n                return cached && cached.value === this._model." + name_1 + " ? cached :\n                    ( this.$" + name_1 + " = new this.__ModelAttrRef( this._model, '" + name_1 + "', this._model." + name_1 + " ) );\n            ")
        });
    }
    prototype.__Attributes$ = AttributeRefs;
}
var LinkedAttr = (function (_super) {
    __extends(LinkedAttr, _super);
    function LinkedAttr(model, attr, value, _token) {
        var _this = _super.call(this, value) || this;
        _this.model = model;
        _this.attr = attr;
        _this._token = _token;
        return _this;
    }
    LinkedAttr.prototype.set = function (x) {
        this.model[this.attr] = x;
    };
    Object.defineProperty(LinkedAttr.prototype, "error", {
        get: function () {
            return this._error || (this._error = this.model.getValidationError(this.attr));
        },
        set: function (x) {
            this._error = x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LinkedAttr.prototype, "descriptor", {
        get: function () {
            return this.model._attributes[this.attr];
        },
        enumerable: true,
        configurable: true
    });
    return LinkedAttr;
}(Linked));
export { LinkedAttr };
Object.defineProperty(LinkedAttr.prototype, '_changeToken', { value: null });
//# sourceMappingURL=linked-attrs.js.map