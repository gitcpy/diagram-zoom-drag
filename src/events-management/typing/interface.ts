import { EventID } from './constants';
import { Events } from 'obsidian';

export interface MermaidZoomDragEvent {
    eventID: EventID;
    timestamp: Date;
    emitter: Events;
}

export interface PanelsChangedVisibility extends MermaidZoomDragEvent {
    data: {
        visible: boolean;
    };
}
