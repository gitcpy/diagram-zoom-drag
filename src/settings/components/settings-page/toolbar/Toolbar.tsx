import React from 'react';
import { Platform } from 'obsidian';
import Navbar from './navbar/Navbar';
import ResetSettings from './reset-settings/ResetSettings';

/**
 * The settings page toolbar.
 *
 * On desktop, it displays the navbar in the center of the page and the reset
 * settings button on the right. On mobile, it displays the reset settings button
 * on the right and the navbar below it.
 * @returns The toolbar element.
 */
const Toolbar: React.FC = (): React.ReactElement => {
    if (Platform.isDesktopApp) {
        return (
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <div />
                <Navbar />
                <div
                    style={{
                        justifySelf: 'end',
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: '35px',
                    }}
                >
                    <ResetSettings />
                </div>
            </div>
        );
    }
    return (
        <>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '-50px',
                    marginRight: '0px',
                    padding: 0,
                    width: '100%',
                    marginBottom: 0,
                }}
            >
                <ResetSettings />
            </div>
            <Navbar />
        </>
    );
};

export default Toolbar;
