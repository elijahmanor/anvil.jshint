var expect = require( "expect.js" ),
	_ = require( "underscore" ),
	api = require( "anvil.js" ),
	sinon = require( "sinon" );

describe( "When linting a good JavaScript file", function() {
	var messages = [], harness;

	before( function( done ) {
		harness = new api.PluginHarness( "anvil.jshint", "./" );
		console.log( harness.plugin );
		stub = sinon.stub( harness.plugin, "log", function( message ) {
			messages.push( message );
		});
		harness.addFile( "./src/test.js",
			'var food = "pizza";\n' +
			'if ( food === "pizza" ) {\n' +
			'  window.alert( "yeah!" );\n' +
			'}' );

		harness.addCommandArgs( "--jshint" );
		harness.buildOnly( function() {
			done();
		});
	});

	it( "should log a success message to the eventLog", function() {
		expect( messages ).to.have.length( 1 );
		expect( messages[ 0 ] ).to.be( "No issues Found." );
	});
});