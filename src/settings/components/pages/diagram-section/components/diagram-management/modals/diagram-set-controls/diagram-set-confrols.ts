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

    /**
     * Called when the modal is opened.
     *
     * Renders a settings interface for the user to control which panels are
     * visible on the diagram. The user is presented with a toggle for each of
     * "Move panel", "Zoom panel", and "Service panel". The state of these
     * toggles is initially set based on the `initial` object passed to the
     * constructor.
     *
     * When the user changes the state of a toggle, the `callback` function is
     * called with an object whose `on` property is the new state of the toggle
     * and whose `panel` property is one of `"move"`, `"zoom"`, or `"service"`.
     */
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

    /**
     * This method is called when the modal is closed.
     *
     * It empties the content element to prevent a memory leak.
     * @returns nothing
     */
    hide(): void {
        this.contentEl.empty();
    }
}
