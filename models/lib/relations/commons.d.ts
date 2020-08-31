import { Collection } from '../collection';
import { Model } from '../model';
export declare type CollectionReference = ((self: any) => Collection) | Collection | string;
export declare function parseReference(collectionRef: CollectionReference): (root: Model) => Collection;
