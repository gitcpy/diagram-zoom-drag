import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { EventID } from '../events-management/typing/constants';
import { PanelsChangedVisibility } from '../events-management/typing/interface';
import { setIcon } from 'obsidian';

export function publishPanelsStateEvent(
    plugin: DiagramZoomDragPlugin,
    visible: boolean
): void {
    plugin.publisher.publish({
        eventID: EventID.PanelsChangedVisibility,
        timestamp: new Date(),
        emitter: plugin.app.workspace,
        data: {
            visible: visible,
        },
    } as PanelsChangedVisibility);
}

/**
 * Updates an HTML button element with a given icon and/or title
 * @param button the HTML button element to update
 * @param icon the icon to set on the button (optional)
 * @param title the title to set on the button (optional)
 * @returns void
 */
export function updateButton(
    button: HTMLElement,
    icon?: string,
    title?: string
): void {
    if (icon) {
        setIcon(button, icon);
    }
    if (title) {
        button.ariaLabel = title;
    }
}
