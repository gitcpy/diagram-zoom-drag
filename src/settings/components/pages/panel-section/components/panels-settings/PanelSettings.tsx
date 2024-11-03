import React from 'react';
import { useSettingsContext } from '../../../../core/context';
import { Platform, ToggleComponent } from 'obsidian';
import { ReactObsidianSetting } from 'react-obsidian-setting';

/**
 * PanelSettings component provides a user interface for configuring panel-related settings
 * in the application. It allows users to customize panel behavior, specifically in relation
 * to mouse interactions and visibility options.
 *
 * This component is applicable only for the desktop platform and offers the following settings:
 * - Toggle to hide panels when the mouse exits the diagram area.
 * - Option to add a hiding button to the service panel.
 *
 * The settings are managed through the `ReactObsidianSetting` component, which handles
 * the rendering of toggle switches and updates the plugin configuration asynchronously
 * upon user interaction.
 *
 * @returns A React fragment containing the settings UI components.
 */
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
