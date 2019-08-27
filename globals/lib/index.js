import { Integer, MicrosoftDate, Timestamp } from '@type-r/ext-types';
import { type, ChainableAttributeSpec } from '@type-r/models';
Function.prototype.value = function (x) {
    return new ChainableAttributeSpec({ type: this, value: x, hasCustomDefault: true });
};
Object.defineProperty(Function.prototype, 'isRequired', {
    get: function () { return this._isRequired || this.has.isRequired; },
    set: function (x) { this._isRequired = x; }
});
Object.defineProperty(Function.prototype, 'asProp', {
    get: function () { return this.has.asProp; },
});
Object.defineProperty(Function.prototype, 'has', {
    get: function () {
        return this._has || type(this);
    },
    set: function (value) { this._has = value; }
});
Object.defineProperties(Date, {
    microsoft: {
        value: MicrosoftDate
    },
    timestamp: {
        value: Timestamp
    }
});
Number.integer = Integer;
if (typeof window !== 'undefined') {
    window.Integer = Integer;
}
//# sourceMappingURL=index.js.map