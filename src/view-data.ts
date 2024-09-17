import MermaidZoomDragPlugin from './main';
import { ContainerID, Data, LeafID } from './typing';

export class ViewData {
    data: Map<LeafID, Data> = new Map();

    constructor(public plugin: MermaidZoomDragPlugin) {
        Object.defineProperties(this.plugin, {
            dx: {
                get: () => this.dx,
                set: (value) => {
                    this.dx = value;
                },
            },
            dy: {
                get: () => this.dy,
                set: (value) => {
                    this.dy = value;
                },
            },
            scale: {
                get: () => this.scale,
                set: (value) => {
                    this.scale = value;
                },
            },
            nativeTouchEventsEnabled: {
                get: () => this.nativeTouchEventsEnabled,
                set: (value) => {
                    this.nativeTouchEventsEnabled = value;
                },
            },
        });
    }

    initializeView(leafID: LeafID, containerID: ContainerID): void {
        if (!this.data.get(leafID)) {
            this.data.set(leafID, {});
        }
        const viewData = this.data.get(leafID);
        if (viewData) {
            viewData[containerID] = {
                dx: 0,
                dy: 0,
                scale: 1,
                nativeTouchEventsEnabled: true,
            };
        }
    }

    getData<K extends keyof Data[ContainerID]>(
        field: K
    ): Data[ContainerID][K] | undefined {
        const activeContainer = this.plugin.activeContainer;
        const data = this.data.get(this.plugin.leafID!);
        if (data?.[activeContainer.id]) {
            return data[activeContainer.id][field];
        }
    }
    setData<K extends keyof Data[ContainerID]>(
        field: K,
        value: Data[ContainerID][K]
    ): void {
        const activeContainer = this.plugin.activeContainer;
        const viewData = this.data.get(this.plugin.leafID!);
        if (viewData?.[activeContainer.id]) {
            viewData[activeContainer.id][field] = value;
        }
    }

    removeData(field: LeafID): void {
        this.data.delete(field);
    }

    get dx(): number {
        return this.getData('dx') ?? 0;
    }

    set dx(value: number) {
        this.setData('dx', value);
    }

    get dy(): number {
        return this.getData('dy') ?? 0;
    }

    set dy(value: number) {
        this.setData('dy', value);
    }

    get scale(): number {
        return this.getData('scale') ?? 1;
    }

    set scale(value: number) {
        this.setData('scale', value);
    }

    get nativeTouchEventsEnabled(): boolean {
        return this.getData('nativeTouchEventsEnabled') ?? true;
    }

    set nativeTouchEventsEnabled(value: boolean) {
        this.setData('nativeTouchEventsEnabled', value);
    }
}
