import "./StaticArea.js";
import updateShadowRoot from "./updateShadowRoot.js";
import { renderFinished } from "./Render.js";
import getEffectiveContentDensity from "./util/getEffectiveContentDensity.js";
import { getEffectiveScopingSuffixForTag } from "./CustomElementsScopeUtils.js";
import getEffectiveDir from "./locale/getEffectiveDir.js";
import type UI5Element from "./UI5Element.js";
import { getCurrentRuntimeIndex } from "./Runtimes.js";

const pureTagName = "ui5-static-area-item";
const popupIntegrationAttr = "data-sap-ui-integration-popup-content";

/**
 *
 * @class
 * @author SAP SE
 * @private
 */
class StaticAreaItem extends HTMLElement {
	_rendered: boolean;
	ownerElement?: UI5Element;

	constructor() {
		super();
		this._rendered = false;
		this.attachShadow({ mode: "open" });
	}

	/**
	 * @param {UI5Element} ownerElement the UI5Element instance that owns this static area item
	 */
	setOwnerElement(ownerElement: UI5Element) {
		this.ownerElement = ownerElement;
		this.classList.add(this.ownerElement._id); // used for getting the popover in the tests
		if (this.ownerElement.hasAttribute("data-ui5-static-stable")) {
			this.setAttribute("data-ui5-stable", this.ownerElement.getAttribute("data-ui5-static-stable")!); // stable selector
		}
	}

	/**
	 * Updates the shadow root of the static area item with the latest state, if rendered
	 */
	update() {
		if (this._rendered) {
			this._updateAdditionalAttrs();
			this._updateContentDensity();
			this._updateDirection();
			updateShadowRoot(this.ownerElement!, true);
		}
	}

	/**
	 * Sets the correct content density based on the owner element's state
	 * @private
	 */
	_updateContentDensity() {
		if (getEffectiveContentDensity(this.ownerElement!) === "compact") {
			this.classList.add("sapUiSizeCompact");
			this.classList.add("ui5-content-density-compact");
		} else {
			this.classList.remove("sapUiSizeCompact");
			this.classList.remove("ui5-content-density-compact");
		}
	}

	_updateDirection() {
		if (this.ownerElement) {
			const dir = getEffectiveDir(this.ownerElement);
			if (dir) {
				this.setAttribute("dir", dir);
			} else {
				this.removeAttribute("dir");
			}
		}
	}

	_updateAdditionalAttrs() {
		this.setAttribute(`_ui5rt${getCurrentRuntimeIndex()}`, "");
		this.setAttribute("_ui5host", "");
		this.setAttribute(pureTagName, "");
		this.setAttribute(popupIntegrationAttr, "");
	}

	/**
	 * @protected
	 * Returns reference to the DOM element where the current fragment is added.
	 */
	async getDomRef() {
		this._updateContentDensity();
		if (!this._rendered) {
			this._rendered = true;
			updateShadowRoot(this.ownerElement!, true);
		}
		await renderFinished(); // Wait for the content of the ui5-static-area-item to be rendered
		return this.shadowRoot;
	}

	static getTag() {
		const suffix = getEffectiveScopingSuffixForTag(pureTagName);
		if (!suffix) {
			return pureTagName;
		}

		return `${pureTagName}-${suffix}`;
	}

	static createInstance() {
		if (!customElements.get(StaticAreaItem.getTag())) {
			customElements.define(StaticAreaItem.getTag(), StaticAreaItem);
		}

		return document.createElement(this.getTag()) as StaticAreaItem;
	}
}

export default StaticAreaItem;
