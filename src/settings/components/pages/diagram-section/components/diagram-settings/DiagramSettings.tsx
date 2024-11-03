import React from 'react';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { useSettingsContext } from '../../../../core/context';
import DiagramSize from './components/diagram-size/diagram-size';
import { ToggleComponent } from 'obsidian';

/**
 * A React component that renders a settings page for diagrams.
 *
 * This component uses `ReactObsidianSetting` to create toggles for collapsing
 * diagrams by default and for automatically collapsing diagrams on focus change.
 *
 * It also renders a component for setting the size of the diagram.
 *
 * @returns A React element for the settings page.
 */
const DiagramsSettings: React.FC = (): React.ReactElement => {
    const { plugin } = useSettingsContext();

    return (
        <>
            <ReactObsidianSetting name={'Collapse'} setHeading={true} />

            <ReactObsidianSetting
                name="Collapse diagrams by default?"
                addToggles={[
                    (toggle): ToggleComponent => {
                        toggle
                            .setValue(plugin.settings.collapseByDefault)
                            .onChange(async (value: boolean) => {
                                plugin.settings.collapseByDefault = value;
                                await plugin.settingsManager.saveSettings();
                            });
                        return toggle;
                    },
                ]}
            />

            <ReactObsidianSetting
                name="Automatically collapse diagrams on focus change?"
                addToggles={[
                    (toggle): ToggleComponent => {
                        toggle
                            .setValue(
                                plugin.settings.automaticCollapsingOnFocusChange
                            )
                            .onChange(async (value: boolean) => {
                                plugin.settings.automaticCollapsingOnFocusChange =
                                    value;
                                await plugin.settingsManager.saveSettings();
                            });
                        return toggle;
                    },
                ]}
            />
            <DiagramSize />
        </>
    );
};

export default DiagramsSettings;
