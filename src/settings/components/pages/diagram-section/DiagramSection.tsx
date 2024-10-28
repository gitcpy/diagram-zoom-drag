import React, { useState } from 'react';
import DiagramsSettings from './components/diagram-settings/DiagramSettings';
import DiagramManagement from './components/diagram-management/DiagramManagement';
import { ReactObsidianSetting } from 'react-obsidian-setting';

const DiagramSection: React.FC = () => {
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
                        (button) => {
                            button.setIcon('settings');
                            button.setTooltip('Settings');
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
                            button.setTooltip('Diagram Management');
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

            {activeTab === 'settings' && <DiagramsSettings />}
            {activeTab === 'management' && <DiagramManagement />}
        </div>
    );
};
export default DiagramSection;
