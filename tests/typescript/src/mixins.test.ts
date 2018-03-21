import { Mixable, define, predefine, mixins, mixinRules, definitions, MixinMergeRules } from 'type-r';
import { expect } from 'chai'

const M = {
    num : 1,
    nul : null,
    undef : void 0,
    obj : { hi : 'there' },
    fun(){},
    arr : [],
    fwd( arr ){ arr.push( "M" ) },
    bck( arr ){ arr.push( "M" ) }    
}

class C {
    static a = 1;
    b(){}
    fwd( arr ){ arr.push( "C" )}
    bck( arr ){ arr.push( "C" )}
}

describe( "Forward declarations", () =>{
    it( '@predefine calls onExtend hook', () => {
        let called = 0;

        @predefine class X {
            static onExtend( BaseClass ){
                expect( BaseClass ).to.eql( Object );
                called++;
            }
        }

        expect( called ).to.eql( 1 );
    } );
});

describe( "@define decorator", () =>{
    it( '@define makes plain class mixable', () =>{
        @define class X {}

        expect( (X as any).define ).to.exist;
    });

    it( '@define calls onDefine hook', () =>{
        let called = 0;

        @define({ a : 1 }) class X {
            static onDefine( spec, BaseClass ){
                called++;
                expect( spec ).to.eql( {} );
                expect( BaseClass ).to.eql( Object );
            }
        }

        expect( (X as any).define ).to.exist;
        expect( called ).to.eql( 1 );
    });

    it( '@define does nothing when extend mixable', () =>{
        @define class X extends Mixable {}

        expect( X.__super__ ).to.eql( Mixable.prototype );
    });

    it( '@define( props ) assign members to class proto', () =>{
        @define({
            a : 1,
            b : 2
        })
        class X {
            a(){}
        }

        expect( (X as any).prototype.b ).to.eql( 2 );
        expect( (X as any).prototype.a ).to.eql( 1 );
    });

    it( 'Mixable.extend creates the subclass', () =>{
        const X = Mixable.extend({ a : 5 });
        
        const x = new X();

        expect( x.a ).to.eql( 5 );
        expect( x ).to.be.instanceof( Mixable );
    });

    it( 'allows toString() and valueOf() override', () =>{
        @define class Base extends Mixable {
            toString(){ return "base"; }
            valueOf(){ return 'base'; }
        }

        @define class Sub extends Base {
            toString(){ return "sub"; }
            valueOf(){ return 'sub'; }
        }

        const base = new Base(),
            sub = new Sub();

        expect( base.toString() ).to.eql( 'base' );
        expect( base.valueOf() ).to.eql( 'base' );
        expect( sub.toString() ).to.eql( 'sub' );
        expect( sub.valueOf() ).to.eql( 'sub' );
    } );

    it( 'allows toString() and valueOf() override with .extend()', () =>{
        const Base = Mixable.extend({
            toString(){ return "base"; },
            valueOf(){ return 'base'; }
        });

        const Sub = Base.extend({
            toString(){ return "sub"; },
            valueOf(){ return 'sub'; }
        })

        const base = new Base(),
            sub = new Sub();

        expect( base.toString() ).to.eql( 'base' );
        expect( base.valueOf() ).to.eql( 'base' );
        expect( sub.toString() ).to.eql( 'sub' );
        expect( sub.valueOf() ).to.eql( 'sub' );
    } );

    it( "gives priority to the class definition", () =>{
        @define({
            undef : 1
        })
        @mixins( M )
        class X extends Mixable {
            nul(){}
        }

        expect( X.prototype.nul ).to.be.instanceof( Function );
        expect( ( X.prototype as any ).undef ).to.be.eql( 1 );
    });
});

describe( '@mixins', () =>{
    it( "merges in the plain objects", () =>{
        @define 
        @mixins( M )
        class X extends Mixable {
        }

        expect( X.prototype ).to.contain( M );
    });

    it( "don't merge same mixin twice", () =>{
        @define 
        @mixins( M, M )
        class X extends Mixable {
        }

        expect( X.mixins.appliedMixins.length ).to.equal( 1 );

        @define @mixins( M ) class Y extends X {

        }

        expect( Y.mixins.appliedMixins.length ).to.equal( 1 );
    });

    it( "mix in classes", () =>{
        @define @mixins( C ) class X {}
        const x = new X();

        expect( ( X as any ).a ).to.eql( 1 );
        expect( ( x as any ).b ).to.be.instanceof( Function );
    } );

    it( "mix in sequence", () =>{
        const A = { a : 1, b : 1 },
             B = { a : 2 };

        @define @mixins( B, A )
        class X {}

        const x : any = new X();

        expect( x.a ).to.eql( 2 );
        expect( x.b ).to.eql( 1 );
    });

    it( 'merge methods from mixin if they are not locally defined', () => {
        @define class Base {
            first(){}
        }

        const Mix = {
            first(){},
            second(){}
        }

        @define @mixins( Mix ) class Y extends Base {
            second(){}
        }

        expect( Y.prototype.second ).to.not.eql( Mix.second );
        expect( Y.prototype.first ).to.eql( Mix.first );

    });
} );

describe( 'mixin rules', () => {
    @define
    @mixins( M, C )
    @mixinRules({
        fwd : mixinRules.classFirst,
        bck : mixinRules.classLast
    })
    class X {
    }

    it( 'chains functions when merge rules are defined', () => {
        const x = new X();
        const fwda = [], bcka = [];
        ( x as any).fwd( fwda );
        (expect( fwda ).to.have as any).ordered.members([ "M", "C" ]);
        
        ( x as any ).bck( bcka );
        (expect( bcka ).to.have as any).ordered.members([ "C", "M" ]);
    });

    it( 'chains function on inheritance', () =>{
        @define
        @mixins({
            fwd( arr ){ arr.push( 'Z' ); },
            bck( arr ){ arr.push( 'Z' ); }
        })
        class Y extends X {
            fwd( arr ){ arr.push( 'Y' ); }
            bck( arr ){ arr.push( 'Y' ); }
        }

        const y = new Y();

        const fwda = [], bcka = [];
        ( y as any).fwd( fwda );
        (expect( fwda ).to.have as any).ordered.members([ "Y", "Z", "M", "C" ]);
        
        ( y as any ).bck( bcka );
        (expect( bcka ).to.have as any).ordered.members([ "C", "M", "Z", "Y" ]);
    } );
});

describe( '@definitions', ()=>{
    it( 'extract definitions from statics', ()=>{
        @define
        @definitions({
            a : mixinRules.value,
            b : mixinRules.merge
        })
        class Y {
            static a = 'a';
            static b = { a : 1 };
            zzz : any;

            static onDefine( spec ){
                expect( spec ).to.deep.equal({ a : 'a', b : { a : 1 }});
                this.prototype.zzz = 'Hurrah!';
            }
        }
    });

    it( 'extract definitions from @define parameter', () => {
        @define({
            a : 'a',
            b : { a : 1 }
        })
        @definitions({
            a : mixinRules.value,
            b : mixinRules.merge
        })
        class Y {
            zzz : any;

            static onDefine( spec ){
                expect( spec ).to.deep.equal({ a : 'a', b : { a : 1 }});
                this.prototype.zzz = 'Hurrah!';
            }
        }
    });

    it( 'extract definitions from mixins', () => {
        @define({
            a : 'a',
            b : { a : 1 }
        })
        @mixins({
            a : 'no',
            b : { b : 1, a : 2 }
        })
        @definitions({
            a : mixinRules.value,
            b : mixinRules.merge
        })
        class Y {
            zzz : any;
            static b = { c : 1 };

            static onDefine( spec ){
                expect( spec ).to.deep.equal({ a : 'a', b : { a : 1, b : 1, c : 1 }});
                this.prototype.zzz = 'Hurrah!';
            }
        }
    });
});