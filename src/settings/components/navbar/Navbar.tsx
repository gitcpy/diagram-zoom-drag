import { NavLink } from 'react-router-dom';
import React from 'react';
import { NavbarContainer, NavbarTab, NavbarTabs } from './styled';

const Navbar: React.FC = () => {
    return (
        <NavbarContainer>
            <NavbarTabs>
                <NavbarTab as={NavLink} to={'/diagram-section'}>
                    Diagram
                </NavbarTab>
                <NavbarTab as={NavLink} to={'/panel-section'}>
                    Panel
                </NavbarTab>
                <NavbarTab as={NavLink} to={'/about'}>
                    About
                </NavbarTab>
            </NavbarTabs>
        </NavbarContainer>
    );
};

export default Navbar;
