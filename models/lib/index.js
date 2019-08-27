var _a;
if (typeof Symbol === 'undefined') {
    Object.defineProperty(window, 'Symbol', { value: { iterator: 'Symbol.iterator' }, configurable: true });
}
import { Events, Mixable as Class } from '@type-r/mixture';
import { Model } from './model';
export * from './collection';
export * from './io-tools';
export * from '@type-r/mixture';
export * from './model';
export * from './relations';
export * from './transactions';
export { Model as Record, Class };
export { Linked } from '@linked/value';
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
//# sourceMappingURL=index.js.map