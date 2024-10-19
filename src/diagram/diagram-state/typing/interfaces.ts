import { ContainerID } from './types';
import { MovePanel } from '../../diagram-control-panel/panelType/move';
import { ZoomPanel } from '../../diagram-control-panel/panelType/zoom';
import { FoldPanel } from '../../diagram-control-panel/panelType/fold';
import { ServicePanel } from '../../diagram-control-panel/panelType/service';

export interface Data {
    [key: ContainerID]: {
        dx: number;
        dy: number;
        scale: number;
        nativeTouchEventsEnabled: boolean;
        panels?: {
            move: MovePanel;
            zoom: ZoomPanel;
            fold: FoldPanel;
            service: ServicePanel;
        };
        controlPanel?: HTMLElement;
    };
}
