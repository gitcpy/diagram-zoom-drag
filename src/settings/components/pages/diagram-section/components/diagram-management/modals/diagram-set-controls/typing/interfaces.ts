export interface PanelsState {
    [key: string]: {
        on: boolean;
    };
}

export interface Result {
    panel: string;
    on: boolean;
}
