import { useEffect, useReducer } from 'react';
export function useChanges(instance) {
    var forceUpdate = useForceUpdate();
    useEffect(function () {
        function onChange(x) {
            forceUpdate(x);
        }
        instance.onChanges(onChange);
        return function () { return instance.offChanges(onChange); };
    }, emptyArray);
}
var emptyArray = [];
export function useForceUpdate() {
    return useReducer(transactionalUpdate, null)[1];
}
function transactionalUpdate(_changeToken, modelOrCollection) {
    return modelOrCollection._changeToken;
}
//# sourceMappingURL=globalState.js.map