import React, { useEffect } from 'react';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { useSettingsContext } from '../../../../core/context';

const DiagramsSettings: React.FC = () => {
    const { app, plugin, forceReload } = useSettingsContext();

    return (
        <>
            <ReactObsidianSetting name={'Folding'} setHeading={true} />

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
        </>
    );
};

export default DiagramsSettings;
