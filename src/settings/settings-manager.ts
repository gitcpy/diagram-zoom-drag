import path from 'path';
import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';

import { SupportedDiagrams } from '../typing/typing';

export interface DiagramData {
    name: string;
    selector: string;
}

export interface DEFAULT_SETTINGS_Interface {
    supported_diagrams: DiagramData[];
    foldByDefault: boolean;
    automaticFolding: boolean;
    hideOnMouseOutDiagram: boolean;
    hideOnMouseOutPanels: boolean;
}

export default class SettingsManager {
    constructor(public plugin: DiagramZoomDragPlugin) {
        this.plugin = plugin;
    }

    /**
     * Retrieves the default settings for the plugin.
     * @returns {DEFAULT_SETTINGS_Interface} The default settings object.
     */
    get defaultSettings(): DEFAULT_SETTINGS_Interface {
        return {
            supported_diagrams: Object.entries(SupportedDiagrams).map(
                ([key, value]) => {
                    return {
                        name: key,
                        selector: value,
                    };
                }
            ),
            foldByDefault: false,
            automaticFolding: false,
            hideOnMouseOutDiagram: false,
            hideOnMouseOutPanels: false,
        };
    }

    /**
     * Loads and initializes the plugin settings.
     *
     * @returns {Promise<void>} A promise that resolves when settings have been successfully loaded and applied.
     */
    async loadSettings(): Promise<void> {
        const userSettings = await this.plugin.loadData();
        const defaultSettings = this.defaultSettings;
        const settings = Object.assign({}, defaultSettings, userSettings);
        this.plugin.settings = {
            ...settings,
        };
    }

    /**
     * Saves the current plugin settings.
     *
     * @returns {Promise<void>} A promise that resolves when the settings have been successfully saved.
     */
    async saveSettings(): Promise<void> {
        const saveData = {
            ...this.plugin.settings,
        };
        await this.plugin.saveData(saveData);
    }

    /**
     * Resets the plugin settings to their default state.
     *
     * @returns {Promise<void>} A promise that resolves when the settings have been reset and the event has been published.
     */
    async resetSettings(): Promise<void> {
        const pluginPath = this.plugin.manifest.dir;
        if (pluginPath) {
            const configPath = path.join(pluginPath, '/data.json');
            const existsPath =
                await this.plugin.app.vault.adapter.exists(configPath);
            if (existsPath) {
                await this.plugin.app.vault.adapter.remove(configPath);
            }
            await this.loadSettings();
        }
    }
}
