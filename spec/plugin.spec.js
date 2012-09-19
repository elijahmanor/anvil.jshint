var expect = require( "expect.js" ),
	_ = require( "underscore" ),
	api = require( "anvil.js" );

describe( "When linting a good JavaScript file", function() {

	before( function( done ) {
		harness = new api.PluginHarness( "anvil.jshint", "./" );

		harness.addFile( "./src/test.js",
'var food = "pizza";\n' +
'if ( food === "pizza" ) {\n' +
'  window.alert( "yeah!" );\n' +
'}' );

		harness.buildOnly( done );
	});

	it( "should log a success message to the eventLog", function() {
		var log = api.log.eventLog;

		expect( log ).to.be.an( "array" );
		expect( log ).to.have.length( 1 );
		expect( log[0] ).to.be( "No issues Found." );
	});

});

describe( "When linting a bad JavaScript file", function() {

	before( function( done ) {
		harness = new api.PluginHarness( "anvil.jshint", "./" );

		harness.addFile( "./src/test.js",
'food = "pizza";\n' +
'if ( food == "pizza" )\n' +
'  window.alert( "yeah!" );\n' );

		harness.buildOnly( done );
	});

	it( "should log errors to the errorLog", function() {
		var log = api.log.errorLog;

		expect( log ).to.be.an( "array" );
		expect( log ).to.have.length( 4 );
		expect( log[0] ).to.be( "[2:1] if ( food == \"pizza\" ) -> Expected '===' and instead saw '=='" );
	});

});