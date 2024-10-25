import { useSettingsContext } from '../../core/context';
import React, { useReducer } from 'react';
import SettingsContainer from '../../styled/container';
import { h } from 'preact';
import { ReactObsidianSetting } from '../../react-obsidian-setting/ObsidianSettingReact';
import { Platform } from 'obsidian';
import { UserGuideModal } from '../../../modals/user-guide-modal';
import { EventID } from '../../../../events-management/typing/constants';
import DiagramPagination from './diagram-pagination/DiagramPagination';
import {
    preEndValidateDiagram,
    validateName,
    validateSelector,
} from '../../helpers/helpers';
import { MultiDescComponent } from '../../react-obsidian-setting/MultiDescComponent';

const DiagramManagement: React.FC = () => {
    const { app, plugin, ref } = useSettingsContext();
    const [updated, forceUpdate] = useReducer((x) => x + 1, 0);
    const diagramR = new RegExp(/^[A-Za-z0-9]+$/);
    const selectorR = new RegExp(/^\.[A-Za-z][\w-]+$/);

    const handleAddDiagram = async (
        nameInput: HTMLInputElement,
        selectorInput: HTMLInputElement
    ) => {
        debugger;
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
        });
        await plugin.settingsManager.saveSettings();
        plugin.showNotice('New diagram was added');
        forceUpdate();
    };

    return (
        <SettingsContainer>
            <ReactObsidianSetting name="Add new diagram" setHeading />

            <ReactObsidianSetting
                addMultiDesc={(multiDesc: MultiDescComponent) => {
                    multiDesc.addDescriptions([
                        'Add a new diagram so the plugin can serve it.',
                        'Rules:',
                        '- The name must be unique and contain only letters from the Latin alphabet and digits (A-Z, a-z, 0-9).',
                        '- You can find examples of valid diagram names and selectors in the diagrams section below.',
                        '- The selector must be a valid CSS class selector, starting with a dot (.).',
                        '- You can edit the name and selector, but they must remain unique and comply with the top requirements.',
                        '- If you input an invalid value for the name or selector, the input field will display a red border and show a tooltip.' +
                            ' You can hover over the input to see what went wrong.',
                    ]);
                    return multiDesc;
                }}
            />
            <ReactObsidianSetting
                addTexts={[
                    (name) => {
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
                    (button) => {
                        button.setIcon('save');
                        button.onClick(async () => {
                            const nameInput = document.querySelector(
                                '#diagram-name'
                            ) as HTMLInputElement;
                            const selectorInput = document.querySelector(
                                '#diagram-selector'
                            ) as HTMLInputElement;
                            if (!nameInput || !selectorInput) {
                                return;
                            }

                            await handleAddDiagram(nameInput, selectorInput);
                        });
                        return button;
                    },
                ]}
                addExtraButtons={
                    Platform.isDesktopApp
                        ? [
                              (extra) => {
                                  extra.setIcon('info');
                                  extra.setTooltip(
                                      'Click for tips on finding diagram selectors.'
                                  );
                                  extra.onClick(() => {
                                      new UserGuideModal(app, plugin).open();
                                  });
                                  return extra;
                              },
                          ]
                        : undefined
                }
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
        </SettingsContainer>
    );
};

export default DiagramManagement;
