import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { UserGuideModal } from './modals/user-guide-modal';

export class SettingsTab extends PluginSettingTab {
    constructor(
        public app: App,
        public plugin: DiagramZoomDragPlugin
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

        new Setting(containerEl).setHeading().setName('Diagram settings');

        new Setting(containerEl)
            .setName('Fold diagrams by default?')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.foldByDefault)
                    .onChange(async (value: boolean) => {
                        this.plugin.settings.foldByDefault = value;
                        await this.plugin.settingsManager.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName('Automatically fold diagrams on focus change?')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.automaticFolding)
                    .onChange(async (value: boolean) => {
                        this.plugin.settings.automaticFolding = value;
                        await this.plugin.settingsManager.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName('Hide panels when mouse leaves diagram?')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.hideOnMouseOutDiagram);
                toggle.onChange(async (value) => {
                    this.plugin.settings.hideOnMouseOutDiagram = value;
                    await this.plugin.settingsManager.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Hide panels when mouse leaves them?')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.hideOnMouseOutPanels)
                    .onChange(async (value) => {
                        this.plugin.settings.hideOnMouseOutPanels = value;
                        await this.plugin.settingsManager.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName('Hide by pressing Ctrl + M?')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.hideByCtrlPlusM)
                    .onChange(async (value) => {
                        this.plugin.settings.hideByCtrlPlusM = value;
                        await this.plugin.settingsManager.saveSettings();
                    });
            });

        new Setting(containerEl).setHeading().setName('Diagram management');

        const addDiagram = new Setting(containerEl);
        const diagramR = new RegExp(/^[A-Za-z0-9]+$/);
        const selectorR = new RegExp(/^\.[\w-]+$/);

        addDiagram
            .setName('Add new diagram')
            .addText((name) => {
                name.inputEl.id = 'diagram-name';
                name.setPlaceholder('Example Diagram');
                name.onChange((text) => {
                    name.setValue(text);
                    const dTest = diagramR.test(text);
                    if (!text) {
                        name.inputEl.removeClass('invalid');
                        name.inputEl.ariaLabel = '';
                    } else {
                        !dTest
                            ? name.inputEl.addClass('invalid')
                            : name.inputEl.removeClass('invalid');
                        name.inputEl.ariaLabel = !dTest
                            ? 'Incorrect input. Should be only `A-Za-z0-9`'
                            : '';
                    }
                });
            })
            .addText((input) => {
                input.inputEl.id = 'diagram-selector';
                input.setPlaceholder('.example-diagram');
                input.onChange((text) => {
                    input.setValue(text);
                    const sTest = selectorR.test(text);
                    if (!text) {
                        input.inputEl.removeClass('invalid');
                        input.inputEl.ariaLabel = '';
                    } else {
                        !sTest
                            ? input.inputEl.classList.add('invalid')
                            : input.inputEl.removeClass('invalid');
                        input.inputEl.ariaLabel = !sTest
                            ? 'Input incorrect. Should be a dot in the beginning and only `A-Za-z0-9-` after it'
                            : '';
                    }
                });
            })
            .addButton((button) => {
                button.setIcon('save');
                button.onClick(async (cb) => {
                    const nameInput: HTMLInputElement | null =
                        addDiagram.settingEl.querySelector('#diagram-name');
                    const selectorInput: HTMLInputElement | null =
                        addDiagram.settingEl.querySelector('#diagram-selector');
                    if (!nameInput || !selectorInput) {
                        return;
                    }

                    const name = nameInput.value;
                    const selector = selectorInput.value;
                    if (!diagramR.test(name) || !selectorR.test(selector)) {
                        new Notice('Input is not valid!');

                        nameInput.classList.add('shake');
                        selectorInput.classList.add('shake');

                        setTimeout(() => {
                            nameInput.removeClass('shake');
                            selectorInput.removeClass('shake');
                        }, 500);
                        return;
                    }

                    const isAlreadyExist =
                        this.plugin.settings.supported_diagrams.find(
                            (d) => d.name === name || d.selector === selector
                        );
                    if (isAlreadyExist) {
                        new Notice('Is already exists!');
                        nameInput.classList.add('shake');
                        selectorInput.classList.add('shake');

                        setTimeout(() => {
                            nameInput.removeClass('shake');
                            selectorInput.removeClass('shake');
                        }, 500);
                        return;
                    }

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
