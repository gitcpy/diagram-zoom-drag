import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { EventID } from '../events-management/typing/constants';
import { PanelsChangedVisibility } from '../events-management/typing/interface';

export function publishPanelsStateEvent(
    plugin: DiagramZoomDragPlugin,
    visible: boolean
) {
    plugin.publisher.publish({
        eventID: EventID.PanelsChangedVisibility,
        timestamp: new Date(),
        emitter: plugin.app.workspace,
        data: {
            visible: visible,
        },
    } as PanelsChangedVisibility);
}
