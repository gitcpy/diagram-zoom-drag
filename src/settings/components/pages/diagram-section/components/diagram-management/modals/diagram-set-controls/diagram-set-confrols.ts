import { App, Modal, Setting } from 'obsidian';
import { PanelsState, Result } from './typing/interfaces';

export class DiagramSetConfrols extends Modal {
    constructor(
        app: App,
        private name: string,
        private initial: PanelsState,
        private callback: (result: Result) => Promise<void>
    ) {
        super(app);
        this.setTitle(`Set diagram controls for ${this.name} diagram`);
    }
    onOpen(): void {
        const { contentEl } = this;

        new Setting(contentEl).setDesc(
            `These settings will only apply to this diagram.`
        );

        new Setting(contentEl).setName('Move panel').addToggle((toggle) => {
            toggle.setValue(this.initial.move.on);
            toggle.onChange(async (value) => {
                await this.callback({
                    on: value,
                    panel: 'move',
                });
            });
        });
        new Setting(contentEl).setName('Zoom panel').addToggle((toggle) => {
            toggle.setValue(this.initial.zoom.on);
            toggle.onChange(async (value) => {
                await this.callback({
                    on: value,
                    panel: 'zoom',
                });
            });
        });

        new Setting(contentEl).setName('Service panel').addToggle((toggle) => {
            toggle.setValue(this.initial.service.on);
            toggle.onChange(async (value) => {
                await this.callback({
                    on: value,
                    panel: 'service',
                });
            });
        });
    }

    hide(): void {
        this.contentEl.empty();
    }
}
