import { Directive, directive } from "lit-html/directive.js";
import { noChange } from "lit-html";

class ImperativeStyles extends Directive {
	render() {
		return noChange; // we don't render anything, the whole work is done imperatively
	}

	update(part, props) {
		const el = part.element;
		const styleMap = props[0];

		for (const i in styleMap) { // eslint-disable-line
			el.style[i] = styleMap[i];
		}

		return this.render();
	}
}

const imperativeStyles = directive(ImperativeStyles);

export default imperativeStyles;
