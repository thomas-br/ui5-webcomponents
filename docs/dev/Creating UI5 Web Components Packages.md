# Creating a Custom UI5 Web Components Package

This tutorial explains how to:
 - Create an NPM package for your own UI5 Web Components.
 - Use UI5 Web Components' standard build tools: `@ui5/webcomponents-tools`.
 - Gain all `@ui5/webcomponents` capabilities such as HBS template support, i18n, theming, test setup, etc.

*Note:* Whether you use `npm` or `yarn` is a matter of preference.

## Step 1. Create an empty NPM package

`npm init`

or

`yarn init`

The name that you give to your package will be used by the UI5 Web Components tools as the namespace for resource registration.

## Step 2. Add the UI5 Web Components packages as dependencies

With `npm`:
 - `npm i --save @ui5/webcomponents-base @ui5/webcomponents-theme-base`
 - `npm i --save-dev @ui5/webcomponents-tools chromedriver`
 - (Optional) `npm i --save @ui5/webcomponents-ie11`

or with `yarn`:
 - `yarn add @ui5/webcomponents-base @ui5/webcomponents-theme-base`
 - `yarn add -D @ui5/webcomponents-tools chromedriver`
 - (Optional) `yarn add @ui5/webcomponents-ie11`

These three `@ui5/` packages will serve as foundation for your own package and Web Components.

            Package             |                        Description
------------------------------- | ----------------------------------------------------------
`@ui5/webcomponents-base`       | Base classes and framework
`@ui5/webcomponents-theme-base` | Base theming assets
`@ui5/webcomponents-tools`      | Build and configuration assets
`@ui5/webcomponents-ie11`       | (Optional) Internet Explorer 11 polyfills and adapter code

*Note:* `chromedriver` is a peer dependency of `@ui5/webcomponents-tools` so that you get to choose the exact version,
if necessary. This is useful if, for example, you manually update Chrome on your system and you'd prefer not to have
a fixed `chromedriver` version packaged with `@ui5/webcomponents-tools`.

*Note:* `@ui5/webcomponents-ie11` is optional and should not be installed unless you need Internet Explorer 11 support.

## Step 3. Run the package initialization script

Run the initialization script, optionally with parameters from the following table:

Parameter |             Description             |   Default value
--------- | ----------------------------------- | ------------------
port      | Dev server port                     | 8080
tag       | The sample web component's tag name | my-first-component

For example:

`npx wc-init-ui5-package`

to get all the default values, or:

`npx wc-init-ui5-package --port=8081 --tag=my-new-component`

to change the port and the tag of the sample Web Component that will be created in the empty package.

*Please, note that the usage of the `ui5-` prefix is strongly discouraged, although not forbidden, for third-party components.
This is due to the possibility of name clashes in the future.*

The initialization script will set the directory structure and copy a couple of files.

## Step 4. Run the dev server and test the build

To run the dev server:

`npm run start`

or

`yarn start`

and once the project is built for the first time, open in your browser:

`http://localhost:8080/test-resources/pages/index.html`

*Note:* If you've chosen a different `port` earlier, change `8080` to its value.

You can also run the tests:

`npm run test`

or

`yarn test`

and the production build:

`npm run build`

or

`yarn build`.

*Note:* In order to run the tests for the first time, you must have built the project with either `start` or `build`,
and you must have installed `chromedriver`, as described in the previous step.

That's it!

## Understanding the project structure

### `package.json`

The initialization script will create several NPM scripts for you in `package.json`.

       Task        |                                   Purpose
------------------ | ----------------------------------------------------------------------------
clean              | Delete the `dist/` directory with the build output.
build              | Production build to the `dist/` directory.
lint               | Run a static code scan with `eslint`.
start              | Build the project for development, run the dev server and watch for changes.
watch              | Watch for changes only.
serve              | Run the dev server only.
test               | Run the dev server and execute the specs from the `test/specs/` directory.
create-ui5-element | Create an empty Web Component with the given name.

### Files in the main directory

The initialization script will create several files in your package's main directory.

       File        |                                                                 Purpose
------------------ | ---------------------------------------------------------------------------------------------------------------------------------------
.eslintignore      | Excludes the `dist/` and `test/` directories from static code scans.
package-scripts.js | An [nps](https://www.npmjs.com/package/nps) package scripts configuration file.
bundle.esm.js      | Entry point for the ES6 bundle used for development and tests. Intended for modern browsers.
bundle.es5.js      | Entry point for the ES5 bundle used for development and tests. Intended for IE11 only. Delete this file if you don't need IE11 support.

You'll likely only need to change `bundle.esm.js` to import your new components there.

### The `config/` directory

The `config/` directory serves as a central place for most build and test tools configuration assets. Normally, you
don't need to change any files there.

#### Custom configuration

The files in the `config/` directory simply import UI5 Web Components default configuration for all tasks: `rollup`, `wdio`, `eslint`, etc.

If you need to customize any configuration, simply put your own content into the respective file in `config/`.

Examples:
 - Modifying `eslint` settings.

    Open `config/.eslintrc.js`. It should look like this:
	 ```js
	module.exports = require("@ui5/webcomponents-tools/components-package/eslint.js");
	```
	As you can see, this is just a proxy to UI5 Web Components default configuration.
	Put your own content instead:
	```js
	module.exports = {
    	"env": {
    		"browser": true,
    		"es6": true
    	},
    	"root": true,
    	"extends": "airbnb-base",
   		.............
  	}
	```

 - Modifying `wdio` settings.

    Open `config/wdio.conf.js`. It should look like this:

    ```js
	module.exports = require("@ui5/webcomponents-tools/components-package/wdio.js");
	```

	Again, this is a proxy to UI5 Web Components default configuration.

	You could just paste the content of `@ui5/webcomponents-tools/components-package/wdio.js` here and modify at will.

	However, let's not replace the whole file by hand this time, but just modify the exported configuration object.

	```js
	const result = require("@ui5/webcomponents-tools/components-package/wdio.js");
	result.config.capabilities[0]["goog:chromeOptions"].args = ['--disable-gpu']; // From: ['--disable-gpu', '--headless']
	module.exports = result;
	```

	In this example, what we did was simply replace one option in the configuration object to disable `headless` mode
	so that we can use `browser.debug()` in our `*.spec.js` files. For more on testing, see [Testing Web Components](./Testing%20Web%20Components.md).

### The `src/` directory

This is where you'll do most of the development. Let's see the necessary files for a `my-first-component` component.

#### Class and template files

The main files describing a Web Component are:

           File            |       Purpose
-------------------------- | -------------------
`src/MyFirstComponent.js`  | Web Component class
`src/MyFirstComponent.hbs` | Handlebars template

In order to understand how a UI5 Web Component works and what lies behind these two files, make sure you check the
[Developing Web Components](./Developing%20Web%20Components.md) section of the documentation.

For the purposes of this tutorial, however, you don't need to understand their internals, as they are automatically generated by the
script and are in a working state already.

#### Theming-related files

A single set of CSS rules will be used for all themes. The only difference between themes may be the values of CSS Variables.
Some CSS Vars, such as `--sapBackgroundColor` and `--sapTextColor` are standard and automatically managed by the framework.
In addition, you can define your own CSS Vars and provide different values for them for the different themes. Set these CSS Vars in the
`parameters-bundle.css` file for each theme. These files are the entry points for the styles build script.

                       File                         |                                            Purpose
--------------------------------------------------- | ----------------------------------------------------------------------------------------------
`src/themes/MyFirstComponent.css`                   | All CSS rules for the Web Component, same for all themes; will be inserted in the shadow root.
`src/themes/sap_belize/parameters-bundle.css`       | Values for the component-specific CSS Vars for the `sap_belize` theme
`src/themes/sap_belize_hcb/parameters-bundle.css`   | Values for the component-specific CSS Vars for the `sap_belize_hcb` theme
`src/themes/sap_belize_hcw/parameters-bundle.css`   | Values for the component-specific CSS Vars for the `sap_belize_hcw` theme
`src/themes/sap_fiori_3/parameters-bundle.css`      | Values for the component-specific CSS Vars for the `sap_fiori_3` theme
`src/themes/sap_fiori_3_dark/parameters-bundle.css` | Values for the component-specific CSS Vars for the `sap_fiori_3_dark` theme
`src/themes/sap_fiori_3_hcb/parameters-bundle.css`  | Values for the component-specific CSS Vars for the `sap_fiori_3_hcb` theme
`src/themes/sap_fiori_3_hcw/parameters-bundle.css`  | Values for the component-specific CSS Vars for the `sap_fiori_3_hcw` theme

*Note:* It's up to you whether to put the CSS Vars directly in the `parameters-bundle.css` files for the different themes or to
import them from separate `.css` files. You could have, for example, a `MyFirstComponent-params.css` file for each theme and
import it into the `parameters-bundle.css` file: `@import "MyFirstComponent-params.css";`.

Again, to know more about how these files work, you could have a look at the [Developing Web Components](./Developing%20Web%20Components.md#css) section of the documentation.

#### i18n files

You can define translatable texts as key-value pairs, separated by `=` in the `messagebundle.properties` file. Then you can provide translations for as many languages
as needed.

                 File                  |                Purpose
-------------------------------------- | --------------------------------------
`src/i18n/messagebundle.properties`    | Source file for all translatable texts
`src/i18n/messagebundle_de.properties` | Translations in German
`src/i18n/messagebundle_en.properties` | Translations in English
etc...                                 | etc...

Let's have a look at the sample `messagebundle.properties` file, generated by the script.

```
#please wait text for the sample component
PLEASE_WAIT=wait
```

Here's where you define all i18n texts, optionally with comments for the translators (`# Comment`).

And now let's have a look at a sample file with translations, for example `messagebundle_es.properties`:

```
PLEASE_WAIT=Espere
```

#### Assets (additional themes, i18n texts, etc...)

     File       |               Purpose
--------------- | ------------------------------------
`src/Assets.js` | Entry point for your package assets.

This module imports all base assets (such as `CLDR` and the base theme parameters), but also your own
package assets (i18n and package-specific theme parameters). Users of your package will have to import this module in their production applications in order to get additional themes support and i18n support.

*Note:* For easier development and testing, `Assets.js` is also imported in the dev/test bundle `bundle.esm.js` by the initialization script.

### The `test/` directory

     File      |                                               Purpose
-------------- | ---------------------------------------------------------------------------------------------------
`test/pages/*` | Simple `.html` pages used for development and tests.
`src/specs/*`  | Test specs, based on [WDIO](https://www.npmjs.com/package/wdio). They use the test pages for setup.

You can execute all specs by running `yarn test` or `npm run test`.

For more on testing, see our [Testing Web Components](./Testing%20Web%20Components.md) section.

## Public consumption of your custom UI5 Web Components package

Once you've developed your package and published it to NPM, application developers can import from the `dist/` directory
of your package any of your Web Components, and optionally the `Assets.js` module, if they want additional themes and i18n.

For example, if your package is called `my-ui5-webcomponents`, users will install it by:

```
npm i my-ui5-webcomponents --save
```

and then use it by:

```js
import "my-ui5-webcomponents/Assets.js"; // optional
import "my-ui5-webcomponents/dist/MyFirstComponent.js"; // for my-first-component from this tutorial
import "my-ui5-webcomponents/dist/SomeOtherComponent.js";
import "my-ui5-webcomponents/dist/YetAnotherComponent.js";
```

*Note about assets:* The `Assets.js` module may import some relatively big `JSON` modules containing CLDR data, i18n texts and theming parameters.
Therefore, it is recommended to guide your package users to bundle their apps efficiently by configuring `rollup` or `webpack`,
depending on their choice, to not include the content of the assets `JSON` modules in their javascript bundle.
See the [Efficient asset bundling](../Assets.md#bundling) section of our [Assets](../Assets.md) documentation for details.
