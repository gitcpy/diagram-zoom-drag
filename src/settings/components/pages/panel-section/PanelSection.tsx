import React from 'react';
import PanelManagement from './components/panels-management/PanelManagement';
import PanelSettings from './components/panels-settings/PanelSettings';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { ButtonComponent, Platform } from 'obsidian';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

const PanelSection: React.FC = () => {
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
                {Platform.isDesktopApp && (
                    <ReactObsidianSetting
                        addButtons={[
                            (button): ButtonComponent => {
                                button.setIcon('settings');
                                button.setTooltip('Panels Settings');
                                button.onClick(() => {
                                    navigate('/panel-section/settings');
                                });
                                if (
                                    location.pathname ===
                                        '/panel-section/settings' ||
                                    location.pathname === '/panel-section'
                                ) {
                                    button.setClass('button-active');
                                }
                                return button;
                            },

                            (button): ButtonComponent => {
                                button.setIcon('folder-plus');
                                button.setTooltip('Panels Management');
                                button.onClick(() => {
                                    navigate('/panel-section/management');
                                });
                                if (
                                    location.pathname ===
                                    '/panel-section/management'
                                ) {
                                    button.setClass('button-active');
                                }
                                return button;
                            },
                        ]}
                    />
                )}
            </div>

            <Routes>
                <Route
                    index
                    element={
                        Platform.isDesktopApp ? (
                            <PanelSettings />
                        ) : (
                            <PanelManagement />
                        )
                    }
                />
                <Route path={'settings'} element={<PanelSettings />} />
                <Route path={'management'} element={<PanelManagement />} />
            </Routes>
        </div>
    );
};
export default PanelSection;
