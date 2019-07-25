import React, { ComponentType, Component } from 'react'
import { InferAttrs, attributes, Transactional, ValueLink } from '@type-r/models';

/**
 * Create the pure-render version of component
 * @param props props types definition using Type-R notation
 * @param React React component
 */
export function pureRenderProps<T extends object>( props : T, Comp : ComponentType<InferAttrs<T>> ) : ComponentType<InferAttrs<T>> {
    const { prototype } = attributes( props ),
          { _attributes } = prototype as any,
          keys = Object.keys( props );

    const createVector = new Function( `props`, `
        return [
            ${ keys.map( key =>
                propForType( _attributes[ key ].type, key )
            ).join( ', ')}
        ]
    `);

    const compareVector = new Function( `props`, `vector`,`
        return ${ keys.map( ( key, idx ) =>
            `vector[${idx}] !== ( ${propForType( _attributes[ key ].type, key )} )`
        ).join( ' || ')};
    `);

    class PureRenderWrapper extends Component<InferAttrs<T>> {
        private _vector : any[]

        constructor( props ){
            super( props );
            this._vector = createVector( this.props );
        }

        shouldComponentUpdate( nextProps ){
            return compareVector( nextProps, this._vector );
        }

        componentDidUpdate(){
            this._vector = createVector( this.props );
        }

        render(){
            return <Comp {...this.props} />;
        }
    }

    return PureRenderWrapper as any;
}

function propForType( type : Function, key : string ) : string {
    return  type.prototype instanceof Transactional ? `props.${key} && props.${key}._changeToken` :
            type === Date ? `props.${key} && props.${key}.getTime()` :
            type.prototype instanceof ValueLink ? `props.${key} && props.${key}.value` :
            `props.${key}`;
}