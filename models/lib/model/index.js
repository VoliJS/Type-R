import { __decorate, __extends, __rest } from "tslib";
import { define, predefine, tools, mixins } from '@type-r/mixture';
import { Transactional } from '../transactions';
import { type } from './attrDef';
import { addAttributeLinks } from './linked-attrs';
import { createAttributesMixin } from './mixin';
import { Model } from './model';
export * from './attrDef';
export * from './metatypes';
export { Model };
var assign = tools.assign, defaults = tools.defaults;
export function attributes() {
    var models = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        models[_i] = arguments[_i];
    }
    var attrDefs = models[models.length - 1], BaseClass = models.length > 1 ? models[0] : null;
    var NamelessModel = (function (_super) {
        __extends(NamelessModel, _super);
        function NamelessModel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        NamelessModel.attributes = attrDefs;
        return NamelessModel;
    }((BaseClass || Model)));
    if (models.length > 2) {
        mixins(models.slice(1, models.length - 1))(NamelessModel);
    }
    define(NamelessModel);
    return NamelessModel;
}
Model.onExtend = function (BaseClass) {
    Transactional.onExtend.call(this, BaseClass);
    var Class = this;
    var DefaultCollection = (function (_super) {
        __extends(DefaultCollection, _super);
        function DefaultCollection() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DefaultCollection.model = Class;
        DefaultCollection = __decorate([
            predefine
        ], DefaultCollection);
        return DefaultCollection;
    }(BaseClass.Collection));
    this.DefaultCollection = DefaultCollection;
    if (Class.Collection === BaseClass.Collection) {
        this.Collection = DefaultCollection;
    }
};
Model.onDefine = function (definition, BaseClass) {
    var baseProto = BaseClass.prototype;
    var _a = createAttributesMixin(this.attributes = getAttributes(definition), baseProto._attributes), properties = _a.properties, _localEvents = _a._localEvents, dynamicMixin = __rest(_a, ["properties", "_localEvents"]);
    assign(this.prototype, dynamicMixin);
    definition.properties = defaults(definition.properties || {}, properties);
    definition._localEvents = _localEvents;
    Transactional.onDefine.call(this, definition, BaseClass);
    this.DefaultCollection.define(definition.collection || {});
    this.Collection = definition.Collection;
    this.Collection.prototype.model = this;
    if (definition.endpoint)
        this.Collection.prototype._endpoint = definition.endpoint;
    addAttributeLinks(this);
};
function getAttributes(_a) {
    var defaults = _a.defaults, attributes = _a.attributes, idAttribute = _a.idAttribute;
    var definition = attributes || defaults || {};
    if (idAttribute && !(idAttribute in definition)) {
        definition[idAttribute] = void 0;
    }
    return definition;
}
export function auto(proto, attrName) {
    if (typeof Reflect !== 'undefined' && Reflect.getMetadata) {
        if (attrName) {
            type(Reflect.getMetadata("design:type", proto, attrName)).as(proto, attrName);
        }
        else {
            var value_1 = proto;
            return function (proto, attrName) {
                type(Reflect.getMetadata("design:type", proto, attrName)).value(value_1).as(proto, attrName);
            };
        }
    }
    else {
        proto._log('error', 'Type-R:MissingImport', 'Add import "reflect-metadata"; as the first line of your app.');
    }
}
//# sourceMappingURL=index.js.map