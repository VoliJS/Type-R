import { Model } from '../model'
import { tools as _ } from '@type-r/mixture'

export type Predicate<R> = ( ( val : R, key? : number ) => boolean ) | Partial<R>;

/**
 * Optimized array methods.
 */
export abstract class ArrayMixin<R extends Model> {
    models : R[]
    abstract get( modelOrId : string | Partial<R> ) : R;

    /**
     * Map and optionally filter the collection.
     * @param mapFilter filter an element out if `undefined` is returned 
     * @param context optional `this` for `mapFilter`
     */
    map<T>( mapFilter : ( val : R, key? : number ) => T, context? : any ) : T[]{
        const { models } = this,
            { length } = models,
            res = Array( length ),
            fun = context ? mapFilter.bind( context ) : mapFilter;

        for( var i = 0, j = 0; i < length; i++ ){
            const val = fun( models[ i ], i );
            val === void 0 || ( res[ j++ ] = val );
        }

        if( i !== j ){
            res.length = j;
        }

        return res;
    }

    /**
     * Iterate through the collection.
     * @param context optional `this` for `iteratee`.
     */
    each<T>( fun : ( val : R, key? : number ) => any, context? : any ) : void {
        const { models } = this,
            { length } = models,
            iteratee = context ? fun.bind( context ) : fun;

        for( let i = 0; i < length; i++ ){
            iteratee( models[ i ], i );
        }
    }

    /**
     * Iterate through collection optionally returning the value.
     * @param doWhile break the loop if anything but `undefined` is returned, and return this value.
     * @param context optional `this` for `doWhile`.
     */
    firstMatch<T>( doWhile : ( val : R, key? : number ) => T ) : T
    firstMatch<T, C>( doWhile : ( this : C, val : R, key? : number ) => T, context : C ) : T
    firstMatch<T>( doWhile : ( val : R, key? : number ) => T, context? : any ) : T {
        const { models } = this,
            { length } = models,
            iteratee = context ? doWhile.bind( context ) : doWhile;

        for( let i = 0; i < length; i++ ){
            const res = iteratee( models[ i ], i );
            if( res !== void 0 ) return res;
        }
    }

    /**
     * Proxy for the `array.reduce()`
     * @param iteratee 
     */
    reduce<T>( iteratee : (previousValue: R, currentValue: R, currentIndex?: number ) => R ) : R
    reduce<T>( iteratee : (previousValue: T, currentValue: R, currentIndex?: number ) => T, init? : any ) : T
    reduce<T>( iteratee : (previousValue: any, currentValue: any, currentIndex?: number ) => any, init? : any ) : T | R {
        return init === void 0 ? this.models.reduce( iteratee ) : this.models.reduce( iteratee, init );
    }

    // Slice out a sub-array of models from the collection.
    slice( begin? : number, end? : number ) : R[] {
        return this.models.slice( begin, end );
    }
  
    indexOf( modelOrId : string | Partial<R> ) : number {
        return this.models.indexOf( this.get( modelOrId ) );
    }

    includes( idOrObj : string | Partial<R> ) : boolean {
        return Boolean( this.get( idOrObj ) );
    }

    filter( iteratee : Predicate<R>, context? : any ) : R[] {
        const fun = toPredicateFunction( iteratee );
        return this.map( m => fun( m ) ? m : void 0, context );
    }

    find( iteratee : Predicate<R>, context? : any ) : R {
        const fun = toPredicateFunction( iteratee );
        return this.firstMatch( m => fun( m ) ? m : void 0, context );
    }

    some( iteratee : Predicate<R>, context? : any ) : boolean {
        return Boolean( this.find( iteratee, context ) );
    }

    forEach( iteratee : ( val : R, key? : number ) => void, context? : any ) : void {
        this.each( iteratee, context );
    }

    values() : IterableIterator<R> {
        return this.models.values();
    }

    entries() : IterableIterator<[ number, R ]>{
        return this.models.entries();
    }

    every( iteratee : Predicate<R>, context? : any ) : boolean {
        const fun = toPredicateFunction( iteratee );
        return this.firstMatch( m => fun( m ) ? void 0 : false, context ) === void 0;
    }

    pluck<K extends keyof R>( key : K ) : R[K][] {
        return this.map( model => model[ key ] );
    }

    first() : R { return this.models[ 0 ]; }

    last() : R { return this.models[ this.models.length - 1 ]; }

    at( a_index : number ) : R {
        const index = a_index < 0 ? a_index + this.models.length : a_index;    
        return this.models[ index ];
    }

    groupBy( attr : keyof R | (( m : R ) => string )) : { [ key : string ] : R[] };
    groupBy<A>(
        attr : keyof R | (( m : R ) => string ),
        a_reducer : ( acc : A, model? : R, key? : string ) => A
    ) : { [ key : string ] : A };
    groupBy<A>(
        attr : keyof R | (( m : R ) => string ),
        reducer : ( acc : A, model? : R, key? : string ) => void,
        init : ( key? : string ) => A
    ) : { [ key : string ] : A };
    groupBy<A>(
        attr : keyof R | (( m : R ) => string ),
        reducer? : ( acc : A, model? : R, key? : string ) => A,
        init? : ( key : string ) => A
    ){
        return _.groupBy( this.models, attr, reducer, init );
    }
}

const noOp = x => x;

function toPredicateFunction<R>( iteratee : Predicate<R> ){
    if( iteratee == null ) return noOp;

    switch( typeof iteratee ){
        case 'function' : return iteratee;
        case 'object' :
            const keys = Object.keys( iteratee );
            
            return x => {
                for( let key of keys ){
                    if( iteratee[ key ] !== x[ key ] )
                        return false;
                }

                return true;
            }
        default : throw new Error( 'Invalid iteratee' );
    }
}