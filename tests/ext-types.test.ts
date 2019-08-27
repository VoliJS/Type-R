import "reflect-metadata"
import "isomorphic-fetch"
import {Record} from '@type-r/models'
import {Timestamp, MicrosoftDate, Integer, Url, IPAddress, Email} from "@type-r/ext-types";

describe( 'Extended Type specs', function () {

    describe( 'Date type', function () {
        var user, User = Record.extend( {
            attributes: {
                timestamp: Timestamp,
                microsoft: MicrosoftDate,
                name     : String
            }
        } );

        beforeEach( function () {
            user = new User();
        } );

        it( 'create new Date object on construction', function () {
            expect( user.microsoft ).toBeInstanceOf( Date );
            expect( user.timestamp ).toBeInstanceOf( Date );
        } );

        it( 'parse ISO dates in all browsers on assignment', function () {
            // parse Date from string

            user.timestamp = "2012-12-12T10:00Z";
            expect( user.timestamp ).toBeInstanceOf( Date );
            expect( user.timestamp.toISOString() ).toBe( '2012-12-12T10:00:00.000Z' );

            user.microsoft = "2012-12-12T10:00Z";
            expect( user.microsoft ).toBeInstanceOf( Date );
            expect( user.microsoft.toISOString() ).toBe( '2012-12-12T10:00:00.000Z' );
        } );

        it( 'parse integer time stamps on assignment', function () {
            // parse Date from timestamp
            user.timestamp = 1234567890123;
            expect( user.timestamp ).toBeInstanceOf( Date );
            expect( user.timestamp.toISOString() ).toBe( '2009-02-13T23:31:30.123Z' );

            user.microsoft = 1234567890123;
            expect( user.microsoft ).toBeInstanceOf( Date );
            expect( user.microsoft.toISOString() ).toBe( '2009-02-13T23:31:30.123Z' );
        } );

        it( 'parse MS time stamps on assignment', function () {
            user.microsoft = "/Date(1234567890123)/";
            expect( user.microsoft ).toBeInstanceOf( Date );
            expect( user.microsoft.toISOString() ).toBe( '2009-02-13T23:31:30.123Z' );
        } );

        it( 'is serialized to ISO date', function () {
            const user = new User({ timestamp : 1234567890123, microsoft : '/Date(1234567890123)/' }, { parse : true });
            var json = user.toJSON();
            expect( json.timestamp ).toBe( 1234567890123 );
            expect( json.microsoft ).toBe( '/Date(1234567890123)/' );
        } );
    } );

    describe( "Url", function () {
        var user, User = Record.extend( {
            attributes: {
                url: Url
            }
        } )
        
        beforeEach( function () {
            user = new User();
        } );

        it( 'create new URL string on construction', function () {
            expect( user.url ).toBe( '' );
        } );
        it( 'checks for invalid urls', function () {
            user.url = 'asd123'
            expect( user.isValid() ).toBe( false );
            expect( user.getValidationError( 'url' ) ).toBe( 'Not valid URL' )

            user.url = 'http://test.com?x=y'
            expect( user.isValid() ).toBe( true );
        } )
    } )
    describe( "Email", function () {
        var user, User = Record.extend( {
            attributes: {
                email: Email
            }
        } )
        
        beforeEach( function () {
            user = new User();
        } );

        it( 'create new email string on construction', function () {
            expect( user.email ).toBe( '' );
        } );
        it( 'checks for invalid emails', function () {
            user.email = 'asd123'
            expect( user.isValid() ).toBe( false );
            expect( user.getValidationError( 'email' ) ).toBe( 'Not valid email' )

            user.email = 'my@mail.com'
            expect( user.isValid() ).toBe( true );
        } )
    } )

    describe( "IP Address", function () {
        var user, User = Record.extend( {
            attributes: {
                ip: IPAddress
            }
        } )
        
        beforeEach( function () {
            user = new User();
        } );

        it( 'create new ip string on construction', function () {
            expect( user.ip ).toBe( '' );
        } );
        it( 'checks for invalid ip', function () {
            user.ip = 'asd123'
            expect( user.isValid() ).toBe( false );
            expect( user.getValidationError( 'ip' ) ).toBe( 'Not valid IP address' )

            user.ip = '222.111.123.001'
            expect( user.isValid() ).toBe( true );
        } )
    } )

    describe( "Integer", function () {
        var user, User = Record.extend( {
            attributes: {
                int: Integer
            }
        } )
        
        beforeEach( function () {
            user = new User();
        } );

        it( 'create new int string on construction', function () {
            expect( user.int ).toBe( 0 );
        } );
        it( 'rounding and conversion', function () {
            user.int = 3.2
            expect( typeof user.int ).toBe( 'number' );
            expect( user.int ).toBe( 3 );

            user.int = "25.7";
            expect( typeof user.int ).toBe( 'number' );
            expect( user.int ).toBe( 26 );
        } )

        it( 'can be set with null', function(){
            user.int = null;
            expect( user.int ).toBe( null );
            expect( user.isValid() ).toBe( true );
        });
    } )

} );