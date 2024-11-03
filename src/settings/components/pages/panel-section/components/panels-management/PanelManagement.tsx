import { ReactObsidianSetting } from 'react-obsidian-setting';
import React from 'react';
import PanelLayout from './components/panel-layout/PanelLayout';

/**
 * A React component that renders the Panel Management page in the settings
 * dialog of the Diagram Zoom Drag plugin for Obsidian.
 *
 * This component is responsible for displaying the settings for customizing
 * the control panels on diagrams. It displays a heading, a description, and
 * two `ReactObsidianSetting` components for presenting the available panels
 * and instructions on how to customize them.
 *
 * The component also includes a `PanelLayout` component, which is responsible
 * for rendering the actual control panels and their associated settings.
 *
 */
const PanelManagement: React.FC = () => (
    <>
        <ReactObsidianSetting
            name="Panel configuration"
            desc="Configure the visibility and position of control panels on your diagrams"
            setHeading={true}
            noBorder={true}
        />

        <ReactObsidianSetting
            name="Available panels"
            addMultiDesc={(multiDesc) => {
                multiDesc.addDesc(
                    '• Move Panel: By default located at bottom right - Contains 8 directional buttons for diagram movement'
                );
                multiDesc.addDesc(
                    '• Zoom Panel: By default located at center right - Features zoom in/out and reset controls'
                );
                multiDesc.addDesc(
                    '• Service Panel: By default located at upper right - Contains additional functionality buttons'
                );
                return multiDesc;
            }}
            noBorder={true}
        />
        <ReactObsidianSetting
            name="How to customize panels"
            addMultiDesc={(multiDesc) => {
                multiDesc.addDesc(
                    '1. Use checkboxes below to toggle panel visibility on/off'
                );
                multiDesc.addDesc(
                    '2. Click and drag any panel to reposition it on the diagram'
                );
                multiDesc.addDesc('3. Panel positions are saved automatically');
                multiDesc.addDesc(
                    '4. Reload the view to see your changes take effect'
                );
                return multiDesc;
            }}
            noBorder={true}
        />

        <PanelLayout />
    </>
);

export default PanelManagement;
