import "@type-r/globals";
import { attributes, collection, logger, metadata, Collection } from '@type-r/models';
import "reflect-metadata";
import { memoryIO, MemoryEndpoint } from '@type-r/endpoints';

logger.off()
    .throwOn( 'error' )
    .throwOn( 'warn' );

describe("attributes 2.0", ()=>{
    describe("standalone models", () =>{
        it("declares a simple class", () => {
            const State = attributes({
                num : 1,
                str : "dede",
                nested : [{
                    num : 1,
                    str : "nest",
                    [metadata] : {
                        endpoint : memoryIO()
                    },
                    [collection]: {
                        comparator : "num"
                    }
                }],

                [metadata] : {
                    endpoint : memoryIO()
                }
            });

            const state = new State();
            
            expect( state.num ).toBe( 1 );
            expect( state.str ).toBe( "dede" );
            expect( state.nested ).toBeInstanceOf( Collection );
            expect( state[metadata] ).toBeUndefined();

            state.nested.add({});
            expect( state.nested.first()[metadata] ).toBeUndefined();
            expect( state.nested.first()[collection] ).toBeUndefined();
            expect( state.nested.first().$[collection] ).toBeUndefined();
        })
    });

    it('does proper extend', () =>{
        const Base = attributes({
            a : 1
        });

        const Derived = attributes( Base, {
            b : 2
        });

        const d = new Derived();

        expect( d ).toBeInstanceOf( Base );
        expect( d.$.a.value ).toBe( 1 );
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
        expect( d.$.a.value ).toBe( 1 );
        expect( d.$.m.value ).toBe( 1 );
        expect( d.$.b.value ).toBe( 2 );
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

    it('support regular class extend', () => {
        class State extends attributes({
            a : 1,
            b : "b",

            [metadata] : {
                endpoint : memoryIO()
            }
        }){
            get sum(){
                return this.a + this.b
            }
        }

        const state = new State();

        expect( state.getEndpoint() ).toBeInstanceOf( MemoryEndpoint );
        expect( state.sum ).toBe( "1b" );
        expect( state.$.b.value ).toBe("b")
    })
});