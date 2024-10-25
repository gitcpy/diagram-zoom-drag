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

    async display(): Promise<any> {
        const root = this.containerEl.createDiv();
        this.root = createRoot(root);
        this.root.render(<Application app={this.app} plugin={this.plugin} />);
    }

    hide(): void {
        this.root?.unmount();
        this.containerEl.empty();
    }
}
