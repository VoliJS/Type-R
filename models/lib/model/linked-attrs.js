import * as tslib_1 from "tslib";
import { Linked } from '@linked/value';
export function addAttributeLinks(Class) {
    var prototype = Class.prototype;
    var _attributesArray = prototype._attributesArray;
    var AttributeRefs = new Function('model', "\n        this._model = model;\n        " + _attributesArray.map(function (_a) {
        var name = _a.name;
        return "this.$" + name + " = void 0; ";
    }).join('\n') + "\n    ");
    AttributeRefs.prototype.__ModelAttrRef = ModelAttrRef;
    for (var _i = 0, _attributesArray_1 = _attributesArray; _i < _attributesArray_1.length; _i++) {
        var attr = _attributesArray_1[_i];
        var name_1 = attr.name;
        Object.defineProperty(AttributeRefs.prototype, name_1, {
            get: new Function("\n                var x = this.$" + name_1 + ";\n                return x && x.value === this._model." + name_1 + " ?\n                    x :\n                    ( this.$" + name_1 + " = new this.__ModelAttrRef( this._model, '" + name_1 + "' ) );\n            ")
        });
    }
    prototype.__Attributes$ = AttributeRefs;
}
var ModelAttrRef = (function (_super) {
    tslib_1.__extends(ModelAttrRef, _super);
    function ModelAttrRef(model, attr) {
        var _this = _super.call(this, model[attr]) || this;
        _this.model = model;
        _this.attr = attr;
        return _this;
    }
    ModelAttrRef.prototype.set = function (x) {
        this.model[this.attr] = x;
    };
    Object.defineProperty(ModelAttrRef.prototype, "error", {
        get: function () {
            return this._error || (this._error = this.model.getValidationError(this.attr));
        },
        set: function (x) {
            this._error = x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ModelAttrRef.prototype, "descriptor", {
        get: function () {
            return this.model._attributes[this.attr];
        },
        enumerable: true,
        configurable: true
    });
    return ModelAttrRef;
}(Linked));
export { ModelAttrRef };
//# sourceMappingURL=linked-attrs.js.map