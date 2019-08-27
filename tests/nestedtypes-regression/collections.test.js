var Nested = require( '@type-r/models' ),
    expect = require( 'chai' ).expect;

require( '@type-r/globals' );

var Model = Nested.Model.extend({
    defaults : {
        data : ''
    },

    parse : function( d ){
        return { data : d };
    }
});

describe( 'Collections', function(){
    describe( 'Collection#constructor', function(){
        it( 'invoked wo/arguments', function(){
            var c = new Model.Collection();
            expect( c.length ).to.eql( 0 );
        });

        it( 'takes single model', function(){
            var m = new Model();
                c = new Model.Collection( m );

            expect( c.length ).to.eql( 1 );
            expect( c.first() ).to.eql( m );
        });

        it( 'takes attributes', function(){
            var c = new Model.Collection({ data : 'hi' });

            expect( c.length ).to.eql( 1 );
            expect( c.first().data ).to.eql( 'hi' );
        });

        it( 'takes an empty array', function(){
            var c = new Model.Collection( [] );
            expect( c.length ).to.eql( 0 );
        });

        it( 'takes an array of models', function(){
            var m = new Model();
            c = new Model.Collection([ m, new Model() ]);

            expect( c.length ).to.eql( 2 );
            expect( c.first() ).to.eql( m );
        });

        it( 'takes an array of attributes', function(){
            var c = new Model.Collection([{ data : '1' }, { data : '2' }]);

            expect( c.length ).to.eql( 2 );
            expect( c.first().data ).to.eql( '1' );
            expect( c.last().data ).to.eql( '2' );
        });

        it( 'parses raw data', function(){
            var c = new Model.Collection([ '1' , '2' ], { parse : true });

            expect( c.length ).to.eql( 2 );
            expect( c.first().data ).to.eql( '1' );
            expect( c.last().data ).to.eql( '2' );
        } );
    } );
} );