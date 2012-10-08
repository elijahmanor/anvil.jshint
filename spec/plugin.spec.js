var expect = require( "expect.js" ),
	_ = require( "underscore" ),
	api = require( "anvil.js" ),
	sinon = require( "sinon" );

describe( "When linting a good JavaScript file", function() {
	var messages = [], harness, stub;

	before( function( done ) {
		harness = new api.PluginHarness( "anvil.jshint", "./" );
		stub = sinon.stub( harness.plugin, "log", function( message ) {
			messages.push( message );
		});
		harness.addFile( "./src/test-good.js",
			'var food = "pizza";\n' +
			'if ( food === "pizza" ) {\n' +
			'  window.alert( "yeah!" );\n' +
			'}' );

		harness.addCommandArgs( "--jshint" );
		harness.buildOnly( function() {
			done();
		});
	});

	it( "should log a success message to the log", function() {
		expect( messages ).to.have.length( 1 );
		expect( messages[ 0 ] ).to.be( "No issues Found." );
	});
});

describe( "When linting a bad JavaScript file", function() {
	var messages = [], harness, stub;

	before( function( done ) {
		console.log( "before bad" );
		harness = new api.PluginHarness( "anvil.jshint", "./" );
		stub = sinon.stub( harness.plugin, "log", function( message ) {
			messages.push( message );
		});
		console.log( "adding bad file" );
		harness.addFile( "./src/test-bad.js",
			'var food = "pizza";\n' +
			'if ( food == "pizza" ) {\n' +
			'  window.alert( "yeah!" );\n' +
			'}' );
		console.log( "adding command args" );
		harness.addCommandArgs( "--jshint" );
		console.log( "kicking off build" );
		harness.buildOnly( function() {
			// stub.restore();
			done();
		});
	});

	it( "should log an error message to the log", function() {
		expect( messages ).to.have.length( 1 );
		expect( messages[ 0 ] ).to.be( "DUMMY" ); //TOOD: Replace this with appropriate error
	});
});