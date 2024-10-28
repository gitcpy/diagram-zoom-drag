import { MemoryRouter, Route, Routes } from 'react-router-dom';
import React from 'react';
import Navbar from '../navbar/Navbar';
import General from '../pages/general/General';
import ResetSettings from './reset-settings/ResetSettings';
import { useSettingsContext } from '../core/context';
import About from '../pages/about/About';
import DiagramSection from '../pages/diagram-section/DiagramSection';
import PanelSection from '../pages/panel-section/PanelSection';
import { Platform } from 'obsidian';

const SettingsPage: React.FC = () => {
    const { reloadCount, currentPath } = useSettingsContext();
    return (
        <MemoryRouter initialEntries={[currentPath]} key={reloadCount}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    width: '100%',
                    ...(Platform.isMobileApp
                        ? {
                              flexDirection: 'column',
                              gap: '16px',
                          }
                        : {}),
                }}
            >
                <Navbar />
                <div
                    style={{
                        ...(Platform.isMobileApp
                            ? {
                                  position: 'static',
                                  marginTop: '16px',
                              }
                            : {
                                  position: 'absolute',
                                  right: 0,
                                  marginTop: '30px',
                              }),
                    }}
                >
                    <ResetSettings />
                </div>
            </div>
            <Routes>
                <Route path="/general" element={<General />} />
                <Route path={'/diagram-section'} element={<DiagramSection />} />
                <Route path="/panel-section" element={<PanelSection />} />
                <Route path={'/about'} element={<About />} />
            </Routes>
        </MemoryRouter>
    );
};
export default SettingsPage;
