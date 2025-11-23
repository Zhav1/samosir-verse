export interface Node {
    id: string;
    name: string;
    panorama_url: string;
    thumbnail_url: string;
    default_yaw: number;
    default_pitch: number;
    links: {
        nodeId: string;
        gps?: [number, number];
    }[];
}

export interface Landmark {
    id: string;
    node_id: string;
    category: 'folklore' | 'music' | 'food' | 'history' | 'nature';
    title: string;
    coordinates: {
        yaw: number;
        pitch: number;
    };
    lore_context: string;
    image_asset?: string;
    display_mode?: 'panorama' | 'static-image';
    position_3d?: {
        x: number;
        y: number;
        z: number;
    };
    marker_config?: {
        image?: string;
        is_for_sale?: boolean;
        price?: number;
    };
}
