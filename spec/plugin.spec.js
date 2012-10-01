var expect = require( "expect.js" ),
	_ = require( "underscore" ),
	api = require( "anvil.js" ),
	sinon = require( "sinon" );

describe( "When linting a good JavaScript file", function() {
	var messages = [], plugin, harness;

	console.log( "api: " + JSON.stringify( api ) );
	before( function( done ) {
		console.log( "1" );
		api.events.on( "plugin.loaded", function( instance ) {
			console.log( "2" );
			harness.addFile( "./src/test.js",
'var food = "pizza";\n' +
'if ( food === "pizza" ) {\n' +
'  window.alert( "yeah!" );\n' +
'}' );
			stub = sinon.stub( instance, "log", function( message ) {
				console.log( "message: " + message );
				messages.push( message );
			});
			console.log( "3" );
			harness.buildOnly( function() {
				console.log( "4" );
				// stub.restore();
				done();
			});
		});

		harness = new api.PluginHarness( "anvil.jshint", "./" );
	});

	it( "should log a success message to the eventLog", function() {
		expect( messages ).to.have.length( 1 );
		expect( messages[ 0 ] ).to.be( "No issues Found." );
	});
});

/*
describe( "When linting a bad JavaScript file", function() {

	before( function( done ) {
		var harness = new api.PluginHarness( "anvil.jshint", "./" ), stub;

		harness.addFile( "./src/test.js",
'food = "pizza";\n' +
'if ( food == "pizza" )\n' +
'  window.alert( "yeah!" );\n' );

		stub = sinon.stub( api.log, "error", function( message ) {
			messages.push( message );
		});
		harness.buildOnly( function() {
			stub.restore();
			done();
		});
	});

	it( "should log messages to the errorLog", function() {
		expect( messages ).to.have.length( 4 );
		// expect( messages[ 0 ] ).to.be( "[2:1] if ( food == \"pizza\" ) -> Expected '===' and instead saw '=='" );
	});

});
*/
