var _a;
if (typeof Symbol === 'undefined') {
    Object.defineProperty(window, 'Symbol', { value: { iterator: 'Symbol.iterator' }, configurable: true });
}
import { Events, Mixable as Class, log } from '@type-r/mixture';
import { attributes, ChainableAttributeSpec, Model, type as _type, value } from './model';
import { isEmpty } from '@type-r/mixture/lib/tools';
export { Linked } from '@linked/value';
export * from '@type-r/mixture';
export * from './collection';
export * from './io-tools';
export * from './model';
export * from './relations';
export * from './transactions';
export { Model as Record, Class };
export var on = (_a = Events, _a.on), off = _a.off, trigger = _a.trigger, once = _a.once, listenTo = _a.listenTo, stopListening = _a.stopListening, listenToOnce = _a.listenToOnce;
export function transaction(method) {
    return function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var result;
        this.transaction(function () {
            result = method.apply(_this, args);
        });
        return result;
    };
}
export function type(t) {
    return Array.isArray(t) ?
        _type(_toModel(t[0]).Collection) :
        _type(_toModel(t));
}
var _toModel = function (t) {
    return t != null && Object.getPrototypeOf(t) === Object.prototype ?
        attributes(t) :
        t;
};
ChainableAttributeSpec.from = function (spec) {
    if (spec && spec instanceof ChainableAttributeSpec) {
        return spec;
    }
    if (typeof spec === 'function')
        return type(spec);
    if (Array.isArray(spec)) {
        if (spec.length !== 1 ||
            !spec[0] || (typeof spec[0] !== 'function' &&
            Object.getPrototypeOf(spec[0]) !== Object.prototype)) {
            log('error', 'Type-R:WrongDeclaration', "Since v4.1, [ ModelType ] and [{ attr1, attr2, }] declares collection of models. Use Array or value([ 1, 2, ... ]) to declare plain array attributes.");
            return value(spec);
        }
        return type(spec);
    }
    if (spec && typeof spec === 'object') {
        if (Object.getPrototypeOf(spec) !== Object.prototype) {
            log('error', 'Type-R:WrongDeclaration', "Since v4.1, non-primitive values must be wrapped in value(...). All objects are treated as attribute specs and define nested models.");
            return value(spec);
        }
        if (isEmpty(spec)) {
            log('error', 'Type-R:WrongDeclaration', "Since v4.1, objects are treated as attribute specs and define nested models. Use Object or value({...}) for an object attribute type.");
            return value(spec);
        }
        return type(spec);
    }
    return value(spec);
};
//# sourceMappingURL=index.js.map