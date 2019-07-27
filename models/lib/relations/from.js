import * as tslib_1 from "tslib";
import { AnyType, ChainableAttributeSpec, Model } from '../model';
import { parseReference } from './commons';
var ModelRefType = (function (_super) {
    tslib_1.__extends(ModelRefType, _super);
    function ModelRefType() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ModelRefType.prototype.toJSON = function (value) {
        return value && typeof value === 'object' ? value.id : value;
    };
    ModelRefType.prototype.clone = function (value) {
        return value && typeof value === 'object' ? value.id : value;
    };
    ModelRefType.prototype.isChanged = function (a, b) {
        var aId = a && (a.id == null ? a : a.id), bId = b && (b.id == null ? b : b.id);
        return aId !== bId;
    };
    ModelRefType.prototype.validate = function (model, value, name) { };
    return ModelRefType;
}(AnyType));
function theMemberOf(masterCollection, T) {
    var getMasterCollection = parseReference(masterCollection);
    var typeSpec = new ChainableAttributeSpec({
        value: null,
        _metatype: ModelRefType
    });
    return typeSpec
        .get(function (objOrId, name) {
        if (typeof objOrId === 'object')
            return objOrId;
        var collection = getMasterCollection(this);
        var record = null;
        if (collection && collection.length) {
            record = collection.get(objOrId) || null;
            this.attributes[name] = record;
            record && this._attributes[name].handleChange(record, null, this, {});
        }
        return record;
    });
}
export { theMemberOf as memberOf };
Model.memberOf = theMemberOf;
//# sourceMappingURL=from.js.map