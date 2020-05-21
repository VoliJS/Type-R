import { __decorate, __extends } from "tslib";
import { Model } from '../model';
import { Transactional } from '../transactions';
import { attributesIO } from './attributesIO';
import { define } from '@type-r/mixture';
var _store = null;
var Store = (function (_super) {
    __extends(Store, _super);
    function Store() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Store.prototype.getStore = function () { return this; };
    Store.prototype.get = function (name) {
        var local = this[name];
        if (local || this === this._defaultStore)
            return local;
        return this._owner ? this._owner.getStore().get(name) : this._defaultStore.get(name);
    };
    Object.defineProperty(Store, "global", {
        get: function () { return _store; },
        set: function (store) {
            if (_store) {
                _store.dispose();
            }
            Transactional.prototype._defaultStore = _store = store;
        },
        enumerable: true,
        configurable: true
    });
    Store.endpoint = attributesIO();
    Store = __decorate([
        define
    ], Store);
    return Store;
}(Model));
export { Store };
Store.global = new Store();
//# sourceMappingURL=store.js.map