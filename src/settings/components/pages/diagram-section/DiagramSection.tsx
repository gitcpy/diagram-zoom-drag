import React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import DiagramsSettings from './components/diagram-settings/DiagramSettings';
import DiagramManagement from './components/diagram-management/DiagramManagement';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { ButtonComponent } from 'obsidian';

const DiagramSection: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

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
                            button.setTooltip('Settings');
                            button.onClick(() => {
                                navigate('/diagram-section/settings');
                            });
                            if (
                                location.pathname === '/diagram-section' ||
                                location.pathname ===
                                    '/diagram-section/settings'
                            ) {
                                button.setClass('button-active');
                            }
                            return button;
                        },
                        (button): ButtonComponent => {
                            button.setIcon('folder-plus');
                            button.setTooltip('Diagram Management');
                            button.onClick(() => {
                                navigate('/diagram-section/management');
                            });
                            if (
                                location.pathname ===
                                '/diagram-section/management'
                            ) {
                                button.setClass('button-active');
                            }
                            return button;
                        },
                    ]}
                />
            </div>

            <Routes>
                <Route index element={<DiagramsSettings />} />
                <Route path="settings" element={<DiagramsSettings />} />
                <Route path="management" element={<DiagramManagement />} />
            </Routes>
        </div>
    );
};
export default DiagramSection;
