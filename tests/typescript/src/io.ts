import "reflect-metadata"
import { predefine, define, attr, prop, Record, Store, Collection } from '../../../lib'
import { expect } from 'chai'
import { memoryIO } from '../../../lib/endpoints/memory'
import { attributesIO } from '../../../lib/endpoints/attributes'
import { localStorageIO } from '../../../lib/endpoints/localStorage'

describe( 'IO', function(){
    describe( 'memory endpoint', () => {
        const testData = [
            { name : "John" }
        ];
    
        @define class User extends Record {
            static endpoint = memoryIO( testData );
    
            @attr name : string
        }
    
        it( 'loads the test data', done => {
            const users = new User.Collection();
            users.fetch()
                .then( () => {
                    expect( users.length ).to.eql( 1 );
                    expect( ( users.first() as any ).name ).to.eql( 'John' );
                    done();
                });
        });
        
        it( 'create', done =>{
            const x = new User({ name : "test" });
            x.save().then( () => {
                expect( x.id ).to.eql( "1" );
                done();
            });
        });
    
        it( 'read', done => {
            const x = new User({ id : "1" });
            x.fetch().then( () => {
                expect( x.name ).to.eql( "test" );
                done();
            });
        });
    
        it( 'update', done => {
            const x = new User({ id : "1" });
            x.fetch()
                .then( () => {
                    x.name = "Mike";
                    return x.save();
                })
                .then( () => {
                    const y = new User({ id : "1" });
                    return y.fetch();
                })
                .then( y => {
                    expect( y.name ).to.eql( 'Mike' );
                    done();
                });
        });
    
        it( 'list', done => {
            const users = new User.Collection();
            users.fetch()
                .then( () =>{
                    expect( users.length ).to.eql( 2 );
                    expect( ( users.first() as any ).name ).to.eql( "John" );
                    expect( ( users.last() as any ).name ).to.eql( "Mike" );
                    done();
                });
        });
    
        it( "destroy", done => {
            const x = new User({ id : "1" });
            x.destroy()
                .then( () => {
                    const users = new User.Collection();
                    return users.fetch();
                })
                .then( users => {
                    expect( users.length ).to.eql( 1 );
                    expect( users.first().name ).to.eql( "John" );
                    done();
                });
        });
    });

    it( 'can override endpoint with .has.endpoint', done =>{
        @define class NoEndpoint extends Record {
            static attributes = {
                type : 'no endpoint'
            }
        }

        @define class HasEndpoint extends Record {
            static endpoint = memoryIO([{ id : 666 }]);

            static attributes = {
                type : 'has endpoint'
            }
        }

        @define class TestStore extends Store {
            static endpoint = attributesIO();
            static attributes = {
                a : NoEndpoint.Collection.has.endpoint( memoryIO([{ id : "777" }]) ),
                b : HasEndpoint.Collection,
                c : HasEndpoint.Collection.has.endpoint( memoryIO([{ id : "555" }]) )
            }

            a;
            b;
            c;
        }

        const s = new TestStore();
        s.fetch().then( () => {
            expect( s.a.first().id ).to.eql( "777" );
            expect( s.b.first().id ).to.eql( 666 );
            expect( s.c.first().id ).to.eql( "555" );

            done();
        });
    });

    if( typeof localStorage !== 'undefined') describe( 'localStorage endpoint', testEndpoint( localStorageIO( "/test" ) ));
});

function testEndpoint( endpoint ){
    return () =>{

        @define class User extends Record {
            static endpoint = endpoint;
    
            @attr name : string
        }

        let generatedId;
        
        it( 'create', done =>{
            const x = new User({ name : "test" });
            x.save().then( () => {
                generatedId = x.id;
                expect( x.id ).to.be.not.empty;
                done();
            });
        });
    
        it( 'read', done => {
            const x = new User({ id : generatedId });
            x.fetch().then( () => {
                expect( x.name ).to.eql( "test" );
                done();
            });
        });
    
        it( 'update', done => {
            const x = new User({ id : generatedId });
            x.fetch()
                .then( () => {
                    x.name = "Mike";
                    return x.save();
                })
                .then( () => {
                    const y = new User({ id : generatedId });
                    return y.fetch();
                })
                .then( y => {
                    expect( y.name ).to.eql( 'Mike' );
                    done();
                });
        });
    
        it( 'list', done => {
            const users = new User.Collection();
            users.fetch()
                .then( () =>{
                    expect( users.length ).to.eql( 1 );
                    expect( ( users.last() as any ).name ).to.eql( "Mike" );
                    done();
                });
        });
    
        it( "destroy", done => {
            const x = new User({ id : generatedId });
            x.destroy()
                .then( () => {
                    const users = new User.Collection();
                    return users.fetch();
                })
                .then( users => {
                    expect( users.length ).to.eql( 0 );
                    done();
                });
        });
    }
}