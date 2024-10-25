import { Events } from 'obsidian';
import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';

import { EventID } from './typing/constants';
import { DiagramZoomDragEvent } from './typing/interface';

/**
 * Abstract class representing a Publisher.
 */
abstract class Publisher {
    constructor(public plugin: DiagramZoomDragPlugin) {}

    /**
     * Abstract method to publish an DiagramZoomDrag event.
     * @param event - The DiagramZoomDragEvent object to publish.
     * @typeparam T - The specific type of DiagramZoomDragEvent being published.
     */
    abstract publish<T extends DiagramZoomDragEvent>(
        event: DiagramZoomDragEvent
    ): void;
}

/**
 * Publisher for DiagramZoomDrag eventHandlers.
 */
export class EventPublisher extends Publisher {
    constructor(plugin: DiagramZoomDragPlugin) {
        super(plugin);
    }

    /**
     * Publishes an DiagramZoomDrag event.
     * @param event - the DiagramZoomDragEvent object.
     */
    public publish(event: DiagramZoomDragEvent): void {
        event.emitter.trigger(event.eventID, event);
    }
}

/**
 * Abstract class representing an Observer.
 */
abstract class Observer {
    protected constructor(public plugin: DiagramZoomDragPlugin) {}

    /**
     * Abstract method to subscribe to an DiagramZoomDrag event.
     * @param emitter - The event emitter object.
     * @param eventID - The ID of the event to subscribe to.
     * @param handler - The asynchronous callback function to handle the event.
     * @typeparam T - The type of DiagramZoomDragEvent being subscribed to.
     */
    abstract subscribe<T extends DiagramZoomDragEvent>(
        emitter: Events,
        eventID: EventID,
        handler: (event: T) => Promise<void>
    ): void;
}

/**
 * Observer for handling DiagramZoomDrag eventHandlers.
 */
export class EventObserver extends Observer {
    constructor(plugin: DiagramZoomDragPlugin) {
        super(plugin);
    }

    /**
     * Subscribes to an DiagramZoomDrag event.
     * @param emitter - The event emitter object.
     * @param eventID - The ID of the event to subscribe to.
     * @param handler - The asynchronous callback function to handle the event.
     * @typeparam T - The specific type of DiagramZoomDragEvent being subscribed to.
     */
    subscribe<T extends DiagramZoomDragEvent>(
        emitter: Events,
        eventID: EventID,
        handler: (event: T) => Promise<void>
    ): void {
        const eventRef = emitter.on(eventID, async (...data: unknown[]) => {
            const event = data[0] as DiagramZoomDragEvent;
            await handler(event as T);
            return eventRef;
        });
    }

    unsubscribe(emitter: Events, eventID: EventID, handler: () => void): void {
        emitter.off(eventID, handler);
    }
}
