## Anvil JSHint Plugin

This plugin requires anvil.js version 0.8.* or greater.

## Installation

```text
	anvil install anvil.jshint
```

## Usage

After you have installed the plugin you first need to reference the plugin inside the `dependencies` key of your `build.json`.

```javascript
{
	"source": "src",
	"spec": "spec",
	"output": [ "build" ],
	"dependencies" : [ "anvil.jshint" ],
	"anvil.jshint": {
		// Required settings here...
	}
}
```

Then you will need to choose one of the following senarios in order for the plugin to know which files to lint.

* Linting all your files
* Linting Specifc Files
* Linting All Files Except

### Settings

#### Linting all your files

Let's say that you had 5 JavaScript files in your `src` folder and you wanted all of them to be linted when you build your project. The following `"all": true` setting will tell `anvil.jshint` that you want everything to be linted.

```javascript
{
	"source": "src",
	"spec": "spec",
	"output": [ "build" ],
	"dependencies" : [ "anvil.jshint" ],
	"anvil.jshint": {
		"all": true
	}
}
```

#### Linting Specific Files

If you had 5 JavaScript files in your `src` folder and you only wanted a specific subset of those to be linted, then you could use the `include` setting and provide a list of files you want to include in the linting process.

```javascript
{
	"source": "src",
	"spec": "spec",
	"output": [ "build" ],
	"dependencies" : [ "anvil.jshint" ],
	"anvil.jshint": {
		"include": [ "main.js" ]
	}
}
```

#### Linting All Files Except

If you had 5 JavaScript files in your `src` folder and you wanted most of them to be linted, but to ignore a couple of items, then you could use the `exclude` setting and provide a list of files you want to exclude in the linting process.

```javascript
{
	"source": "src",
	"spec": "spec",
	"output": [ "build" ],
	"dependencies" : [ "anvil.jshint" ],
	"anvil.jshint": {
		"exclude": [ "util.js" ]
	}
}
```

#### Breaking Build Option

By default if there are any errors that JSHint returns then the build process will be aborted. You can override this option by providing setting the `breakBuild` to `false`.

```javascript
{
	"source": "src",
	"spec": "spec",
	"output": [ "build" ],
	"dependencies" : [ "anvil.jshint" ],
	"anvil.jshint": {
		"all": true,
		"breakBuild": false
	}
}
```

#### Ignore Specific Errors

Sometimes there are JSHint errors that for one reason or another you want ignored by the build process. To do that you can provide an `ignoreList` option with a list of all the errors that you feel are acceptable for your project. You list the `line`, `character`, and `reason` (contains) of each error you'd like to ignore. You can provide a combination of these options for more or less flexibility.

```javascript
{
	"source": "src",
	"spec": "spec",
	"output": [ "build" ],
	"dependencies" : [ "anvil.jshint" ],
	"anvil.jshint": {
		"all": true,
		"ignoreList": [
			{ "line": 81, "character": 26, "reason": "'someVariable' is already defined." },
			... other options ...
		]
	}
}
```

The following option ignores reason for line 81 and character 26

```javascript
	{ "line": 81, "character": 26, "reason": "'someVariable' is already defined." }
```

The following option ignores any error on line 81 and character 12

```javascript
{ "line": 81, "character": 12 }
```

The following option ignores reason anywhere on line 81

```javascript
	{ "line": 81, "reason": "'someVariable' is already defined." }
```

The following option ignores any errors on line 81

```javascript
	{ "line": 81 }
```

The following option ignores any errors matching reason anywhere in the file

```javascript
	{ "reason": "literal notation" }
```

#### JSLint Settings

You can always provide custom JSHint and global comments to the top of each of your JavaScript file to tweak it's lint settings, but that can be redundant and a nuisance. So, you can provide these common settings in your 'anvil.jshint' settings to be used during the linting process.

```javascript
{
	"source": "src",
	"spec": "spec",
	"output": [ "build" ],
	"dependencies" : [ "anvil.jshint" ],
	"anvil.jshint": {
		"all": true,
		"options": {
			"globals": {
				"console": false,
			},
			"white": true
		}
	}
}
```

## Uninstallation

```text
	anvil uninstall anvil.jshint
```
