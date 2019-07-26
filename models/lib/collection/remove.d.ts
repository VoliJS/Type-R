import { Model } from '../model';
import { TransactionOptions } from '../transactions';
import { CollectionCore } from './commons';
export declare function removeOne(collection: CollectionCore, el: Model | {} | string, options: TransactionOptions): Model;
export declare function removeMany(collection: CollectionCore, toRemove: any[], options: any): any[];
