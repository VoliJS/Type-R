var Nested = require( '@type-r/models' );
require( '@type-r/globals' );

const { shared } = Nested;

var Model = Nested.Model, Collection = Nested.Collection;

describe( 'Advanced functionality', function(){
    var M = Model.extend({
        attributes : {
            name : String
        }
    });

    describe( 'shared( Model ) attribute', function(){
        var A = Model.extend({
            attributes : {
                shared : shared( M ),
                owned : M
            }
        });

        it( 'initialized with null', function(){
            var a = new A();
            expect( a.shared ).toBe( null );
        } );

        it( "Record don't attempt to take ownership on shared attributes", function(){
            var a = new A();
            var m = new M();
            a.shared = m;
            expect( m._owner ).toBe( void 0 );
        } );

        it( "can be assigned with owned model", function(){
            var a = new A(), b = new A();
            
            a.shared = b.owned;
            expect( a.shared._owner ).toBe( b );            
        });

        it( "Internal changes are tracked and cause owner 'change' event.", function(){
            var a = new A(), b = new A();            
            a.shared = b.owned;

            var callback = jest.fn();;
            a.on( 'change', callback );
            b.owned.name = "Haha!";
            expect( a.shared.name ).toBe( 'Haha!' );
            expect( callback ).toBeCalledTimes( 1 );
        } );

        it( "Can be updated in place", function(){
            var a = new A(), b = new A();            
            a.shared = b.owned;

            a.set({ shared : { name : "noway" } } );
            expect( a.shared.name ).toBe( 'noway' );
            expect( a.shared ).toBe( b.owned );
        } );

        it( "is converted to the aggregated model on assignment", function(){
            var a = new A();
            a.shared = { name : 'Hey' };
            expect( a.shared.name ).toBe( 'Hey' );
            expect( a.shared._owner ).toBe( a );
        } );
        
        it( "is not serialized", function(){
            var a = new A();
            a.shared = { name : 'Hey' };
            expect( a.toJSON() ).toEqual({ owned : { name : "" }});
        });
    });

    describe( 'shared( Collection ) attribute', function(){
        var A = Model.extend({
            attributes : {
                sharedC : shared( M.Collection ),
                ownedC : M.Collection
            }
        });

        it( 'initialized with null', function(){
            var a = new A();
            expect( a.sharedC ).toBe( null );
        } );

        it( "Record don't attempt to take ownership on shared attributes", function(){
            var a = new A();
            var m = new M.Collection();
            a.coll = m;
            expect( m._owner ).toBe( void 0 );
        } );

        it( "can be assigned with owned model", function(){
            var a = new A(), b = new A();
            
            a.sharedC = b.ownedC;
            expect( a.sharedC._owner ).toBe( b );            
        });

        it( "Internal changes are tracked and cause owner 'change' event.", function(){
            var a = new A(), b = new A();            
            a.sharedC = b.ownedC;

            var callback = jest.fn();
            a.on( 'change', callback );
            b.ownedC.add({ name : "Haha!" });
            expect( a.sharedC.first().name ).toBe( 'Haha!' );
            b.ownedC.first().name = "1";
            expect( callback ).toBeCalledTimes( 2 );
        } );

        it( "Can be updated in place", function(){
            var a = new A(), b = new A();            
            a.sharedC = b.ownedC;

            a.set({ sharedC : [ { name : "noway" } ] } );
            expect( a.sharedC.first().name ).toBe( 'noway' );
            expect( a.sharedC ).toBe( b.ownedC );
        } );

        it( "is converted to the owned Refs collection on assignment", function(){
            var a = new A();
            a.sharedC = [{ name : 'Hey' }];
            expect( a.sharedC.first().name ).toBe( 'Hey' );
            expect( a.sharedC._owner ).toBe( a );

            var callback = jest.fn();
            a.on( 'change', callback );
            a.sharedC.first().name = "Haha!";
            expect( callback ).toBeCalledTimes( 1 );
        } );
        
        it( "is not serialized", function(){
            var a = new A();
            a.sharedC = [{ name : 'Hey' }];
            expect( a.toJSON() ).toEqual({ ownedC : []});
        });
    });

    describe( 'Collection.Refs', function(){
        var M = Model.extend({
            attributes : {
                name : String
            }
        });

        var A = Model.extend({
            attributes : {
                subset : M.Collection.Refs,
                aggregated : M.Collection
            }
        });

        it( 'inherits from collection type', function(){
            expect( Collection.Subset.prototype ).toBe( Collection.prototype );

            var M = Model.extend({});

            expect( M.Collection ).not.toBe( Collection );
            expect( M.Collection.prototype ).toBeInstanceOf( Collection );
            expect( M.Collection.Subset.prototype ).toBe( M.Collection.prototype ); 
        } );

        it( "doesn't take ownership on its elements", function(){
            var a = new A();

            a.subset.set([ { name : '1'}, { name : '2'} ]);
            a.aggregated.set( a.subset.models );
            expect( a.aggregated.first()._owner ).toBe( a.aggregated );
        } );

        it( 'is owned by parent', function(){
            var a = new A();
            expect( a.subset._owner ).toBe( a );
        });

        it( 'behaves as shared type', function(){
            var a = new A();

            var { subset } = a;
            a.subset = a.aggregated;

            expect( subset._owner ).toBeUndefined();

            a.subset = new M.Collection();

            expect( a.subset._owner ).toBeUndefined();

            a.subset = null;
            a.subset = [];

            expect( a.subset._owner ).toBe( a );
        });

        it( "doesn't merge records on set", function(){
            var a = new A();

            a.subset.set([ { id : 1, name : '1'}, { id : 2, name : '2'} ]);
            var f = a.subset.get( 1 );
            a.subset.set([ { id : 1, name : '3'}, { id : 2, name : '4'} ]);
            
            expect( a.subset.get( 1 ).name ).toBe( '1' );                        
        });

        it( 'is not serializable', function(){
            var a = new A();
            a.aggregated = [ { name : '1' }];
            expect( a.toJSON() ).toEqual({ aggregated : [ { name : '1' }] });
        });
    });

    describe( 'Attribute .has options', function(){
        it( 'Pass through an attribute descriptor', function(){
            var T = Number.has,
                T2 = T.has;

            expect( T ).toBe( T2 );
        } );

        describe( '.has.changeEvents( false )', function(){
            var M = Model.extend({
                attributes : {
                    a : Model.defaults({
                        x : 1
                    }).has.changeEvents( false ),

                    b : shared( Model ).changeEvents( false )
                },

                initialize(){
                    this.b = this.a;
                }
            });

            it( 'disables change events for an attribute', function(){
                var m = new M();
                var token = m._changeToken;
                m.a.x = 2;
                expect( token ).toBe( m._changeToken ); 
            } );

            it( 'disables change events in case of nested transaction', function(){
                var m = new M();
                var token = m._changeToken;
                m.set({ a : { x : 2 } });
                expect( token ).toBe( m._changeToken ); 
            } );
        });
    });

    it( 'can filter aggregated collection', function(){
        const c = new M.Collection( { name : 'a' }, { name : 'b' } );
        c.set( c.last() );
        expect( c.first()._owner ).toBe( c );
    });

    it( 'model.clone() should clean up an owner', function(){
        const c = new M.Collection( { name : 'a' }, { name : 'b' } );
        
        expect( c.first()._owner ).toBe( c );
        expect( c.first().clone()._owner ).toBe( void 0 );
    });

    describe( 'Different bugs', function(){
        const M = Model.extend({
            attributes : {
                name : ''
            },

            collection : {
                comparator : 'name'
            }
        });

        it( 'Collection sorts on set when nothing changed', function(){
            const c = new M.Collection();

            c.set( [ { id : 1, name : 'b' }, { id : 2, name : 'a' } ] );
            expect( c.first().name ).toBe( 'a' );

            c.set( [ { id : 1, name : 'b' }, { id : 2, name : 'a' } ] );
            expect( c.first().name ).toBe( 'a' );
        });
    });
});
