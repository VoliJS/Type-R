import "reflect-metadata";
import { logger, Collection, auto, define, mixins, Record, type, value, Model } from 'type-r';
import { MinutesInterval } from './common';
import { AttributesMixin } from '../lib';

logger.off();

describe( 'Bugs from Volicon Observer', () =>{
    describe( 'Attribute serialization', () => {
        it( 'should call has.parse() when null attribute value is passed', ()=>{
            @define class Test extends Record {
                @type( String )
                    .parse( x => 'bla-bla' )
                    .as a : string
            }
    
            const t = new Test({ a : null }, { parse : true });
            expect( t.a ).toBe( 'bla-bla' );
        });    
    });

    describe( 'Attribute definitions', () => {
        it( '@value( value ) must work as expected', () => {
            @define class Test extends Record {
                @value( 5 ).as num : number;
                @value( "5" ).as str : string;
            }

            const t = new Test();
            expect( t.num ).toBe( 5 );
            expect( t.str ).toBe( "5" );

            t.str = 6 as any;
            expect( t.str ).toBe( "6" );
        } );
    } );

    describe( 'Attribute change watcher', () =>{
        it( 'works in base class and subclass', () => {
            let calls = [];

            @define class Base extends Record {
                @type( String ).watcher( x => calls.push( 'inherited' ) ).as
                inherited : string;

                @type( String ).watcher( 'onNamedWatcher' ).as namedWatcher : string;

                @type( String ).watcher( x => calls.push( 'base' ) ).as overriden : string;
            }

            @define class Subclass extends Base {
                @type( String ).watcher( x => calls.push( 'added' ) ).as
                added : string;

                @type( String ).watcher( x => calls.push( 'subclass') ).as
                overriden : string;

                onNamedWatcher(){
                    calls.push( 'named' );
                }
            }

            const subclass = new Subclass();
            subclass.inherited = "a";
            subclass.added = "b";
            subclass.overriden = "b";
            subclass.namedWatcher = "t";

            expect( calls ).toEqual( [ 'inherited', 'added', 'subclass', 'base', 'named' ] );
        } );

    } );

    describe( 'Collection bugs', () =>{
        it( 'can define collection with comparator', () => {
            const x = 1;

            @define class TestCollection extends Collection<M> {
                static comparator = x => x.mtime
            }
            
            @define class M extends Record {
                static Collection = TestCollection;

                static attributes = {
                    mtime: Date
                }
            }
        });
    });

    describe( 'Validation', () => {
        it( 'performs validation if collection item is changed', ()=>{
            var BitrateModel = Record.extend({
                defaults: {
                    bitrate: type( Number ).value(512)
                },
            
                properties: {
                    bitrates: function () {
                        const available_bitrate = [128, 256, 384, 450, 512, 768, 896, 1000, 1500, 2000, 2500, 3000, 4500, 6000, 6500, 9000, 12000, 15000];
            
                        if (available_bitrate.indexOf(this.bitrate) === -1) {
                            available_bitrate.push(this.bitrate);
                        }
                        return available_bitrate.sort(function (a, b) {
                            return a - b
                        });
                    }
                },
            
            
                initialize: function (options) {
                    Record.prototype.initialize.apply(this, arguments);
            
                    /*
                     this.listenTo( this, 'change:bitrate', function( model, value ){
                     value = Number( value );
                     console.log( 'change bitrate', value );
                     });
                     */
                },
            
                parse( data ){
                    return { bitrate: data / 1000 };
                },
            
                toJSON: function () {
                    var json = Record.prototype.toJSON.apply(this, arguments),
                        bitrate = json.bitrate * 1000;
                    /* convert to bps from kbps*/
            
                    return bitrate;
                }
            });

            const SubEncoder : any = Record.extend({
                defaults :{
                    Bitrate: BitrateModel,
                    HistoryDepth: type( MinutesInterval ).value( 43800 ),
                    BitrateAsString: null,
                    ResolutionHeight: Number,
                    ResolutionWidth: Number,
                    resolution: type( String ).toJSON( false )
                },
    
               collection : {
                    get : function( a ){
                        return Collection.prototype.get.apply( this, arguments ) || this.models[ a ];
                    },
    
                   comparator: function( model1, model2 ){
                        if( model1.Bitrate.bitrate > model2.Bitrate.bitrate ){
                            return 1;
                        }else if( model1.Bitrate.bitrate < model2.Bitrate.bitrate ){
                            return -1;
                        }else{
                            if( model1.ResolutionWidth > model2.ResolutionWidth ){
                                return 1;
                            }else if( model1.ResolutionWidth < model2.ResolutionWidth ){
                                return -1;
                            }else{
                                if( model1.ResolutionHeight > model2.ResolutionHeight ){
                                    return 1;
                                }else if( model1.ResolutionHeight < model2.ResolutionHeight ){
                                    return -1;
                                }else{
                                    return 0;
                                }
                            }
                        }
                    },
                    
                   localEvents : {
                        change(){
                            this.sort();
                        }
                    }
                }
            });
            
            const Placeholder = Record.extend({
                attributes : {
                    subEncoders : type( SubEncoder.Collection ).check( x => x.length > 0, 'ccccc' )
                }
            });

            const p = new Placeholder(),
                { subEncoders } = p;

            expect( p.isValid() ).toBe( false );
            expect( subEncoders.isValid() ).toBe( true );
            subEncoders.add( {} );

            expect( p._validationError ).not.toBeDefined();
            expect( p.isValid() ).toBe( true );

            subEncoders.first().HistoryDepth.value = 2;

            expect( p._validationError ).not.toBeDefined();
            expect( p.isValid() ).toBe( true );
            expect( subEncoders.isValid() ).toBe( true );
            expect( p._validationError ).toBeDefined();
        } );
    });

    describe( 'assignFrom', ()=>{
        it( 'copy the value if the target is null', () =>{
            @define class Inner extends Record {
                @auto name : string
            }
    
            @define class Test extends Record {
                @auto( null ) inner : Inner;
            }
    
            const target = new Test(),
                source = new Test({ inner : { name : "ron" } } );
    
            expect( target.inner ).toBe( null );
    
            target.assignFrom( source );
    
            expect( target.inner !== source.inner ).toBe( true );
        });

        it( 'assign object of similar shape', () =>{
            @define class A extends Record {
                @auto a : string
            }

            @define class B extends A {
                @auto b : string
            }

            const b = new B({ b : "b" }), a = new A({ a : "a" });
            b.assignFrom( a );
        });
    });

    describe( 'Mixins', () => {
        it( 'can work with overriden atribute', ()=>{
            @define class Source extends Record {
                @auto name : string

                get hi(){
                    return 'hi';
                }
            }

            @define
            @mixins( Source )
            class Target extends Record {
                @auto name : number
                hi : string
            }

            const t = new Target();
            t.name = "1" as any;

            expect( t.name ).toBe( 1 );
            expect( t.hi ).toBe( 'hi' );
        });
    });

    describe( 'TS typing problems', () => {
        it('define collections manually', () => {
            @define class MyCollection extends Collection<MyModel> {
                hi(){ return this.first().there }
            }

            interface MyModel extends AttributesMixin<typeof MyModel> {}
            @define class MyModel extends Model {
                static Collection = MyCollection
                static attributes = {
                    there : ''
                }
            }
            
            let x : MyModel;
            const c1  = new MyModel.Collection();
            x = c1.first();

            const c2 = Collection.of( MyModel ).create();
            x = c2.first();
        });

        it('short syntax for model definitions', () => {

            const A = Model.extendAttrs({
                hi : ''
            });
            
            const x = new A.Collection();

            const B = A.extendAttrs({
                there : 4
            });

            const y = new B.Collection();

            let z : InstanceType<typeof B> = y.first();
        })
    });
} );