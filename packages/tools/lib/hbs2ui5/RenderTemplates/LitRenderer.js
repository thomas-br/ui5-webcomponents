const buildRenderer = (controlName, litTemplate) => {
	return `
/* eslint no-unused-vars: 0 */
<<<<<<< Updated upstream
import ifDefined from '@ui5/webcomponents-base/dist/renderer/ifDefined.js';
import { html, svg, repeat, classMap, styleMap, unsafeHTML, setTags, setSuffix } from '@ui5/webcomponents-base/dist/renderer/LitRenderer.js';
${litTemplate}
=======
import { ifDefined } from "lit-html/directives/if-defined.js";
import { html, svg, repeat, classMap, styleMap, unsafeHTML, scopeTag } from '@ui5/webcomponents-base/dist/renderer/LitRenderer.js';
import imperativeStyles from "@ui5/webcomponents-base/dist/renderer/imperativeStyles.js";
>>>>>>> Stashed changes

const main = (context, tags, suffix) => {
	setTags(tags);
	setSuffix(suffix);
	return block0(context);
};
 
export default main;`
};

module.exports = {
	generateTemplate: buildRenderer
};
