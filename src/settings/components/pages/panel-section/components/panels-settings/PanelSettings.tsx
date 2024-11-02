import React from 'react';
import { useSettingsContext } from '../../../../core/context';
import { Platform, ToggleComponent } from 'obsidian';
import { ReactObsidianSetting } from 'react-obsidian-setting';

const PanelSettings: React.FC = () => {
    const { plugin } = useSettingsContext();

    return (
        <>
            {Platform.isDesktopApp && (
                <>
                    <ReactObsidianSetting
                        name="Panels behavior"
                        desc="Configure how panels interact with mouse movement"
                        setHeading={true}
                    />

                    <ReactObsidianSetting
                        name="Hide panels when mouse leaves diagram?"
                        addToggles={[
                            (toggle): ToggleComponent => {
                                toggle.setValue(
                                    plugin.settings.hideOnMouseOutDiagram
                                );
                                toggle.onChange(async (value) => {
                                    plugin.settings.hideOnMouseOutDiagram =
                                        value;
                                    await plugin.settingsManager.saveSettings();
                                });

                                return toggle;
                            },
                        ]}
                    />

                    <ReactObsidianSetting
                        name="Hide panels when mouse leaves them?"
                        addToggles={[
                            (toggle): ToggleComponent => {
                                toggle
                                    .setValue(
                                        plugin.settings.hideOnMouseOutPanels
                                    )
                                    .onChange(async (value) => {
                                        plugin.settings.hideOnMouseOutPanels =
                                            value;
                                        await plugin.settingsManager.saveSettings();
                                    });
                                return toggle;
                            },
                        ]}
                    />

                    <ReactObsidianSetting
                        name={'Serivce panel'}
                        setHeading={true}
                    />

                    <ReactObsidianSetting
                        name={'Add a hiding button to service panel?'}
                        addToggles={[
                            (toggle): ToggleComponent => {
                                toggle.setValue(
                                    plugin.settings.addHidingButton
                                );
                                toggle.onChange(async (value) => {
                                    plugin.settings.addHidingButton = value;
                                    await plugin.settingsManager.saveSettings();
                                });

                                return toggle;
                            },
                        ]}
                    />
                </>
            )}
        </>
    );
};

export default PanelSettings;
