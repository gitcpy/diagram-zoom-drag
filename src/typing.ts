export type LeafID = string;

export type ContainerID = string;

export interface Data {
    [key: ContainerID]: {
        dx: number;
        dy: number;
        scale: number;
        nativeTouchEventsEnabled: boolean;
    };
}
