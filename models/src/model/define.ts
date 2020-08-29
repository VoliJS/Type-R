import { LinkedModelHash } from './linked-attrs'
import { Infer } from './attrDef';
import { Model, ModelEntriesIterator, MakeModelConstructor } from './model';
import { CollectionConstructor, GenericComparator } from '../collection';
import { TheType, EventMap } from '@type-r/mixture';
import { IOEndpoint } from '../io-tools';

export const collection = Symbol("Methods definitions");
export const metadata = Symbol("Methods definitions");

// TODO: getters and setters can go to the attributes object.
// Methods can be added though the class.

export interface AnonimousModelDefinition {
    [metadata]? : {
        idAttribute? : string
        endpoint? : IOEndpoint
    }

    [collection]? : {
        itemEvents? : { [ event : string ] : true | string | (( ...args : any[] ) => void ) }
        comparator? : GenericComparator
        
        initialize?( models? : any[], options? : object ) : void
        parse?( json : any ) : object[]
        toJSON?( options? : any ) : any
        validate?() : any
    }

    [attribute : string] : any
}

export function parseAnonimousModelDefinition({ [metadata] : md, [collection] : coll, ...attributes } : AnonimousModelDefinition){
    return {
        attributes,
        collection : coll,
        ...md
    }
}

export type AnonymousAttributes<D> =
    AnonymousModelConstructor<Omit<D,typeof metadata|typeof collection>>

export type AnonymousModelConstructor<A extends object> =
    MakeModelConstructor<
        ModelAttributes<A>,
        A
    >

export type ModelAttributes<A extends object> =
    Model & InferAttrs<A> & {
        readonly $ : LinkedModelHash<InferAttrs<A>>
    }

export type MergeModelConstructors<First extends typeof Model, Second extends typeof Model> =
    MakeModelConstructor<
        MergeModels<InstanceType<First>, InstanceType<Second> >,
        First['attributes'] & Second['attributes']
    >

export type MergeModels<First extends Model, Second extends Model> =
    Model &
    Omit<First,"$"> &
    Omit<Second,"$"> & //Remove, just do First & Second
    {
        readonly $ : First['$'] & Second['$']
        [ Symbol.iterator ]() : ModelEntriesIterator
        _localEvents : EventMap;
    } 

export type InferAttrs<A extends object> = {
    [K in keyof A]: Infer<A[K]>
};