import React, { useReducer, useState } from 'react';
import { Notice } from 'obsidian';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { useSettingsContext } from '../../core/context';
import { useLocation, useNavigate } from 'react-router-dom';

const ResetSettings: React.FC = () => {
    const { plugin, forceReload, setCurrentPath } = useSettingsContext();

    const location = useLocation();

    return (
        <ReactObsidianSetting
            addButtons={[
                (button) => {
                    button.setIcon('rotate-ccw');
                    button.setTooltip('Reset settings to default');
                    button.onClick(async (cb) => {
                        setCurrentPath(location.pathname);
                        await plugin.settingsManager.resetSettings();
                        forceReload();
                        new Notice('Settings have been reset to default.');
                    });
                    return button;
                },
            ]}
        />
    );
};

export default ResetSettings;
