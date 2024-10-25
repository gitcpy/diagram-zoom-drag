import React from 'react';
import { useSettingsContext } from '../core/context';
import { NavbarContainer, NavbarTab, NavbarTabs } from './styled';

const Navbar: React.FC = () => {
    const { currentTab, setCurrentTab } = useSettingsContext();

    return (
        <NavbarContainer>
            <NavbarTabs>
                <NavbarTab
                    className={currentTab === 'general' ? 'active' : ''}
                    onClick={() => setCurrentTab('general')}
                >
                    General
                </NavbarTab>
                <NavbarTab
                    className={
                        currentTab === 'diagram-management' ? 'active' : ''
                    }
                    onClick={() => setCurrentTab('diagram-management')}
                >
                    Diagram management
                </NavbarTab>
            </NavbarTabs>
        </NavbarContainer>
    );
};

export default Navbar;
