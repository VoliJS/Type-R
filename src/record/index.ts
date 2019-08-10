import { define, predefine, tools } from '../object-plus';
import { Transactional } from '../transactions';
import { type } from './attrDef';
import { createAttributesMixin } from './mixin';
import { InferAttrs, Record, RecordConstructor, RecordDefinition } from './record';

export * from './attrDef';
export * from './metatypes';
export { AttributesMixin, InferAttrs, RecordConstructor } from './record';
export { Record };

const { assign, defaults } = tools;

export function attributes<D extends object>( attrDefs : D ) : RecordConstructor<InferAttrs<D>> {
    @define class DefaultRecord extends Record {
        static attributes = attrDefs;
    }

    return DefaultRecord as any;
}

Record.onExtend = function( this : typeof Record, BaseClass : typeof Record ){
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

Record.onDefine = function( definition : RecordDefinition, BaseClass : typeof Record ){
    const baseProto : Record = BaseClass.prototype;

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
}

function getAttributes({ defaults, attributes, idAttribute } : RecordDefinition ) {
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