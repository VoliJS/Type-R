import { Model } from '../model';
export declare class Store extends Model {
    getStore(): Store;
    get(name: string): any;
    static get global(): Store;
    static set global(store: Store);
}
