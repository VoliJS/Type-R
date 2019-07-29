import { define, predefine, tools } from '@type-r/mixture';
import { Transactional } from '../transactions';
import { type } from './attrDef';
import { createAttributesMixin } from './mixin';
import { InferAttrs, Model, ModelConstructor, ModelDefinition } from './model';

import { addAttributeLinks } from './linked-attrs'

export * from './attrDef';
export * from './metatypes';
export { AttributesMixin, LinkedAttributes, InferAttrs, ModelConstructor } from './model';
export { Model };

const { assign, defaults } = tools;

export function attributes<D extends object>( attrDefs : D ) : ModelConstructor<InferAttrs<D>> {
    @define class DefaultModel extends Model {
        static attributes = attrDefs;
    }

    return DefaultModel as any;
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