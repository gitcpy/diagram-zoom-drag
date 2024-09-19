import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import MermaidZoomDragPlugin from './main';
import { UserGuideModal } from './user-guide-modal';

export class SettingsTab extends PluginSettingTab {
    constructor(
        public app: App,
        public plugin: MermaidZoomDragPlugin
    ) {
        super(app, plugin);
    }

    display(): any {
        const { containerEl } = this;
        containerEl.addClass('mermaid-zoom-drag-settings');

        new Setting(containerEl).addButton((button) => {
            button.setIcon('rotate-ccw');
            button.onClick(async (cb) => {
                await this.plugin.settingsManager.resetSettings();
                this.containerEl.empty();
                this.display();
            });
        });

        const addDiagram = new Setting(containerEl)
            .setName('Add new diagram')
            .addText((name) => {
                name.inputEl.id = 'diagram-name';
                name.setPlaceholder('Example Diagram');
                name.onChange((text) => {
                    name.setValue(text);
                });
            })
            .addText((input) => {
                input.inputEl.id = 'diagram-selector';
                input.setPlaceholder('.example-diagram');
                input.onChange((text) => {
                    input.setValue(text);
                });
            })
            .addButton((button) => {
                button.setIcon('save');
                button.onClick(async (cb) => {
                    const nameInput = addDiagram.settingEl.querySelector(
                        '#diagram-name'
                    ) as HTMLInputElement | null;
                    const selectorInput = addDiagram.settingEl.querySelector(
                        '#diagram-selector'
                    ) as HTMLInputElement | null;
                    if (nameInput && selectorInput) {
                        const name = nameInput.value;
                        const selector = selectorInput.value;
                        this.plugin.settings.supported_diagrams.push({
                            name: name,
                            selector: selector,
                        });
                        await this.plugin.settingsManager.saveSettings();
                        const scrollTop = containerEl.scrollTop;
                        this.containerEl.empty();
                        this.display();
                        this.containerEl.scrollTop = scrollTop;
                        new Notice('New diagram added!');
                    }
                });
            })
            .addExtraButton((extra) => {
                extra.setIcon('info');
                extra.setTooltip(
                    'Click for tips on finding diagram selectors.'
                );
                extra.onClick(() => {
                    new UserGuideModal(this.app, this.plugin).open();
                });
            });

        new Setting(containerEl).setName('Supported diagrams').setHeading();

        this.plugin.settings.supported_diagrams.forEach((diagram) => {
            const setting = new Setting(containerEl)
                .setName(diagram.name)
                .setDesc(diagram.selector)
                .addButton((button) => {
                    button.setIcon('trash');
                    button.setTooltip('Delete this diagram?');
                    button.onClick(async (cb) => {
                        const settings = this.plugin.settings;
                        settings.supported_diagrams =
                            settings.supported_diagrams.filter(
                                (diagramV) => diagramV !== diagram
                            );
                        await this.plugin.settingsManager.saveSettings();
                        setting.settingEl.remove();
                    });
                });
        });
    }

    hide(): any {
        this.containerEl.empty();
        return super.hide();
    }
}
