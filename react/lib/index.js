import { useEffect } from 'react';
export * from './state';
export * from './globalState';
export * from '@linked/react';
export * from './pureRender';
export function useEvent(source, event, handler) {
    useEffect(function () {
        source.on(event, handler);
        return function () {
            source.off(event, handler);
        };
    }, []);
}
//# sourceMappingURL=index.js.map