import { MemoryRouter, Route, Routes } from 'react-router-dom';
import React from 'react';
import { useSettingsContext } from '../core/context';
import About from '../pages/about/About';
import DiagramSection from '../pages/diagram-section/DiagramSection';
import PanelSection from '../pages/panel-section/PanelSection';
import Toolbar from './toolbar/Toolbar';

const SettingsPage: React.FC = () => {
    const { reloadCount, currentPath } = useSettingsContext();
    return (
        <MemoryRouter initialEntries={[currentPath]} key={reloadCount}>
            <Toolbar />
            <Routes>
                <Route path="/diagram-section/*" element={<DiagramSection />} />
                <Route path="/panel-section/*" element={<PanelSection />} />
                <Route path={'/about'} element={<About />} />
            </Routes>
        </MemoryRouter>
    );
};
export default SettingsPage;
