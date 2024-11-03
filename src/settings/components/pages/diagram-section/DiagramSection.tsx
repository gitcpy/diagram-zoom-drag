import React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import DiagramsSettings from './components/diagram-settings/DiagramSettings';
import DiagramManagement from './components/diagram-management/DiagramManagement';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { ButtonComponent } from 'obsidian';

/**
 * DiagramSection component renders a section with navigation and routing for diagram settings and management.
 *
 * It includes two navigation buttons, "Settings" and "Diagram Management", which navigate to their respective routes.
 * The active button is visually distinguished based on the current route.
 * This component uses React Router's `Route` and `Routes` to render the `DiagramsSettings` and `DiagramManagement` components
 * based on the selected route.
 *
 * @returns A React element containing the navigation and routed content for diagram settings and management.
 */
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
