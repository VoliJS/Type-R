import { GenericComparator } from '../collection';
import { IOEndpoint } from '../io-tools';
import { Infer } from './attrDef';
import { LinkedModelHash } from './linked-attrs';
import { MakeModelConstructor, Model } from './model';

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

export type AnonymousAttributes<D extends object> =
    AnonymousModelConstructor<D>

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
        InstanceType<First> & InstanceType<Second>,
        First['attributes'] & Second['attributes']
    >

export type InferAttrs<A extends object> = {
    [K in Exclude<keyof A, typeof metadata|typeof collection>]: Infer<A[K]>
};