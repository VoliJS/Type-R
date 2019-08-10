import "isomorphic-fetch";
import nock from 'nock';
import "reflect-metadata";
import { auto, Collection, define, Record, Store, type, CollectionConstructor } from 'type-r';
import { attributesIO } from '../endpoints/attributes';
import { localStorageIO } from '../endpoints/localStorage';
import { memoryIO } from '../endpoints/memory';
import { RestfulEndpoint, restfulIO } from '../endpoints/restful';
import "type-r/globals";

describe( 'IO', function(){
    describe( 'memory endpoint', () => {
        const testData = [
            { name : "John" }
        ];
    
        @define class User extends Record {
            static Collection : CollectionConstructor<User>
            static endpoint = memoryIO( testData );

            parse( data, options ){
                expect( options.ioMethod ).toBeTruthy();
                return data;
            }

            toJSON( options? ){
                expect( options.ioMethod ).toBeTruthy();
                return super.toJSON( options );
            }
    
            @auto name : string
        }
    
        it( 'loads the test data', done => {
            const users = new User.Collection();
            users.fetch()
                .then( () => {
                    expect( users.length ).toBe( 1 );
                    expect( users.first().name ).toBe( 'John' );
                    done();
                });
        });
        
        it( 'create', done =>{
            const x = new User({ name : "test" });

            x.save().then( () => {
                expect( x.id ).toBe( "1" );
                done();
            });
        });
    
        it( 'read', done => {
            const x = ( new User({ id : "1" }) ).fetch().then( x => {
                expect( x.name ).toBe( "test" );
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
                    expect( y.name ).toBe( 'Mike' );
                    done();
                });
        });
    
        it( 'list', done => {
            const users = new User.Collection();
            users.fetch()
                .then( () =>{
                    expect( users.length ).toBe( 2 );
                    expect( ( users.first() ).name ).toBe( "John" );
                    expect( ( users.last() ).name ).toBe( "Mike" );
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
                    expect( users.length ).toBe( 1 );
                    expect( users.first().name ).toBe( "John" );
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

            @type( NoEndpoint.Collection )
            .endpoint( memoryIO([{ id : "777" }]) )
            .as a : Collection<NoEndpoint>;

            @type( HasEndpoint.Collection )
            .as b : Collection<HasEndpoint>;
            
            @type( HasEndpoint.Collection )
            .endpoint( memoryIO([{ id : "555" }]) )
            .as c : Collection<HasEndpoint>;
        }

        const s = new TestStore();
        s.fetch().then( () => {
            expect( s.a.first().id ).toBe( "777" );
            expect( s.b.first().id ).toBe( 666 );
            expect( s.c.first().id ).toBe( "555" );

            done();
        });
    });

    describe( 'restful endpoint in mock mode', ()=>{
        testEndpoint( restfulIO( 'http://restful.basic/users', {
            mockData : []
        }) )()
    });

    describe( "restful endpoint", () => {

        describe( 'Base test', () => {
            let usersStorage = {
                models : [],
                counter: 0
            }

            const USER_REGEX = /\/users\/(\w+)/;

            function getUserId( uri : string ) {
                return uri.match( USER_REGEX )[ 1 ]
            }

            function getUser( id ) {
                return usersStorage.models.filter( u => u.id == id )[ 0 ]
            }

            function cloneUser( { id, name } ) {
                return { id, name }
            }

            nock.cleanAll()
            nock( 'http://restful.basic' )
                .persist()
                .get( '/users' )
                .reply( 200, function () {
                    return usersStorage.models.map( cloneUser );
                } )

                .get( USER_REGEX )
                .reply( function ( uri ) {
                    const user = getUser( getUserId( uri ) );
                    if( user ) {
                        return [ 200, cloneUser( user ) ]
                    }
                    else {
                        console.warn( "GET: NOT FOUND", uri )
                        return [ 404 ]
                    }
                } )

                .post( '/users' )
                .reply( 200, function ( uri, requestBody ) {
                    let id   = ++usersStorage.counter,
                        user = {
                            id: String( id ),
                            ...requestBody
                        };
                    usersStorage.models.push( user );
                    return cloneUser( user );
                } )

                .put( USER_REGEX )
                .reply( function ( uri, requestBody ) {
                    const user = getUser( getUserId( uri ) );

                    if( user ) {
                        user.name = requestBody.name
                        return [ 200, cloneUser( user ) ]
                    }
                    else {
                        console.warn( "PUT: NOT FOUND", uri )
                        return [ 404 ]
                    }
                } )

                .delete( USER_REGEX )
                .reply( function ( uri ) {
                    const user = getUser( getUserId( uri ) )
                    if( user ) {
                        const idx = usersStorage.models.indexOf( user )
                        usersStorage.models.splice( idx, 1 );
                        return [ 200 ]
                    }
                    else {
                        console.warn( "DELETE: NOT FOUND", uri )
                        return [ 404 ]
                    }
                } )

            testEndpoint( restfulIO( 'http://restful.basic/users') )()
        } )

        describe( 'Relative urls', () => {
            @define
            class User extends Record {
                static Collection : CollectionConstructor<User>
                static endpoint = restfulIO( './users' );
                @auto name : string
            }

            @define
            class Store extends Record {
                static endpoint = restfulIO( './store' );
                @auto name : string
                @auto user : User
            }

            @define
            class Root extends Record {
                static endpoint = restfulIO( 'http://restful.relative/' );
                
                @type( User.Collection )
                .as users : Collection<User>

                @auto store : Store
            }

            const root = new Root();
            root.store.id = "99";
            root.store.user.id = "1000";

            nock( 'http://restful.relative' )
                .get( '/users' )
                .reply( 200, [ {id: 10, name: 'John'}, {id: 11, name: 'Jack'} ] )
                .get( '/store/99' )
                .reply( 200, {id: 99, name: 'something'} )
                .get( '/store/99/users/1000' )
                .reply( 200, {id: 1000, name: 'special'} )

            it( 'resolves in simple case', done => {
                root.store.fetch().then( () => {
                    expect( root.store.name ).toBe( 'something' )
                    done()
                } )
            } )

            it( 'resolves for collection', done => {
                root.users.fetch().then( () => {
                    expect( root.users.map( u => u.id ) ).toEqual( [ 10, 11 ] )
                    done()
                } )
            } )

            it( 'nested resolve', done => {
                const {user} = root.store;
                user.fetch().then( () => {
                    expect( user.name ).toBe( 'special' )
                    done()
                } )
            } )
        } )

        describe( "Merging options", () => {
            RestfulEndpoint.defaultFetchOptions = {
                cache: "force-cache",
                credentials: "omit",
                mode: "navigate",
                redirect: "manual",
            }
            it("uses default options", () => {
                let io = restfulIO(""),
                    options : RequestInit = (io as any).buildRequestOptions("get")
                expect(options.cache).toBe("force-cache")
                expect(options.credentials).toBe("omit")
                expect(options.mode).toBe("navigate")
                expect(options.redirect).toBe("manual")
            })

            it("Overrides at ctor", () => {
                let io = restfulIO("", {credentials: "include", cache:"reload"}),
                    options : RequestInit = (io as any).buildRequestOptions("get", )
                expect(options.cache).toBe("reload")
                expect(options.credentials).toBe("include")
            })
            it("Overrides at call", () => {
                let io = restfulIO("", {credentials: "include", cache:"reload"}),
                    options : RequestInit = (io as any).buildRequestOptions("get", {cache: "no-store", credentials: "same-origin"} )
                expect(options.cache).toBe("no-store")
                expect(options.credentials).toBe("same-origin")
            })
        })
    } );

    if( typeof localStorage !== 'undefined') describe( 'localStorage endpoint', testEndpoint( localStorageIO( "/test" ) ));
});

function testEndpoint( endpoint ){
    return () =>{

        @define class User extends Record {
            static Collection : CollectionConstructor<User>
            static endpoint = endpoint;
    
            @auto name : string
        }

        let generatedId;
        
        it( 'create', done =>{
            const x = new User({ name : "test" });
            x.save().then( () => {
                generatedId = x.id;
                expect( x.id ).toBeDefined();
                done();
            });
        });
    
        it( 'read', done => {
            const x = new User({ id : generatedId });
            x.fetch().then( () => {
                expect( x.name ).toBe( "test" );
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
                    expect( y.name ).toBe( 'Mike' );
                    done();
                });
        });
    
        it( 'list', done => {
            const users = new User.Collection();
            users.fetch()
                .then( () =>{
                    expect( users.length ).toBe( 1 );
                    expect( users.last().name ).toBe( "Mike" );
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
                    expect( users.length ).toBe( 0 );
                    done();
                });
        });
    }
}