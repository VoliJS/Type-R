import { define, definitions, Mixable, mixinRules, mixins, predefine } from '@type-r/models';

import { superMixins } from 'mixin-flavors/lib/mixture'
import { mixin } from 'mixin-flavors'

@mixin class F {
    constructor(){
        superMixins( this );
    }
}

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
                expect( BaseClass ).toBe( Object );
                called++;
            }
        }

        expect( called ).toBe( 1 );
    } );
});

describe( "@define decorator", () =>{
    it( '@define makes plain class mixable', () =>{
        @define class X {}

        expect( (X as any).define ).toBeDefined();

        const x = new X();
    });

    it( '@define calls onDefine hook', () =>{
        let called = 0;

        @define({ a : 1 }) class X {
            static onDefine( spec, BaseClass ){
                called++;
                expect( spec ).toEqual( {} );
                expect( BaseClass ).toBe( Object );
            }
        }

        expect( (X as any).define ).toBeDefined();
        expect( called ).toBe( 1 );
    });

    it( '@define does nothing when extend mixable', () =>{
        @define class X extends Mixable {}

        expect( X.__super__ ).toBe( Mixable.prototype );
    });

    it( '@define( props ) assign members to class proto', () =>{
        @define({
            a : 1,
            b : 2
        })
        class X {
            a(){}
        }

        expect( (X as any).prototype.b ).toBe( 2 );
        expect( (X as any).prototype.a ).toBe( 1 );
    });

    it( 'Mixable.extend creates the subclass', () =>{
        const X = Mixable.extend({ a : 5 });
        
        const x = new X();

        expect( x.a ).toBe( 5 );
        expect( x ).toBeInstanceOf( Mixable );
    });
/* FIXME!
    it( 'can mix class and Mixable.extend', () =>{
        @define class Base extends Mixable {}

        const X = Base.extend({ a : 5 });
        
        const x = new X();

        expect( x.a ).toBe( 5 );
        expect( x ).toBeInstanceOf( Mixable );
    });*/

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

        expect( base.toString() ).toBe( 'base' );
        expect( base.valueOf() ).toBe( 'base' );
        expect( sub.toString() ).toBe( 'sub' );
        expect( sub.valueOf() ).toBe( 'sub' );
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

        expect( base.toString() ).toBe( 'base' );
        expect( base.valueOf() ).toBe( 'base' );
        expect( sub.toString() ).toBe( 'sub' );
        expect( sub.valueOf() ).toBe( 'sub' );
    } );

    it( "gives priority to the class definition", () =>{
        @define({
            undef : 1
        })
        @mixins( M )
        class X extends Mixable {
            nul(){}
        }

        expect( X.prototype.nul ).toBeInstanceOf( Function );
        expect( ( X.prototype as any ).undef ).toBe( 1 );
    });
});

describe( '@mixins', () =>{
    it( "merges in the plain objects", () =>{
        @define 
        @mixins( M )
        class X extends Mixable {
        }

        expect( X.prototype ).toMatchObject( M );
    });

    it( "don't merge same mixin twice", () =>{
        @define 
        @mixins( M, M )
        class X extends Mixable {
        }

        expect( X.mixins.appliedMixins.length ).toBe( 1 );

        @define @mixins( M ) class Y extends X {

        }

        expect( Y.mixins.appliedMixins.length ).toBe( 1 );
    });

    it( "mix in classes", () =>{
        @define @mixins( C ) class X {}
        const x = new X();

        expect( ( X as any ).a ).toBe( 1 );
        expect( ( x as any ).b ).toBeInstanceOf( Function );
    } );

    it( "mix in sequence", () =>{
        const A = { a : 1, b : 1 },
             B = { a : 2 };

        @define @mixins( B, A )
        class X {}

        const x : any = new X();

        expect( x.a ).toBe( 2 );
        expect( x.b ).toBe( 1 );
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

        expect( Y.prototype.second ).not.toBe( Mix.second );
        expect( Y.prototype.first ).toBe( Mix.first );

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
        expect( fwda ).toEqual([ "M", "C" ]);
        
        ( x as any ).bck( bcka );
        expect( bcka ).toEqual([ "C", "M" ]);
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
        expect( fwda ).toEqual([ "Y", "Z", "M", "C" ]);
        
        ( y as any ).bck( bcka );
        expect( bcka ).toEqual([ "C", "M", "Z", "Y" ]);
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
                expect( spec ).toEqual({ a : 'a', b : { a : 1 }});
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
                expect( spec ).toEqual({ a : 'a', b : { a : 1 }});
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
                expect( spec ).toEqual({ a : 'a', b : { a : 1, b : 1, c : 1 }});
                this.prototype.zzz = 'Hurrah!';
            }
        }
    });
});