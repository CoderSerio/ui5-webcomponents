import property from "@ui5/webcomponents-base/dist/decorators/property.js";
import customElement from "@ui5/webcomponents-base/dist/decorators/customElement.js";
import slot from "@ui5/webcomponents-base/dist/decorators/slot.js";
import event from "@ui5/webcomponents-base/dist/decorators/event.js";
import Integer from "@ui5/webcomponents-base/dist/types/Integer.js";
import type { ClassMap } from "@ui5/webcomponents-base/dist/types.js";
import { isLeft, isRight } from "@ui5/webcomponents-base/dist/Keys.js";
import { getI18nBundle } from "@ui5/webcomponents-base/dist/i18nBundle.js";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState.js";
import ListItem from "./ListItem.js";
import Icon from "./Icon.js";
import "@ui5/webcomponents-icons/dist/navigation-right-arrow.js";
import "@ui5/webcomponents-icons/dist/navigation-down-arrow.js";
import {
	TREE_ITEM_ARIA_LABEL,
	TREE_ITEM_EXPAND_NODE,
	TREE_ITEM_COLLAPSE_NODE,
} from "./generated/i18n/i18n-defaults.js";

// Template
import TreeItemBaseTemplate from "./generated/templates/TreeItemBaseTemplate.lit.js";

// Styles
import treeItemCss from "./generated/themes/TreeItem.css.js";

import HasPopup from "./types/HasPopup.js";

type TreeItemBaseEventDetail = {
	item: TreeItemBase,
}
type TreeItemBaseToggleEventDetail = TreeItemBaseEventDetail;
type TreeItemBaseStepInEventDetail = TreeItemBaseEventDetail;
type TreeItemBaseStepOutEventDetail = TreeItemBaseEventDetail;

/**
 * A class to serve as a foundation
 * for the <code>TreeItem</code> and <code>TreeItemCustom</code> classes.
 *
 * @abstract
 * @constructor
 * @author SAP SE
 * @alias sap.ui.webc.main.TreeItemBase
 * @extends sap.ui.webc.main.ListItem
 * @public
 */
@customElement({
	languageAware: true,
	template: TreeItemBaseTemplate,
	styles: [
		ListItem.styles,
		treeItemCss,
	],
	dependencies: [
		...ListItem.dependencies,
		Icon,
	],
})
/**
 * Fired when the user interacts with the expand/collapse button of the tree list item.
 * @event
 * @param {HTMLElement} item the toggled item.
 * @protected
 */
@event("toggle", {
	detail: {
		item: { type: HTMLElement },
	},
})

/**
 * Fired when the user drills down into the tree hierarchy by pressing the right arrow on the tree node.
 *
 * @event sap.ui.webc.main.TreeItemBase#step-in
 * @param {HTMLElement} item the item on which right arrow was pressed.
 * @protected
 */
@event("step-in", {
	detail: {
		item: { type: HTMLElement },
	},
})

/**
 * Fired when the user goes up the tree hierarchy by pressing the left arrow on the tree node.
 *
 * @event sap.ui.webc.main.TreeItemBase#step-out
 * @param {HTMLElement} item the item on which left arrow was pressed.
 * @protected
 */
@event("step-out", {
	detail: {
		item: { type: HTMLElement },
	},
})
class TreeItemBase extends ListItem {
	/**
	 * Defines the indentation of the tree list item. Use level 1 for tree list items, representing top-level tree nodes.
	 *
	 * @type {sap.ui.webc.base.types.Integer}
	 * @name sap.ui.webc.main.TreeItemBase.prototype.level
	 * @protected
	 * @defaultValue 1
	 */
	@property({ validator: Integer, defaultValue: 1 })
	level!: number;

	/**
	 * If set, an icon will be displayed before the text of the tree list item.
	 *
	 * @public
	 * @name sap.ui.webc.main.TreeItemBase.prototype.icon
	 * @type {string}
	 * @defaultValue ""
	 */
	@property()
	icon!: string;

	/**
	 * Defines whether the tree list item should display an expand/collapse button.
	 *
	 * @type {boolean}
	 * @name sap.ui.webc.main.TreeItemBase.prototype.showToggleButton
	 * @defaultvalue false
	 * @protected
	 */
	@property({ type: Boolean })
	showToggleButton!: boolean;

	/**
	 * Defines whether the tree list item will show a collapse or expand icon inside its toggle button.
	 *
	 * @type {boolean}
	 * @name sap.ui.webc.main.TreeItemBase.prototype.expanded
	 * @defaultvalue false
	 * @public
	 */
	@property({ type: Boolean })
	expanded!: boolean;

	/**
	* Defines whether the selection of a tree node is displayed as partially selected.
	* <br><br>
	* <b>Note:</b> The indeterminate state can be set only programmatically and can’t be achieved by user
	* interaction, meaning that the resulting visual state depends on the values of the <code>indeterminate</code>
	* and <code>selected</code> properties:
	* <ul>
	* <li> If a tree node has both <code>selected</code> and <code>indeterminate</code> set to <code>true</code>, it is displayed as partially selected.
	* <li> If a tree node has <code>selected</code> set to <code>true</code> and <code>indeterminate</code> set to <code>false</code>, it is displayed as selected.
	* <li> If a tree node has <code>selected</code> set to <code>false</code>, it is displayed as not selected regardless of the value of the <code>indeterminate</code> property.
	* </ul>
	* <br>
	* <b>Note:</b> This property takes effect only when the <code>ui5-tree</code> is in <code>MultiSelect</code> mode.
	* @type {boolean}
	* @name sap.ui.webc.main.TreeItemBase.prototype.indeterminate
	* @defaultvalue false
	* @public
	* @since 1.1.0
	*/
	@property({ type: Boolean })
	indeterminate!: boolean;

	/**
	 * Defines whether the tree node has children, even if currently no other tree nodes are slotted inside.
	 * <br>
	 * <i>Note:</i> This property is useful for showing big tree structures where not all nodes are initially loaded due to performance reasons.
	 * Set this to <code>true</code> for nodes you intend to load lazily, when the user clicks the expand button.
	 * It is not necessary to set this property otherwise. If a tree item has children, the expand button will be displayed anyway.
	 *
	 * @type {boolean}
	 * @name sap.ui.webc.main.TreeItemBase.prototype.hasChildren
	 * @defaultvalue false
	 * @public
	 */
	@property({ type: Boolean })
	hasChildren!: boolean;

	/**
	 * Defines the state of the <code>additionalText</code>.
	 * <br>
	 * Available options are: <code>"None"</code> (by default), <code>"Success"</code>, <code>"Warning"</code>, <code>"Information"</code> and <code>"Error"</code>.
	 * @type {sap.ui.webc.base.types.ValueState}
	 * @name sap.ui.webc.main.TreeItemBase.prototype.additionalTextState
	 * @defaultvalue "None"
	 * @public
	 * @since 1.0.0-rc.15
	 */
	@property({ type: ValueState, defaultValue: ValueState.None })
	additionalTextState!: `${ValueState}`;

	/**
	 * Defines the accessible name of the component.
	 *
	 * @type {string}
	 * @name sap.ui.webc.main.TreeItemBase.prototype.accessibleName
	 * @defaultvalue: ""
	 * @public
	 * @since 1.8.0
	 */
	@property()
	accessibleName!: string;

	/**
	 * Defines whether the toggle button is shown at the end, rather than at the beginning of the item
	 *
	 * @protected
	 * @since 1.0.0-rc.8
	 */
	@property({ type: Boolean })
	_toggleButtonEnd!: boolean;

	/**
	 * Defines whether the item shows minimal details - only icon (no text or toggle button)
	 *
	 * @protected
	 * @since 1.0.0-rc.8
	 */
	@property({ type: Boolean })
	_minimal!: boolean;

	/**
	 * @private
	 * @since 1.0.0-rc.11
	 */
	@property({ validator: Integer, defaultValue: 1, noAttribute: true })
	_setsize!: number;

	/**
	 * @private
	 * @since 1.0.0-rc.11
	 */
	@property({ validator: Integer, defaultValue: 1, noAttribute: true })
	_posinset!: number;

	/**
	 * Defines the description for the accessible role of the component.
	 * @protected
	 * @type {string}
	 * @defaultvalue undefined
	 * @since 1.10.0
	 */
	@property({ type: String, defaultValue: undefined, noAttribute: true })
	accessibleRoleDescription?: string;

	/**
	 * Defines if the item should be collapsible or not.
	 * It is true, for example, for the items inside the Popover of the Side Navigation
	 * @private
	 * @type {boolean}
	 * @defaultvalue false
	 * @since 1.10.0
	 */
	@property({ type: Boolean })
	_fixed!: boolean;

	/**
	 * Defines the availability and type of interactive popup element that can be triggered by the component on which the property is set.
	 * @type {sap.ui.webc.main.types.HasPopup}
	 * @since 1.10.0
	 * @private
	 */
	@property({ type: HasPopup, noAttribute: true })
	ariaHaspopup?: `${HasPopup}`;

	/**
	 * Defines the items of the component.
	 * <br />
	 * <br />
	 * <b>Note:</b> Use <code>ui5-tree-item</code> or <code>ui5-tree-item-custom</code>
	 *
	 * @type {sap.ui.webc.main.ITreeItem[]}
	 * @name sap.ui.webc.main.TreeItemBase.prototype.default
	 * @slot items
	 * @public
	 */
	@slot({ type: HTMLElement, "default": true })
	items!: Array<TreeItemBase>;

	onBeforeRendering() {
		this.actionable = false;
		this.showToggleButton = this.requiresToggleButton;
	}

	get classes(): ClassMap {
		const allClasses = super.classes;
		allClasses.main["ui5-li-root-tree"] = true;
		return allClasses;
	}

	get styles() {
		return {
			preContent: {
				"padding-inline-start": `calc(var(--_ui5-tree-indent-step) * ${this.effectiveLevel})`,
			},
		};
	}

	get requiresToggleButton() {
		return !this._fixed ? (this.hasChildren || this.items.length > 0) : false;
	}

	get effectiveLevel() {
		return this.level - 1;
	}

	get hasParent() {
		return this.level > 1;
	}

	get _toggleIconName() {
		return this.expanded ? "navigation-down-arrow" : "navigation-right-arrow";
	}

	get _showToggleButtonBeginning() {
		return this.showToggleButton && !this._minimal && !this._toggleButtonEnd;
	}

	get _showToggleButtonEnd() {
		return this.showToggleButton && !this._minimal && this._toggleButtonEnd;
	}

	get _ariaLabel() {
		return this.accessibleRoleDescription ? undefined : TreeItemBase.i18nBundle.getText(TREE_ITEM_ARIA_LABEL);
	}

	get _accInfo() {
		const accInfoSettings = {
			role: this._minimal ? "menuitemradio" : "treeitem",
			ariaExpanded: this.showToggleButton && !this._minimal ? this.expanded : undefined,
			ariaLevel: this._minimal ? undefined : this.level,
			posinset: this._posinset,
			setsize: this._setsize,
			ariaSelectedText: this.ariaSelectedText,
			listItemAriaLabel: !this.accessibleName ? this._ariaLabel : undefined,
			ariaOwns: this.expanded ? `${this._id}-subtree` : undefined,
			ariaHaspopup: this.ariaHaspopup || undefined,
			ariaChecked: false,
			ariaSelected: false,
		};

		if (this._minimal) {
			accInfoSettings.ariaChecked = this.selected;
		} else {
			accInfoSettings.ariaSelected = this.selected;
		}

		return { ...super._accInfo, ...accInfoSettings };
	}

	/**
	 * Used to duck-type TreeItem elements without using instanceof
	 * @returns {boolean}
	 * @protected
	 */
	get isTreeItem() {
		return true;
	}

	/**
	 * Call this method to manually switch the <code>expanded</code> state of a tree item.
	 * @public
	 * @method
	 * @name sap.ui.webc.main.TreeItemBase#toggle
	 */
	toggle() {
		this.expanded = !this.expanded;
	}

	_toggleClick(e: MouseEvent | KeyboardEvent) {
		e.stopPropagation();
		this.fireEvent<TreeItemBaseToggleEventDetail>("toggle", { item: this });
	}

	_onkeydown(e: KeyboardEvent) {
		super._onkeydown(e);

		if (!this._fixed && this.showToggleButton && isRight(e)) {
			if (!this.expanded) {
				this.fireEvent<TreeItemBaseToggleEventDetail>("toggle", { item: this });
			} else {
				this.fireEvent<TreeItemBaseStepInEventDetail>("step-in", { item: this });
			}
		}

		if (!this._fixed && isLeft(e)) {
			if (this.expanded) {
				this.fireEvent<TreeItemBaseToggleEventDetail>("toggle", { item: this });
			} else if (this.hasParent) {
				this.fireEvent<TreeItemBaseStepOutEventDetail>("step-out", { item: this });
			}
		}
	}

	get iconAccessibleName() {
		return this.expanded ? TreeItemBase.i18nBundle.getText(TREE_ITEM_COLLAPSE_NODE) : TreeItemBase.i18nBundle.getText(TREE_ITEM_EXPAND_NODE);
	}

	static async onDefine() {
		[TreeItemBase.i18nBundle] = await Promise.all([
			getI18nBundle("@ui5/webcomponents"),
			super.onDefine(),
		]);
	}
}

export default TreeItemBase;
export type {
	TreeItemBaseToggleEventDetail,
	TreeItemBaseStepInEventDetail,
	TreeItemBaseStepOutEventDetail,
};
