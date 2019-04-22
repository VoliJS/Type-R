import { IOEndpoint, IONode, IOOptions, IOPromise } from '../io-tools';
import { TransactionOptions } from '../transactions';
export interface IORecord extends IONode {
    getEndpoint(): IOEndpoint;
    save(options?: object): IOPromise<this>;
    fetch(options?: object): IOPromise<this>;
    destroy(options?: object): IOPromise<this>;
    toJSON(options?: object): any;
    parse(data: any, options?: object): any;
    isNew(): boolean;
    id: string | number;
    set(json: object, options: TransactionOptions): this;
}
export declare const IORecordMixin: {
    save(this: IORecord, options?: IOOptions): IOPromise<any>;
    fetch(options?: IOOptions): IOPromise<any>;
    destroy(options?: IOOptions): IOPromise<any>;
};
