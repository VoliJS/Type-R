/// <reference types="react" />
import { Transactional, Store } from '@type-r/models';
export declare function useChanges(instance: Transactional): void;
export declare function useForceUpdate(): import("react").Dispatch<Transactional>;
export declare const StoreContext: import("react").Context<Store>;
export declare function useStore(): Store;
