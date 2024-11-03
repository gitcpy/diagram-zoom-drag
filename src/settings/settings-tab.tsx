import { App, PluginSettingTab } from 'obsidian';
import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { createRoot, Root } from 'react-dom/client';
import Application from './components/Application';
import React from 'react';

export class SettingsTab extends PluginSettingTab {
    private root: Root | undefined = undefined;
    constructor(
        public app: App,
        public plugin: DiagramZoomDragPlugin
    ) {
        super(app, plugin);
        this.containerEl.addClass('diagram-zoom-drag-settings');
    }

    /**
     * Displays the settings tab.
     *
     * This method creates a new root element within the container and renders
     * the React application with the provided app and plugin properties.
     *
     * @returns A promise that resolves when the display is complete.
     */
    async display(): Promise<any> {
        const root = this.containerEl.createDiv();
        this.root = createRoot(root);
        this.root.render(<Application app={this.app} plugin={this.plugin} />);
    }

    /**
     * Hides the settings tab.
     *
     * This method unmounts the React root component and clears the container element.
     */
    hide(): void {
        this.root?.unmount();
        this.containerEl.empty();
    }
}
