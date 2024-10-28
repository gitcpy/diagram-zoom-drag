import React, { useState } from 'react';
import PanelManagement from './components/panels-management/PanelManagement';
import PanelSettings from './components/panels-settings/PanelSettings';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { ButtonComponent } from 'obsidian';

const PanelSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'settings' | 'management'>(
        'settings'
    );

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--color-base-30)',
                    marginTop: '20px',
                }}
            >
                <ReactObsidianSetting
                    addButtons={[
                        (button): ButtonComponent => {
                            button.setIcon('settings');
                            button.setTooltip('Panels Settings');
                            button.onClick(() => {
                                setActiveTab('settings');
                            });
                            if (activeTab === 'settings') {
                                button.setClass('button-active');
                            }
                            return button;
                        },
                        (button) => {
                            button.setIcon('folder-plus');
                            button.setTooltip('Panels Management');
                            button.onClick(() => {
                                setActiveTab('management');
                            });
                            if (activeTab === 'management') {
                                button.setClass('button-active');
                            }
                            return button;
                        },
                    ]}
                />
            </div>

            {activeTab === 'settings' && <PanelSettings />}
            {activeTab === 'management' && <PanelManagement />}
        </div>
    );
};
export default PanelSection;
