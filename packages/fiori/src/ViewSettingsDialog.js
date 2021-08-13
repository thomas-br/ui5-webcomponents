import { fetchI18nBundle, getI18nBundle } from "@ui5/webcomponents-base/dist/i18nBundle.js";
import { isPhone } from "@ui5/webcomponents-base/dist/Device.js";
import litRender from "@ui5/webcomponents-base/dist/renderer/LitRenderer.js";
import UI5Element from "@ui5/webcomponents-base/dist/UI5Element.js";
import Dialog from "@ui5/webcomponents/dist/Dialog.js";
import Button from "@ui5/webcomponents/dist/Button.js";
import GroupHeaderListItem from "@ui5/webcomponents/dist/GroupHeaderListItem.js";
import List from "@ui5/webcomponents/dist/List.js";
import StandardListItem from "@ui5/webcomponents/dist/StandardListItem.js";
import SegmentedButton from "@ui5/webcomponents/dist/SegmentedButton.js";
import SegmentedButtonItem from "@ui5/webcomponents/dist/SegmentedButtonItem.js";
import Bar from "./Bar.js";
import ViewSettingsDialogMode from "./types/ViewSettingsDialogMode.js";

import {
	VSD_DIALOG_TITLE_SORT,
	VSD_SUBMIT_BUTTON,
	VSD_CANCEL_BUTTON,
	VSD_RESET_BUTTON,
	VSD_SORT_ORDER,
	VSD_SORT_BY,
	VSD_ORDER_ASCENDING,
	VSD_ORDER_DESCENDING,
	VSD_FILTER_BY,
} from "./generated/i18n/i18n-defaults.js";

// Template
import ViewSettingsDialogTemplate from "./generated/templates/ViewSettingsDialogTemplate.lit.js";

// Styles
import viewSettingsDialogCSS from "./generated/themes/ViewSettingsDialog.css.js";

const metadata = {
	tag: "ui5-view-settings-dialog",
	managedSlots: true,
	properties: /** @lends  sap.ui.webcomponents.fiori.ViewSettingsDialog.prototype */ {
		/**
		 * Defines the initial sort order.
		 *
		 * @type {boolean}
		 * @defaultvalue false
		 * @public
		 */
		 sortDescending: {
			type: Boolean,
		},

		/**
		 * Keeps recently focused list in order to focus it on next dialog open.
		 *
		 * @type {Object}
		 * @private
		 */
		 _recentlyFocused: {
			type: Object,
		},

		/**
		 * Stores settings of the dialog before the initial open.
		 *
		 * @type {Object}
		 * @private
		 */
		 _initialSettings: {
			type: Object,
		},

		/**
		 * Stores settings of the dialog after confirmation.
		 *
		 * @type {Object}
		 * @private
		 */
		 _confirmedSettings: {
			type: Object,
		},

		/**
		 * Stores current settings of the dialog.
		 *
		 * @type {Object}
		 * @private
		 */
		 _currentSettings: {
			type: Object,
		},

		/**
		 * Defnies the current mode of the component
		 *
		 * @since 1.0.0-rc.16
		 * @private
		 */
		_currentMode: {
			type: ViewSettingsDialogMode,
			defaultValue: ViewSettingsDialogMode.Sort,
		},

		/**
		 * When in Filter By mode, defines whether we need to show the list of keys, or multicombobox with values
		 *
		 * @since 1.0.0-rc.16
		 * @private
		 */
		_filterStepTwo: {
			type: Boolean,
		},

		/**
		 *
		 * @since 1.0.0-rc.16
		 * @private
		 */
		_filters: {
			type: Object,
			multiple: true,
		},
	},
	slots: /** @lends  sap.ui.webcomponents.fiori.ViewSettingsDialog.prototype */ {
		/**
		 * Defines the <code>sortItems</code> list.
		 * @type {sap.ui.webcomponents.fiori.ListItem}
		 * @slot sortItems
		 * @public
		 */
		 sortItems: {
			type: HTMLElement,
		},

		/**
		 * Defines the <code>filterItems</code> list.
		 * @type {sap.ui.webcomponents.fiori.ListItem}
		 * @slot filterItems
		 * @public
		 */
		filterItems: {
			type: HTMLElement,
		},
	},
	events: /** @lends  sap.ui.webcomponents.fiori.ViewSettingsDialog.prototype */ {

		/**
		 * Fired when confirmation button is activated.
		 *
		 * @event sap.ui.webcomponents.fiori.ViewSettingsDialog#confirm
		 * @param {String} sortOrder The current sort order selected.
		 * @param {String} sortBy The current sort by selected.
		 * @public
		 */
		confirm: {
			detail: {
				sortOrder: { type: String },
				sortBy: { type: String },
				filters: { type: Array },
			},
		},

		/**
		 * Fired when cancel button is activated.
		 *
		 * @event sap.ui.webcomponents.fiori.ViewSettingsDialog#cancel
		 * @param {String} sortOrder The current sort order selected.
		 * @param {String} sortBy The current sort by selected.
		 * @public
		 */
		cancel: {
			detail: {
				sortOrder: { type: String },
				sortBy: { type: String },
				filters: { type: Array },
			},
		},
	},
};

/**
 * @class
 * <h3 class="comment-api-title">Overview</h3>
 * The <code>ui5-view-settings-dialog</code> component helps the user to sort data within a list or a table.
 * It consists of several lists like <code>Sort order</code> which is built-in and <code>Sort By</code> which must be provided by the developer.
 * The selected options can be used to create sorters for the table.
 *
 * The <code>ui5-view-settings-dialog</code> interrupts the current application processing as it is the only focused UI element and
 * the main screen is dimmed/blocked.
 * The <code>ui5-view-settings-dialog</code> is modal, which means that user action is required before returning to the parent window is possible.
 *
 * <h3>Structure</h3>
 * A <code>ui5-view-settings-dialog</code> consists of a header, content, and a footer for action buttons.
 * The <code>ui5-view-settings-dialog</code> is usually displayed at the center of the screen.
 *
 * <h3>Responsive Behavior</h3>
 * <code>ui5-view-settings-dialog</code> stretches on full screen on phones.
 *
 * <h3>ES6 Module Import</h3>
 *
 * <code>import "@ui5/webcomponents/dist/ViewSettingsDialog";</code>
 *
 * @constructor
 * @author SAP SE
 * @alias sap.ui.webcomponents.fiori.ViewSettingsDialog
 * @extends UI5Element
 * @tagname ui5-view-settings-dialog
 * @since 1.0.0-rc.16
 * @public
 */
class ViewSettingsDialog extends UI5Element {
	constructor() {
		super();
		this.i18nBundle = getI18nBundle("@ui5/webcomponents-fiori");
	}

	onBeforeRendering() {
		if (this._filters.length) {
			this._setAdditionalTexts();
		}
	}

	_setAdditionalTexts() {
		// Add the additional text to the filter options
		this.filterItems.forEach((filter, index) => {
			let selectedCount = 0;
			for (let i = 0; i < filter.values.length; i++) {
				if (this._filters[index].filterOptions[i].selected) {
					selectedCount++;
				}
			}

			filter.additionalText = !selectedCount ? "" : selectedCount;
		});
	}

	static get render() {
		return litRender;
	}

	static get metadata() {
		return metadata;
	}

	static get dependencies() {
		return [
			Bar,
			Button,
			Dialog,
			List,
			StandardListItem,
			GroupHeaderListItem,
			SegmentedButton,
			SegmentedButtonItem,
		];
	}

	static get template() {
		return ViewSettingsDialogTemplate;
	}

	static get styles() {
		return viewSettingsDialogCSS;
	}

	static async onDefine() {
		await fetchI18nBundle("@ui5/webcomponents-fiori");
	}

	get _selectedFilter() {
		for (let i = 0; i < this._filters.length; i++) {
			if (this._filters[i].selected) {
				return this._filters[i];
			}
		}
	}

	get _filterByTitle() {
		return "awd";
		// return `${this.i18nBundle.getText(VSD_FILTER_BY)}: ${this._selectedFilter.text}`;
	}

	get _dialogTitle() {
		return this.i18nBundle.getText(VSD_DIALOG_TITLE_SORT);
	}

	get _okButtonLabel() {
		return this.i18nBundle.getText(VSD_SUBMIT_BUTTON);
	}

	get _cancelButtonLabel() {
		return this.i18nBundle.getText(VSD_CANCEL_BUTTON);
	}

	get _resetButtonLabel() {
		return this.i18nBundle.getText(VSD_RESET_BUTTON);
	}

	get _ascendingLabel() {
		return this.i18nBundle.getText(VSD_ORDER_ASCENDING);
	}

	get _descendingLabel() {
		return this.i18nBundle.getText(VSD_ORDER_DESCENDING);
	}

	get _sortOrderLabel() {
		return this.i18nBundle.getText(VSD_SORT_ORDER);
	}

	get _filterByLabel() {
		return this.i18nBundle.getText(VSD_FILTER_BY);
	}

	get _sortByLabel() {
		return this.i18nBundle.getText(VSD_SORT_BY);
	}

	get _isPhone() {
		return isPhone();
	}

	get _sortAscending() {
		return !this.sortDescending;
	}

	/**
	 * Determines disabled state of the <code>Reset</code> button.
	 */
	get _disableResetButton() {
		return this._dialog && JSON.stringify(this._currentSettings) === JSON.stringify(this._initialSettings);
	}

	/**
	 * Returns the current settings (current state of all lists).
	 */
	get _settings() {
		const settings = {},
			  sortOrderSelected = this._sortOrder && this._sortOrder.getSelectedItems(),
			  sortBySelected = this._sortBy && this._sortBy.getSelectedItems();

		settings.sortOrder = sortOrderSelected ? sortOrderSelected[0] : undefined;
		settings.sortBy = sortBySelected ? sortBySelected[0] : undefined;

		settings._filters = this._initFilters;
		return settings;
	}

	get _initFilters() {
		return this.filterItems.map(item => {
			return {
				text: item.text,
				selected: false,
				item,
				filterOptions: item.values.map(optionValue => {
					return {
						text: optionValue.text,
						option: optionValue,
						selected: optionValue.selected,
					};
				}),
			};
		});
	}

	get isModeSort() {
		return this._currentMode === ViewSettingsDialogMode.Sort;
	}

	get isModeFilter() {
		return this._currentMode === ViewSettingsDialogMode.Filter;
	}

	get showBackButton() {
		return this.isModeFilter && this._filterStepTwo;
	}

	get _sortOrderList() {
		return this.shadowRoot.querySelector("[ui5-list][sort-order]");
	}

	get _sortByList() {
		return this.shadowRoot.querySelector("[ui5-list][sort-by]");
	}

	get _dialogDomRef() {
		return this.shadowRoot.querySelector("[ui5-dialog]");
	}

	/**
	 * Shows the dialog.
	 * @public
	 */
	show() {
		if (!this._dialog) {
			this._sortOrder = this._sortOrderList;
			this._sortBy = this._sortByList;
			this._initialSettings = this._settings;
			this._currentSettings = this._settings
			this._confirmedSettings = this._settings
			this._dialog = this._dialogDomRef;
		} else {
			this._restoreSettings(this._confirmedSettings);
		}
		this._dialog.show();
	}

	_handleModeChange(event) {
		this._currentMode = ViewSettingsDialogMode[event.detail.selectedItem.getAttribute("mode")];
	}

	_handleFilterValueItemClick(event) {
		// Update the component state
		this._filters = this._filters.map(filter => {
			if (filter.selected) {
				filter.filterOptions.forEach(option => {
					if (option.text === event.detail.item.innerText) {
						option.selected = !option.selected;
					}
				});

			}
			return filter;
		});
	}

	_navigateToFilters(event) {
		this._filterStepTwo = false;
	}

	_changeCurrentFilter(event) {
		this._filterStepTwo = true;
		this._filters = this._filters.map(filter => {
			filter.selected = filter.item === event.detail.item;

			return filter;
		});
	}

	/**
	 * Closes the dialog.
	 */
	close() {
		this._dialog && this._dialog.close();
	}

	/**
	 * Sets focus on recently used control within the dialog.
	 */
	_focusRecentlyUsedControl() {
		if (!Object.keys(this._recentlyFocused).length) {
			return;
		}
		const recentlyFocusedSelectedItems = this._recentlyFocused.getSelectedItems(),
			  recentlyFocusedItems = this._recentlyFocused.items,
			  slottedNodesExist = recentlyFocusedItems[1] && recentlyFocusedItems[1].assignedNodes && recentlyFocusedItems[1].assignedNodes().length;

		if (recentlyFocusedSelectedItems.length) {
			recentlyFocusedSelectedItems[0].focus();
		} else if (slottedNodesExist) {
			this._recentlyFocused.focusItem(recentlyFocusedItems[1].assignedNodes()[0]);
		}
	}

	/**
	 * Stores current settings as confirmed and fires <code>confirm</code> event.
	 */
	_confirmSettings() {
		this.close();
		// this._confirmedSettings = this._currentSettings;
		this._filters = [...this._filters];

		this.fireEvent("confirm", {
			sortOrder: this._confirmedSettings.sortOrder && this._confirmedSettings.sortOrder.innerText,
			sortBy: this._confirmedSettings.sortBy ? this._confirmedSettings.sortBy.text : "",
			// filters: this._filters.map(),
		});
	}

	/**
	 * Sets current settings to recently confirmed ones and fires <code>cancel</code> event.
	 */
	_cancelSettings() {
		debugger;
		this._restoreSettings(this._confirmedSettings);
		this.fireEvent("cancel", {
			sortOrder: this._confirmedSettings.sortOrder && this._confirmedSettings.sortOrder.innerText,
			sortBy: this._confirmedSettings.sortBy ? this._confirmedSettings.sortBy.text : "",
		});
		this.close();
	}

	/**
	 * If the dialog is closed by [ESC] key, do the same as if the <code>Cancel</code> button is pressed.
	 *
	 * @param {event} evt
	 */
	_restoreConfirmedOnEscape(evt) {
		if (evt.detail.escPressed) {
			this._cancelSettings();
		}
	}

	/**
	 * Resets the control settings to their initial state.
	 */
	_resetSettings() {
		this._restoreSettings(this._initialSettings);
		this._filterStepTwo = false;
		this._recentlyFocused = this._sortOrder;
		this._focusRecentlyUsedControl();
	}

	/**
	 * Sets current settings to ones passed as <code>settings</code> argument.
	 *
	 * @param {Object} settings
	 */
	_restoreSettings(settings) {
		///Sorting handling
		const sortOrderSelected = settings.sortOrder && settings.sortOrder.innerText,
			  sortBySelected = settings.sortBy && settings.sortBy.text;

		this._sortOrder.items.forEach(item => { item.selected = sortOrderSelected === item.innerText; });
		this._sortBy.items[1].assignedNodes().forEach(item => { item.selected = sortBySelected === item.text; });

		// Filters handling
		// this._currentSettings = settings;
		this._filters = settings._filters.map(filter=> filter);
	}

	/**
	 * Stores <code>Sort Order</code> list as recently used control and its selected item in current state.
	 */
	_onSortOrderChange() {
		this._recentlyFocused = this._sortOrder;
		this._currentSettings = this._settings;
	}

	/**
	 * Stores <code>Sort By</code> list as recently used control and its selected item in current state.
	 */
	 _onSortByChange() {
		this._recentlyFocused = this._sortBy;
		this._currentSettings = this._settings;
	}
}

ViewSettingsDialog.define();

export default ViewSettingsDialog;
