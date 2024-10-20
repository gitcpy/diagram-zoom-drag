import { App, Notice, Platform, PluginSettingTab, Setting } from 'obsidian';
import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { UserGuideModal } from './modals/user-guide-modal';
import { DiagramSettingsManager } from './utils/diagramPagination';
import { EventID } from '../events-management/typing/constants';

export class SettingsTab extends PluginSettingTab {
    constructor(
        public app: App,
        public plugin: DiagramZoomDragPlugin
    ) {
        super(app, plugin);
        this.containerEl.addClass('diagram-zoom-drag-settings');
    }

    async display(): Promise<any> {
        const { containerEl } = this;

        new Setting(containerEl).addButton((button) => {
            button.setIcon('rotate-ccw');
            button.setTooltip('Reset settings to default');
            button.onClick(async (cb) => {
                await this.plugin.settingsManager.resetSettings();
                this.containerEl.empty();
                await this.display();
                new Notice('Settings have been reset to default.');
            });
        });

        new Setting(containerEl).setHeading().setName('Diagram settings');

        new Setting(containerEl)
            .setName('Fold diagrams by default?')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.foldingByDefault)
                    .onChange(async (value: boolean) => {
                        this.plugin.settings.foldingByDefault = value;
                        await this.plugin.settingsManager.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName('Automatically fold diagrams on focus change?')
            .addToggle((toggle) => {
                toggle
                    .setValue(
                        this.plugin.settings.automaticFoldingOnFocusChange
                    )
                    .onChange(async (value: boolean) => {
                        this.plugin.settings.automaticFoldingOnFocusChange =
                            value;
                        await this.plugin.settingsManager.saveSettings();
                    });
            });

        if (Platform.isDesktopApp) {
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
        }

        new Setting(containerEl).setHeading().setName('Diagram management');

        const addDiagram = new Setting(containerEl);
        const diagramR = new RegExp(/^[A-Za-z0-9]+$/);
        const selectorR = new RegExp(/^\.[A-Za-z][\w-]+$/);

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
                        name.inputEl.toggleClass('invalid', !dTest);
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
                        input.inputEl.toggleClass('invalid', !sTest);
                        input.inputEl.ariaLabel = !sTest
                            ? 'Input incorrect. Should be a dot in the beginning, then next character only `A-Za-z` ant then only `A-Za-z0-9-` after it'
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
                        this.plugin.showNotice('Input is not valid!');

                        nameInput.addClass('snake');
                        selectorInput.addClass('snake');

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
                        new Notice('This diagram already exists!');
                        nameInput.addClass('shake');
                        selectorInput.addClass('shake');

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
                    this.containerEl.empty();
                    await this.display();
                    this.plugin.showNotice('New diagram was added');
                });
            });

        if (Platform.isDesktopApp) {
            addDiagram.addExtraButton((extra) => {
                extra.setIcon('info');
                extra.setTooltip(
                    'Click for tips on finding diagram selectors.'
                );
                extra.onClick(() => {
                    new UserGuideModal(this.app, this.plugin).open();
                });
            });
        }

        new Setting(containerEl).setName('Supported diagrams').setHeading();

        new Setting(containerEl)
            .setName('Diagrams per page')
            .addSlider((slider) => {
                slider.setValue(this.plugin.settings.diagramsPerPage);
                slider.setDynamicTooltip();
                slider.setLimits(1, 50, 1);
                slider.onChange(async (value) => {
                    this.plugin.settings.diagramsPerPage = value;
                    await this.plugin.settingsManager.saveSettings();
                    this.plugin.publisher.publish({
                        emitter: this.app.workspace,
                        eventID: EventID.ItemsPerPageChanged,
                        timestamp: new Date(),
                    });
                });
            });

        await new DiagramSettingsManager(
            this.plugin,
            containerEl.createEl('div')
        ).render();
    }

    hide(): void {
        this.containerEl.empty();
    }
}
