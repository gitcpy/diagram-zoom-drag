import { NavLink } from 'react-router-dom';
import React from 'react';
import { NavbarContainer, NavbarTab, NavbarTabs } from './styled';

/**
 * A simple navigation bar component.
 *
 * This component renders a horizontal navigation bar with three
 * links: one to the diagram section, one to the panel section, and
 * one to the about page. The links are styled as tabs and are
 * responsive to the active route.
 *
 * @returns The rendered navigation bar element.
 */
const Navbar: React.FC = () => (
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

export default Navbar;
