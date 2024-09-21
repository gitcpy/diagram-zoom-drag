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

export enum SupportedDiagrams {
    Mermaid = '.mermaid',
    Mehrmaid = '.block-language-mehrmaid',
    PlantUML = '.block-language-plantuml',
    Graphviz = '.block-language-dot',
}
