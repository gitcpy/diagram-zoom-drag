import React from 'react';
import { Platform } from 'obsidian';
import Navbar from './navbar/Navbar';
import ResetSettings from './reset-settings/ResetSettings';

const Toolbar: React.FC = (): React.ReactElement => {
    if (Platform.isDesktopApp) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    width: '100%',
                }}
            >
                <Navbar />
                <div
                    style={{
                        position: 'relative',
                        right: 0,
                        marginTop: '30px',
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
