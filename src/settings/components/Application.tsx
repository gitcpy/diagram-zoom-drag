import React from 'react';

import { App } from 'obsidian';
import { SettingProvider } from './core/context';
import DiagramZoomDragPlugin from '../../core/diagram-zoom-drag-plugin';
import SettingsPage from './settings-page/SettingsPage';

const Application: React.FC<{
    app: App;
    plugin: DiagramZoomDragPlugin;
}> = ({ app, plugin }) => (
    <SettingProvider app={app} plugin={plugin}>
        <SettingsPage />
    </SettingProvider>
);

export default Application;
