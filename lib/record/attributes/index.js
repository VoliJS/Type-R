export * from './any';
export * from './owned';
export * from './date';
export * from './basic';
export * from './shared';
export * from './updates';
export * from './attrDef';
import { AnyType } from './any';
export function createSharedTypeSpec(Constructor, Attribute) {
    if (!Constructor.hasOwnProperty('shared')) {
        Object.defineProperty(Constructor, 'shared', {
            get: function () {
                return new ChainableAttributeSpec({
                    value: null,
                    type: Constructor,
                    _attribute: Attribute
                });
            }
        });
    }
}
import { toAttributeOptions } from './attrDef';
export function createAttribute(spec, name) {
    return AnyType.create(toAttributeOptions(spec), name);
}
import { ChainableAttributeSpec } from './attrDef';
import { TimestampType, MSDateType } from './date';
Object.defineProperties(Date, {
    microsoft: {
        get: function () {
            return new ChainableAttributeSpec({
                type: Date,
                _attribute: MSDateType
            });
        }
    },
    timestamp: {
        get: function () {
            return new ChainableAttributeSpec({
                type: Date,
                _attribute: TimestampType
            });
        }
    }
});
import { NumericType } from './basic';
Number.integer = function (x) { return x ? Math.round(x) : 0; };
Number.integer._attribute = NumericType;
if (typeof window !== 'undefined') {
    window.Integer = Number.integer;
}
//# sourceMappingURL=index.js.map