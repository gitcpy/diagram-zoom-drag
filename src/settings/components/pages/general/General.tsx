import React from 'react';
import { useSettingsContext } from '../../core/context';

const General: React.FC = () => {
    const { app, plugin } = useSettingsContext();
    return <div></div>;
};

export default General;
