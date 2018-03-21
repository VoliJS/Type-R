var Nested = require( '../../../dist/index' ),
    expect = require( 'chai' ).expect,
    sinon = require( 'sinon' );

var Model = Nested.Model, Collection = Nested.Collection;

describe( 'Memory management', function(){
    var M = Model.extend();
    
    M.define({
        attributes : {
            x : Number.integer,
            agg : M.value( null ),
            ref : M.shared,
            col : M.Collection,
            refs : M.Collection.shared,
            ids : M.Collection.subsetOf( 'col' ) 
        }
    });

    var singleton = new M();

    it( 'Aggregated values are recursively disposed', function(){
        var m = new M();
        m.agg = {};

        var x = m.col, y = m.agg;
        m.dispose();
        expect( x._disposed ).to.be.true;
        expect( y._disposed ).to.be.true;
    } );

    it( 'Aggregated value is disposed when overwritten', function(){
        var m = new M();
        m.agg = {};

        var y = m.agg;

        m.agg = null;

        expect( y._disposed ).to.be.true;        
    });

    it( 'Aggregated collection item is disposed when removed from collection', function(){
        var m = new M();
        m.col.add( {} );

        var y = m.col.first();

        m.col = [];

        expect( y._disposed ).to.be.true;        
    });

    it( 'Aggregated collection item is not disposed when unset', function(){
        var m = new M();
        m.col.add( { id : 1 } );

        var y = m.col.first();
        var z = m.col.unset( 1 );

        expect( y ).to.eql( z );
        expect( y._disposed ).to.be.undefined;        
    });

    it( 'Aggregated record attribute is not disposed when unset', function(){
        var m = new M();

        var y = m.unset( 'col' );

        expect( y._disposed ).to.be.undefined;        
    });

    it( 'Shared refs do not create a leak', function(){
        var m = new M();
        m.ref = singleton;
        m.refs = [ singleton ];

        expect( singleton._events.change.next.next ).to.be.null;

        m.dispose();
        expect( m._disposed ).to.be.true;

        expect( singleton._events.change ).to.be.undefined;
        expect( singleton._disposed ).to.be.undefined;
    } );


});