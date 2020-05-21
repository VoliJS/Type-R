import { define, predefine, tools, mixins } from '@type-r/mixture';
import { Transactional } from '../transactions';
import { type } from './attrDef';
import { addAttributeLinks } from './linked-attrs';
import { createAttributesMixin } from './mixin';
import { Model, ModelConstructor, ModelDefinition } from './model';

export * from './attrDef';
export * from './metatypes';
export { AttributesMixin, InferAttrs, LinkedAttributes, ModelConstructor } from './model';
export { Model };

const { assign, defaults } = tools;

export function attributes<D extends object, B1 extends typeof Model, B2 extends typeof Model, B3 extends typeof Model>( b1 : B1, b2 : B2, b3 : B3, attrDefs : D ) : ModelConstructor<D & B1['attributes'] & B2['attributes'] & B3['attributes']>;
export function attributes<D extends object, B1 extends typeof Model, B2 extends typeof Model>( b1 : B1, b2 : B2, attrDefs : D ) : ModelConstructor<D & B1['attributes'] & B2['attributes']>;
export function attributes<D extends object, B1 extends typeof Model>( b1 : B1, attrDefs : D ) : ModelConstructor<D & B1['attributes']>;
export function attributes<D extends object>( attrDefs : D ) : ModelConstructor<D>;
export function attributes<D extends object>( ...models : any[] ) : ModelConstructor<D> {
    const attrDefs = models[ models.length - 1 ],
        BaseClass = models.length > 1 ? models[ 0 ] : null;

    // Create model class
    class NamelessModel extends ( BaseClass || Model ) {
        static attributes = attrDefs;
    }

    // apply mixins...
    if( models.length > 2 ){
        mixins( models.slice( 1, models.length - 1 ) )( NamelessModel );
    }

    // seal the definition.
    define( NamelessModel );

    return NamelessModel as any;
}

Model.onExtend = function( this : typeof Model, BaseClass : typeof Model ){
    Transactional.onExtend.call( this, BaseClass );

    // Create the default collection
    const Class = this;

    @predefine class DefaultCollection extends BaseClass.Collection {
        static model = Class;
    }

    this.DefaultCollection = DefaultCollection;

    // If there are no collection defined in statics, use the default collection.
    // It will appear in onDefine's definition, overriding all other settings.
    if( Class.Collection === BaseClass.Collection ){
        this.Collection = DefaultCollection;
    }
}

Model.onDefine = function( definition : ModelDefinition, BaseClass : typeof Model ){
    const baseProto : Model = BaseClass.prototype;

    // Compile attributes spec, creating definition mixin.
    const { properties, _localEvents, ...dynamicMixin } = createAttributesMixin( this.attributes = getAttributes( definition ), baseProto._attributes );
    assign( this.prototype, dynamicMixin );
    
    definition.properties = defaults( definition.properties || {}, properties );
    definition._localEvents = _localEvents;
    
    Transactional.onDefine.call( this, definition, BaseClass );

    // Finalize the definition of the default collection.
    this.DefaultCollection.define( definition.collection || {} );

    // assign collection from the definition.
    this.Collection = definition.Collection;
    this.Collection.prototype.model = this;

    if( definition.endpoint ) this.Collection.prototype._endpoint = definition.endpoint;

    addAttributeLinks( this );
}

function getAttributes({ defaults, attributes, idAttribute } : ModelDefinition ) {
    const definition = attributes || defaults || {};
    
    // If there is an undeclared idAttribute, add its definition as untyped generic attribute.
    if( idAttribute && !( idAttribute in definition ) ){
        definition[ idAttribute ] = void 0;
    }

    return definition;
}

declare var Reflect;

export function auto( value : any ) : PropertyDecorator;
export function auto( proto : object, attrName : string ) : void;
export function auto( proto, attrName? : string ) : any {
    if( typeof Reflect !== 'undefined' && Reflect.getMetadata ){
        if( attrName ){
            type( Reflect.getMetadata( "design:type", proto, attrName ) ).as( proto, attrName );
        }
        else{
            const value = proto;
            return ( proto : object, attrName : string ) : void => {
                type( Reflect.getMetadata( "design:type", proto, attrName ) ).value( value ).as( proto, attrName );
            }
        }        
    }
    else{
        proto._log( 'error', 'Type-R:MissingImport', 'Add import "reflect-metadata"; as the first line of your app.' );
    }    
}