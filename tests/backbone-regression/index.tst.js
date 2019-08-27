Backbone = require( '@type-r/models' );
_ = require( 'underscore' );

deepEqual = QUnit.assert.deepEqual.bind( QUnit.assert );
ok = QUnit.assert.ok.bind( QUnit.assert );
equal = QUnit.assert.equal.bind( QUnit.assert );

require( './vendor/json2' );

require( './events' );
require( './model' );
require( './collection' );
