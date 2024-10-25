import React, { useEffect, useReducer, useState } from 'react';
import { useSettingsContext } from '../../core/context';
import { Notice, Platform, Setting } from 'obsidian';
import SettingsContainer from '../../styled/container';
import { ReactObsidianSetting } from '../../react-obsidian-setting/ObsidianSettingReact';

const General: React.FC = () => {
    const { app, plugin } = useSettingsContext();
    const [settingsUpdated, setSettingsUpdated] = useState(0);

    const forceUpdate = () => setSettingsUpdated((prev) => prev + 1);

    return (
        <>
            <ReactObsidianSetting
                addButtons={[
                    (button) => {
                        button.setIcon('rotate-ccw');
                        button.setTooltip('Reset settings to default');
                        button.onClick(async (cb) => {
                            await plugin.settingsManager.resetSettings();
                            forceUpdate();
                            new Notice('Settings have been reset to default.');
                        });
                        return button;
                    },
                ]}
            />

            <ReactObsidianSetting
                name="Fold diagrams by default?"
                addToggles={[
                    (toggle) => {
                        toggle
                            .setValue(plugin.settings.foldingByDefault)
                            .onChange(async (value: boolean) => {
                                plugin.settings.foldingByDefault = value;
                                await plugin.settingsManager.saveSettings();
                            });
                        return toggle;
                    },
                ]}
            />

            <ReactObsidianSetting
                name="Automatically fold diagrams on focus change?"
                addToggles={[
                    (toggle) => {
                        toggle
                            .setValue(
                                plugin.settings.automaticFoldingOnFocusChange
                            )
                            .onChange(async (value: boolean) => {
                                plugin.settings.automaticFoldingOnFocusChange =
                                    value;
                                await plugin.settingsManager.saveSettings();
                            });
                        return toggle;
                    },
                ]}
            />

            {Platform.isDesktopApp && (
                <>
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

export default General;
