import { useReducer, useEffect } from 'react';
import { Collection, defaultStore } from '@type-r/models';
export var useModel = mutableHook(function (Model) { return new Mutable(new Model); });
export function useModelCopy(model) {
    var local = useModel(model.constructor);
    useEffect(function () {
        local.assignFrom(model);
        local[defaultStore] = model.getStore();
    }, [model._changeToken]);
    return local;
}
useModel.copy = useModelCopy;
useModel.delayChanges = useDelayChanges;
export function useDelayChanges(model, delay) {
    if (delay === void 0) { delay = 1000; }
    var local = useModelCopy(model);
    useEffect(function () {
        var timeout;
        function onChange() {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(function () {
                model.assignFrom(local);
                timeout = null;
            }, delay);
        }
        local.on('change', onChange);
        return function () {
            local.off('change', onChange);
            if (timeout) {
                clearTimeout(timeout);
                model.assignFrom(local);
            }
        };
    }, []);
    return local;
}
var createSubsetOf = function (collection) { return new Mutable(collection.createSubset([])); };
export var useCollection = {
    of: mutableHook(function (Model) { return new Mutable(new (Collection.of(Model))()); }),
    ofRefs: mutableHook(function (Model) { return new Mutable(new (Collection.ofRefs(Model))()); }),
    subsetOf: function (init) {
        var _a = useReducer(mutableReducer, init, createSubsetOf), mutable = _a[0], forceUpdate = _a[1];
        useEffect(function () {
            var coll = mutable.value;
            coll.resolvedWith || coll.resolve(init);
        }, [Boolean(init.models.length)]);
        useEffect(function () {
            mutable._onChildrenChange = forceUpdate;
            return function () { return mutable.value.dispose(); };
        }, emptyArray);
        return mutable.value;
    }
};
var Mutable = (function () {
    function Mutable(value) {
        this.value = value;
        this._onChildrenChange = void 0;
        this._changeToken = value._changeToken;
        value._owner = this;
        value._ownerKey || (value._ownerKey = 'reactState');
    }
    Mutable.prototype.getStore = function () {
        return this.value._defaultStore;
    };
    return Mutable;
}());
function mutableReducer(mutable) {
    if (mutable._changeToken === mutable.value._changeToken)
        return mutable;
    var copy = new Mutable(mutable.value);
    copy._onChildrenChange = mutable._onChildrenChange;
    return copy;
}
function mutableHook(create) {
    return function (init) {
        var _a = useReducer(mutableReducer, init, create), mutable = _a[0], forceUpdate = _a[1];
        useEffect(function () {
            mutable._onChildrenChange = forceUpdate;
            return function () { return mutable.value.dispose(); };
        }, emptyArray);
        return mutable.value;
    };
}
var emptyArray = [];
//# sourceMappingURL=state.js.map