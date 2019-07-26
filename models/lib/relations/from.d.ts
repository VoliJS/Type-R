import { ChainableAttributeSpec, Model } from '../model';
import { CollectionReference } from './commons';
export declare function memberOf<R extends typeof Model>(this: void, masterCollection: CollectionReference, T?: R): ChainableAttributeSpec<R>;
