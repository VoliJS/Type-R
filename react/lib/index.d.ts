import { Messenger } from '@type-r/models';
export * from './state';
export * from './globalState';
export * from '@linked/react';
export * from './pureRender';
export declare function useEvent(source: Messenger, event: string, handler: Function): void;
