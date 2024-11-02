import React from 'react';
import { ButtonComponent, Notice } from 'obsidian';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { useSettingsContext } from '../../../core/context';
import { useLocation } from 'react-router-dom';

const ResetSettings: React.FC = () => {
    const { plugin, forceReload, setCurrentPath } = useSettingsContext();

    const location = useLocation();

    return (
        <ReactObsidianSetting
            addButtons={[
                (button): ButtonComponent => {
                    button.setIcon('rotate-ccw');
                    button.setTooltip('Reset settings to default');
                    button.onClick(async () => {
                        setCurrentPath(location.pathname);
                        await plugin.settingsManager.resetSettings();
                        forceReload();
                        plugin.updateCssProperties();
                        new Notice('Settings have been reset to default.');
                    });
                    return button;
                },
            ]}
        />
    );
};

export default ResetSettings;
