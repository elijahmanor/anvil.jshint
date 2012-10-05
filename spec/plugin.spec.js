var expect = require( "expect.js" ),
	_ = require( "underscore" ),
	api = require( "anvil.js" ),
	sinon = require( "sinon" ),
	postal = require( "postal" ),
	postalWhen = require( "../ext/postal.when.js" );

postalWhen( _, postal );

describe( "When linting a good JavaScript file", function() {
	var messages = [], harness;

	before( function( done ) {
		api.events.on( "plugin.loaded", function( instance ) {
			if ( instance.name === "anvil.jshint" ) {
				postal.publish({ channel: "spec", topic: "plugin.loaded", data: instance });
			}
		});

		postal.when( [
			{ channel: "spec", topic: "plugin.loaded" },
			{ channel: "spec", topic: "harness.created" }
		], function( plugin ) {
			harness.addFile( "./src/test.js",
				'var food == "pizza";\n' +
				'if ( food === "pizza" ) {\n' +
				'  window.alert( "yeah!" );\n' +
				'}' );
			stub = sinon.stub( plugin, "log", function( message ) {
				console.log( "message: " + message );
				messages.push( message );
			});

			harness.addCommandArgs( "--jshint" );
			harness.buildOnly( function() {
				console.log( "harness: " + JSON.stringify( harness.logs.error ) );
				done();
			});
		});

		harness = new api.PluginHarness( "anvil.jshint", "./" );
		postal.publish({
			channel: "spec",
			topic: "harness.created",
			data: harness
		});
	});

	it( "should log a success message to the eventLog", function() {
		expect( messages ).to.have.length( 1 );
		expect( harness.logs.event ).to.have.length( 1 );
		expect( harness.logs.event[ 0 ] ).to.be( "No issues Found." );
	});
});


