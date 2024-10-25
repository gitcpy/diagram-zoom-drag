import React from 'react';
import Navbar from '../navbar/Navbar';
import { useSettingsContext } from '../core/context';
import General from '../pages/general/General';
import DiagramManagement from '../pages/diagram-management/DiagramManagement';

const SettingsPage: React.FC = () => {
    const { currentTab } = useSettingsContext();

    const renderContent = () => {
        switch (currentTab) {
            case 'general':
                return <General />;
            case 'diagram-management':
                return <DiagramManagement />;
        }
    };

    return (
        <>
            <Navbar />
            {renderContent()}
        </>
    );
};

export default SettingsPage;
