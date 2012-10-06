var jshint = require( "jshint" ).JSHINT;
var colors = require( "colors" );
var MessageFormat = require( "messageformat" );

colors.setTheme({
	verbose: "cyan",
	info: "green",
	warn: "yellow",
	debug: "blue",
	error: "red",
	data: "grey"
});

var jshintFactory = function( _, anvil ) {
	_.str = require( "underscore.string" );
	_.mixin( _.str.exports() );

	return anvil.plugin({
		name: "anvil.jshint",
		activity: "pre-process",
		all: true, //false,
		inclusive: false,
		exclusive: false,
		breakBuild: true,
		ignore: [],
		fileList: [],
		commander: [
			[ "-hint, --jshint", "JSHint all JavaScript files" ]
		],
		settings: {},
		messageFormat: new MessageFormat( "en" ),

		configure: function( config, command, done ) {
			if ( !_.isEmpty( this.config ) ) {
				if ( this.config.all ) {
					this.all = true;
				} else if ( this.config.include && this.config.include.length  ) {
					this.inclusive = true;
					this.fileList = this.config.include;
				} else if ( this.config.exclude && this.config.exclude.length ) {
					this.exclusive = true;
					this.fileList = this.config.exclude;
				}
				this.settings = this.getSettings( this.config );
				this.breakBuild = this.config.breakBuild === false ?
					this.config.breakBuild : this.breakBuild;
				this.ignore = this.config.ignore || [];
			} else if ( command.jshint ) {
				this.all = true;
			}

			done();
		},

		getSettings: function( config ) {
			var settings = {};

			if ( config.options ) {
				settings.options = config.options;
				settings.globals = settings.options ? settings.options.globals : {};
				delete settings.options.globals;
			} else {
				// TODO: Look for .jshintrc options in pwd, up tree, or $HOME
			}

			return settings;
		},

		run: function( done ) {
			var jsFiles = [],
				options = {},
				that = this,
				totalErrors = 0,
				transforms, message;

			if ( this.inclusive ) {
				jsFiles = _.filter( anvil.project.files, this.anyFile( this.fileList ) );
			} else if ( this.all || this.exclusive ) {
				jsFiles = _.filter( anvil.project.files, function( file ) {
					return file.extension() === ".js";
				});
				if ( this.exclusive ) {
					jsFiles = _.reject( jsFiles, this.anyFile( this.fileList ) );
				}
			}

			if ( jsFiles.length > 0 ) {
				message = this.messageFormat.compile( "Linting {NUM_RESULTS, plural, one{one file} other{# files}}." );
				anvil.log.step( message({ "NUM_RESULTS": jsFiles.length }) );
				transforms = _.map( jsFiles, function( file ) {
					return function( done ) {
						that.lint( file, function( numberOfErrors ) {
							totalErrors += numberOfErrors;
							done();
						});
					};
				});
				anvil.scheduler.pipeline( undefined, transforms, function() {
					if ( that.breakBuild === true &&
						_.isNumber( totalErrors ) && totalErrors > 0 ) {
						message = that.messageFormat.compile( "project {NUM_RESULTS, plural, one{one error} other{# errors}}!" );
						anvil.events.raise( "build.stop", message({ "NUM_RESULTS": totalErrors }) );
					}
					done();
				});
			} else {
				done();
			}
		},

		anyFile: function( list ) {
			return function( file ) {
				return _.any( list, function( name ) {
					var alias = anvil.fs.buildPath( [ file.relativePath, file.name ] );
					return name === alias || ( "/" + name ) == alias;
				});
			};
		},

		lint: function( file, done ) {
			var that = this;

			anvil.log.event( "Linting '"+ file.fullPath + "'" );
			anvil.fs.read( [ file.fullPath ], function( content, err ) {
				if ( !err ) {
					that.lintContent( file, content, function( numberOfErrors ) {
						done( numberOfErrors );
					});
				} else {
					anvil.log.error( "Error reading " + file.fullPath + " for linting: \n" + err.stack  );
					done({});
				}
			});
		},

		lintContent: function( file, content, done ) {
			var result = jshint( content, this.settings.options || {}, this.settings.globals || {} ),
				validErrors = [], ignoredErrors = 0, that = this;

			if ( result ) {
				anvil.log.event( "No issues Found." );
				that.log( "No issues Found." );
			} else {
				validErrors = this.processErrors( file, jshint.errors, this.ignore || [] );
				_.each( validErrors, function( error ) {
					anvil.log.error( error );
					that.log( error );
				});
				message = this.messageFormat.compile( "{NUM_RESULTS, plural, one{# issue} other{# issues}} found." );
				anvil.log.event( message({ "NUM_RESULTS": validErrors.length }) );
				ignoredErrors = jshint.errors.length - validErrors.length;
				if ( this.ignore.length && ignoredErrors ) {
					message = this.messageFormat.compile( "{NUM_RESULTS, plural, one{# issue} other{# issues}} ignored." );
					anvil.log.event( message({ "NUM_RESULTS": ignoredErrors }) );
				}
			}

			done( validErrors.length );
		},

		processErrors: function( file, errors, ignore ) {
			var result = [], padding = {}, that = this;

			padding = {
				line: _.reduce( errors, function( memo, error ) {
					if ( error && error.line.toString().length > memo.toString().length ) {
						memo = error.line.toString();
					}
					return memo;
				}, "" ).length,
				character: _.reduce( errors, function( memo, error ) {
					if ( error && error.character.toString().length > memo.toString().length ) {
						memo = error.character.toString();
					}
					return memo;
				}, "" ).length
			};

			_.each( errors, function( error ) {
				if ( error ) {
					if ( error.evidence ) {
						if ( !that.isIgnorable( file, error, ignore ) ) {
							result.push( that.formatError( error, padding ) );
						}
					} else {
						result.push( "Too Many Errors!" );
					}
				}
			});

			return result;
		},

		formatError: function( error, padding ) {
			return "[L".data + _.lpad( error.line, padding.line, "0" ).data +
				":C".data + _.lpad( error.character, padding.character, "0" ).data +
				"] ".data + error.evidence.replace( /^\s*/g, "" ).italic.error + " -> ".data +
				error.reason.bold.error;
		},

		/*
		 * The following option ignores reason for line 81 and character 26 in bad.js
		 * { "file": "bad.js", line": 81, "character": 26, "reason": "'someVariable' is already defined." }
		 *
		 * The following option ignores any error on line 81 and character 12 in bad.js
		 * { "file": "bad.js", "line": 81, "character": 12 }
		 *
		 * The following option ignores reason anywhere on line 81 in bad.js
		 * { "file": "bad.js", "line": 81, "reason": "'someVariable' is already defined." }
		 *
		 * The following option ignores any errors on line 81 in bad.js
		 * { "file": "bad.js", "line": 81 }
		 *
		 * The following option ignores any errors matching reason anywhere in bad.js
		 * { "file": "bad.js", "reason": "literal notation" }
		 *
		 * The following option ignores any errors matching reason anywhere in any file
		 * { reason": "literal notation" }
		 */
		isIgnorable: function( file, error, ignoreList ) {
			var ignorable = false;

			ignorable = _.any( ignoreList, function( ignore ) {
				return file.fullPath.indexOf( ignore.file ) > -1 && error.line === ignore.line && error.character === ignore.character && error.reason.indexOf( ignore.reason ) > -1;
			});
			if ( !ignorable ) {
				ignorable = _.any( ignoreList, function( ignore ) {
					return file.fullPath.indexOf( ignore.file ) > -1 && error.line === ignore.line && error.character === ignore.character && !ignore.reason;
				});
			}
			if ( !ignorable ) {
				ignorable = _.any( ignoreList, function( ignore ) {
					return file.fullPath.indexOf( ignore.file ) > -1 && error.line === ignore.line && !ignore.character && error.reason.indexOf( ignore.reason ) > -1;
				});
			}
			if ( !ignorable ) {
				ignorable = _.any( ignoreList, function( ignore ) {
					return file.fullPath.indexOf( ignore.file ) > -1 && error.line === ignore.line && !ignore.character && !ignore.reason;
				});
			}
			if ( !ignorable ) {
				ignorable = _.any( ignoreList, function( ignore ) {
					return file.fullPath.indexOf( ignore.file ) > -1 && !ignore.line && !ignore.character && error.reason.indexOf( ignore.reason ) > -1;
				});
			}
			if ( !ignorable ) {
				ignorable = _.any( ignoreList, function( ignore ) {
					return !ignore.file && !ignore.line && !ignore.character && error.reason.indexOf( ignore.reason ) > -1;
				});
			}

			return ignorable;
		},

		log: function( message ) {
			console.log( message );
		}
	});
};

module.exports = jshintFactory;