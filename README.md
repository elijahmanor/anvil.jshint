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
