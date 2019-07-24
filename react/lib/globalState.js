import { useEffect, useReducer } from 'react';
export function useChanges(instance) {
    var forceUpdate = useForceUpdate();
    useEffect(function () {
        instance.onChanges(forceUpdate);
        return function () { return instance.offChanges(forceUpdate); };
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