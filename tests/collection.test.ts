import { Collection, Model, define, CollectionConstructor, AttributesMixin } from '@type-r/models'

interface Data extends AttributesMixin<typeof Data>{}

@define class Data extends Model {
    static attributes = {
        time : Date,
        str : String,
        num : Number
    }
}

describe( 'Collection', () =>{
    describe( 'Array methods', () => {
        describe( 'reduce', () => {
            it( 'groups items', () =>{
                const items = new ( Collection.of( Data ) );

                items.add([
                    { num : 1, str : '1' },
                    { num : 2, str : '2' },
                    { num : 3, str : '2' },
                ])
    
                const result = items.groupBy( 'str' );
    
                expect( result[ '1' ].length ).toEqual( 1 );
                expect( result[ '2' ].length ).toEqual( 2 );
            })

            it( 'filter items', () =>{
                const items = new ( Collection.of( Data ) );

                items.add([
                    { num : 1, str : '1' },
                    { num : 2, str : '2' },
                    { num : 3, str : '2' },
                    { num : 3, str : null },
                ])
    
                const result = items.groupBy( x => x.str );
    
                expect( result[ '1' ].length ).toEqual( 1 );
                expect( result[ '2' ].length ).toEqual( 2 );
                expect( result[ 'null' ] ).toEqual( undefined );
            })

            it( 'counts items', () =>{
                const items = new ( Collection.of( Data ) );

                items.add([
                    { num : 1, str : '1' },
                    { num : 2, str : '2' },
                    { num : 3, str : '2' },
                ])
    
                const result = items.groupBy( 'str', ( n : number = 0 ) => n + 1 );
    
                expect( result[ '1' ] ).toEqual( 1 );
                expect( result[ '2' ] ).toEqual( 2 );
            })
        })
    } )
})