import { Model } from '../model';
export declare class Store extends Model {
    static endpoint: import("./attributesIO").AttributesEndpoint;
    getStore(): Store;
    get(name: string): any;
    static global: Store;
}
