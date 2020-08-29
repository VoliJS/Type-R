import "@type-r/globals";
import { attributes, collection, logger, metadata } from '@type-r/models';
import "reflect-metadata";
import { memoryIO, MemoryEndpoint } from '@type-r/endpoints';

logger.off()
    .throwOn( 'error' )
    .throwOn( 'warn' );

describe("attributes 2.0", ()=>{
    it('does proper extend', () =>{
        const Base = attributes({
            a : 1
        });

        const Derived = attributes( Base, {
            b : 2
        });

        const d = new Derived();

        expect( d ).toBeInstanceOf( Base );
        expect( d.$.b.value ).toBe( 2 );
    });

    it('mix in many elements', () =>{
        const Base = attributes({
            a : 1
        });

        const Mixin = attributes({
            m : 1
        });

        const Derived = attributes( Base, Mixin, {
            b : 2
        });

        const d = new Derived();

        expect( d.a ).toBe( 1 );
        expect( d.m ).toBe( 1 );
        expect( d.b ).toBe( 2 );
    });

    it('support metadata', () =>{
        const State = attributes({
            a : 1,
            b : String,

            [metadata] : {
                endpoint : memoryIO()
            }
        });

        const state = new State();

        expect( state.getEndpoint() ).toBeInstanceOf( MemoryEndpoint );
    });
});