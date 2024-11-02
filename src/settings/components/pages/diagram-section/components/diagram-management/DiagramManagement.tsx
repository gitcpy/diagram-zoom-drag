import { useSettingsContext } from '../../../../core/context';
import React, { useReducer } from 'react';
import { ButtonComponent, Platform, TextComponent } from 'obsidian';
import { UserGuide } from './modals/user-guide/user-guide';
import { EventID } from '../../../../../../events-management/typing/constants';
import DiagramPagination from './components/diagram-pagination/DiagramPagination';
import {
    preEndValidateDiagram,
    validateName,
    validateSelector,
} from './helpers/helpers';
import {
    MultiDescComponent,
    ReactObsidianSetting,
} from 'react-obsidian-setting';

const DiagramManagement: React.FC = () => {
    const { app, plugin } = useSettingsContext();
    const [_, forceReload] = useReducer((x) => x + 1, 0);

    const handleAddDiagram = async (
        nameInput: HTMLInputElement,
        selectorInput: HTMLInputElement
    ) => {
        if (
            !preEndValidateDiagram(
                plugin,
                nameInput,
                selectorInput,
                plugin.settings.supported_diagrams
            )
        ) {
            return;
        }

        plugin.settings.supported_diagrams.push({
            name: nameInput.value,
            selector: selectorInput.value,
            on: true,
            panels: {
                move: {
                    on: true,
                },
                zoom: {
                    on: true,
                },
                service: {
                    on: true,
                },
            },
        });
        await plugin.settingsManager.saveSettings();
        plugin.showNotice('New diagram was added');
        forceReload();
    };

    return (
        <>
            <ReactObsidianSetting
                name={'Add new diagram'}
                setHeading={true}
                noBorder={true}
                desc="Here you can configure which diagrams will receive enhanced controls and UI."
                addMultiDesc={(multiDesc: MultiDescComponent) => {
                    multiDesc.addDescriptions([
                        'Adding a Diagram Type:',
                        '1. Enter a unique name using only Latin letters, numbers and `-` (A-Z, a-z, 0-9, -)',
                        '2. Specify a valid CSS selector for your diagram',

                        'Once added, matching diagrams will get:',
                        '• Mouse and keyboard navigation',
                        '• Additional control buttons',

                        'Note: Red border indicates invalid input - hover to see details',
                    ]);
                    return multiDesc;
                }}
            />
            <ReactObsidianSetting
                addTexts={[
                    (name): TextComponent => {
                        name.inputEl.id = 'diagram-name';
                        name.setPlaceholder('Example Diagram');
                        name.onChange((text) => {
                            name.setValue(text);
                            validateName(plugin, name.inputEl);
                        });
                        return name;
                    },
                    (selectorInput) => {
                        selectorInput.inputEl.id = 'diagram-selector';
                        selectorInput.setPlaceholder('.example-diagram');
                        selectorInput.onChange((text) => {
                            selectorInput.setValue(text);
                            validateSelector(plugin, selectorInput.inputEl);
                        });
                        return selectorInput;
                    },
                ]}
                addButtons={[
                    (button): ButtonComponent => {
                        button.setIcon('save');
                        button.setTooltip('Add this diagram');
                        button.onClick(async () => {
                            const nameInput: HTMLInputElement | null =
                                document.querySelector('#diagram-name');
                            const selectorInput: HTMLInputElement | null =
                                document.querySelector('#diagram-selector');
                            if (!nameInput || !selectorInput) {
                                return;
                            }

                            await handleAddDiagram(nameInput, selectorInput);
                        });
                        return button;
                    },
                ]}
                addExtraButtons={[
                    Platform.isDesktopApp &&
                        ((extra) => {
                            extra.setIcon('info');
                            extra.setTooltip(
                                'Click for more information on how the plugin works and' +
                                    ' how you can find diagram selectors'
                            );
                            extra.onClick(() => {
                                new UserGuide(app, plugin).open();
                            });
                            return extra;
                        }),
                ]}
            />

            <ReactObsidianSetting name="Available diagrams" setHeading />

            <ReactObsidianSetting
                name="Diagrams per page"
                addSliders={[
                    (slider) => {
                        slider.setValue(plugin.settings.diagramsPerPage);
                        slider.setDynamicTooltip();
                        slider.setLimits(1, 50, 1);
                        slider.onChange(async (value) => {
                            plugin.settings.diagramsPerPage = value;
                            await plugin.settingsManager.saveSettings();
                            plugin.publisher.publish({
                                emitter: app.workspace,
                                eventID: EventID.ItemsPerPageChanged,
                                timestamp: new Date(),
                            });
                        });
                        return slider;
                    },
                ]}
            />
            <DiagramPagination />
        </>
    );
};

export default DiagramManagement;
