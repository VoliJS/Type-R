import { useReducer, useEffect } from 'react';
import { Collection } from '@type-r/models';
export var useModel = mutableHook(function (Model) { return new Mutable(new Model); });
export var useCollection = {
    of: mutableHook(function (Model) { return new Mutable(new (Collection.of(Model))()); }),
    ofRefs: mutableHook(function (Model) { return new Mutable(new (Collection.ofRefs(Model))()); }),
    subsetOf: mutableHook(function (collection) { return new Mutable(collection.createSubset([])); })
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
            mutable._onChildrenChange = function (obj) { return forceUpdate(obj); };
            return function () { return mutable.value.dispose(); };
        }, emptyArray);
        return mutable.value;
    };
}
var emptyArray = [];
//# sourceMappingURL=state.js.map