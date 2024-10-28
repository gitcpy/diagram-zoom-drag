import React from 'react';
import { useSettingsContext } from '../../../../core/context';
import { Platform } from 'obsidian';
import { ReactObsidianSetting } from 'react-obsidian-setting';

const PanelSettings: React.FC = () => {
    const { app, plugin } = useSettingsContext();

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
                            (toggle) => {
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
                            (toggle) => {
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
                </>
            )}
        </>
    );
};

export default PanelSettings;
