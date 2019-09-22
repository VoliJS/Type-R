import { Model } from './model'
import { Linked } from '@linked/value'
import { Transactional } from '../transactions';

export function addAttributeLinks( Class : typeof Model ){
    const { prototype } = Class;
    const { _attributesArray } = prototype;

    const AttributeRefs = new Function('model', `
        this._model = model;
        ${ _attributesArray.map( ({ name }) => `this.$${name} = void 0; `).join( '\n' )}
    `)

    AttributeRefs.prototype.__ModelAttrRef = LinkedAttr;

    for( let attr of _attributesArray ){
        const { name } = attr;
        
        Object.defineProperty( AttributeRefs.prototype, name, {
            get : new Function( attr.isMutableType() ? `
                var cached = this.$${name},
                    value = this._model.${name},
                    token = value && value._changeToken;

                return cached && cached._token === token ? cached :
                    ( this.$${name} = new this.__ModelAttrRef( this._model, '${name}', value, token ) );
            ` : `
                var cached = this.$${name};

                return cached && cached.value === this._model.${name} ? cached :
                    ( this.$${name} = new this.__ModelAttrRef( this._model, '${name}', this._model.${name} ) );
            `) as any
        });
    }

    prototype.__Attributes$ = AttributeRefs as any;
}

export type LinkedModelHash<T extends object>= {
    readonly [ K in keyof T ] : LinkedAttr<T[K]>
}

export class LinkedAttr<T> extends Linked<T> {
    constructor( protected model : Model, protected attr : string, value, protected _token ){
        super( value );
    }

    set( x : T ){
        this.model[ this.attr ] = x;
    }

    _error : any

    get error(){
        return this._error || ( this._error = this.model.getValidationError( this.attr ) );
    }

    set error( x : any ){
        this._error = x;
    }

    // Attribute's descriptor.
    get descriptor(){
        return this.model._attributes[ this.attr ];
    }
}

Object.defineProperty( LinkedAttr.prototype, '_changeToken', { value : null } );