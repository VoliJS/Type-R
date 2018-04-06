import "reflect-metadata"
import { predefine, define, attr, mixins, prop, Record, Store, type, Collection } from 'type-r'
import { expect } from 'chai'
import { MinutesInterval } from './common'

describe( 'Bugs from Volicon Observer', () =>{
    describe( 'Attribute definitions', () => {
        it( '@attr( value ) must work as expected', () => {
            @define class Test extends Record {
                @attr( 5 ) num : number;
                @attr( "5" ) str : string;
            }

            const t = new Test();
            expect( t.num ).to.eql( 5 );
            expect( t.str ).to.eql( "5" );

            t.str = 6 as any;
            expect( t.str ).to.eql( "6" );
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
                @attr( String.has.watcher( x => calls.push( 'added' ) ) )
                added : string;

                @attr( String.has.watcher( x => calls.push( 'subclass') ) )
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

            expect( calls ).to.eql( [ 'inherited', 'added', 'subclass', 'base', 'named' ] );
        } );

    } );

    describe( 'Validation', () => {
        it( 'performs validation if collection item is changed', ()=>{
            var BitrateModel = Record.extend({
                defaults: {
                    bitrate: Number.value(512)
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
                    resolution: String.has.toJSON(false)
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
                    subEncoders : SubEncoder.Collection.has.check( function(x){
                        return x.length > 0;
                    },'ccccc')
                }
            });

            const p = new Placeholder(),
                { subEncoders } = p;

            expect( p.isValid() ).to.be.false;
            expect( subEncoders.isValid() ).to.be.true;
            subEncoders.add( {} );

            expect( p._validationError ).to.be.undefined;
            expect( p.isValid() ).to.be.true;

            subEncoders.first().HistoryDepth.value = 2;

            expect( p._validationError ).to.be.undefined;
            expect( p.isValid() ).to.be.true;
            expect( subEncoders.isValid() ).to.be.true;
            expect( p._validationError ).not.to.be.undefined;
        } );
    });

    describe( 'assignFrom', ()=>{
        it( 'copy the value if the target is null', () =>{
            @define class Inner extends Record {
                @attr name : string
            }
    
            @define class Test extends Record {
                @attr( Inner.value( null ) ) inner : Inner;
            }
    
            const target = new Test(),
                source = new Test({ inner : { name : "ron" } } );
    
            expect( target.inner ).to.be.null;
    
            target.assignFrom( source );
    
            expect( target.inner !== source.inner ).to.be.true;
        });

        it( 'assign object of similar shape', () =>{
            @define class A extends Record {
                @attr a : string
            }

            @define class B extends A {
                @attr b : string
            }

            const b = new B({ b : "b" }), a = new A({ a : "a" });
            b.assignFrom( a );
        });
    });

    describe( 'Mixins', () => {
        it( 'can work with overriden atribute', ()=>{
            @define class Source extends Record {
                @attr name : string

                get hi(){
                    return 'hi';
                }
            }

            @define
            @mixins( Source )
            class Target extends Record {
                @attr name : number
                hi : string
            }

            const t = new Target();
            t.name = "1" as any;

            expect( t.name ).to.eql( 1 );
            expect( t.hi ).to.eql( 'hi' );
        });
    });
} );