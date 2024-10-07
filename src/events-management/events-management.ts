import { EventRef, Events } from 'obsidian';
import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';

import { EventID } from './typing/constants';
import { MermaidZoomDragEvent } from './typing/interface';

/**
 * Abstract class representing a Publisher.
 */
abstract class Publisher {
    constructor(public plugin: DiagramZoomDragPlugin) {}

    /**
     * Abstract method to publish an OpenAPI event.
     * @param event - The OpenAPIRendererEvent object to publish.
     * @typeparam T - The specific type of OpenAPIRendererEvent being published.
     */
    abstract publish<T extends MermaidZoomDragEvent>(
        event: MermaidZoomDragEvent
    ): void;
}

/**
 * Publisher for OpenAPI Renderer events.
 */
export class EventPublisher extends Publisher {
    constructor(plugin: DiagramZoomDragPlugin) {
        super(plugin);
    }

    /**
     * Publishes an OpenAPI Renderer event.
     * @param event - The OpenAPIRendererEvent object.
     */
    public publish(event: MermaidZoomDragEvent): void {
        event.emitter.trigger(event.eventID, event);
    }
}

/**
 * Abstract class representing an Observer.
 */
abstract class Observer {
    protected constructor(public plugin: DiagramZoomDragPlugin) {}

    /**
     * Abstract method to subscribe to an OpenAPI event.
     * @param emitter - The event emitter object.
     * @param eventID - The ID of the event to subscribe to.
     * @param handler - The asynchronous callback function to handle the event.
     * @typeparam T - The type of OpenAPIRendererEvent being subscribed to.
     */
    abstract subscribe<T extends MermaidZoomDragEvent>(
        emitter: Events,
        eventID: EventID,
        handler: (event: T) => Promise<void>
    ): void;
}

/**
 * Observer for handling OpenAPI Renderer events.
 */
export class EventObserver extends Observer {
    constructor(plugin: DiagramZoomDragPlugin) {
        super(plugin);
    }

    /**
     * Subscribes to an OpenAPI event.
     * @param emitter - The event emitter object.
     * @param eventID - The ID of the event to subscribe to.
     * @param handler - The asynchronous callback function to handle the event.
     * @typeparam T - The specific type of OpenAPIRendererEvent being subscribed to.
     */
    subscribe<T extends MermaidZoomDragEvent>(
        emitter: Events,
        eventID: EventID,
        handler: (event: T) => Promise<void>
    ): void {
        const eventRef = emitter.on(
            eventID,
            async (event: MermaidZoomDragEvent) => await handler(event as T)
        );
    }
}
