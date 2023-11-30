export type assetType = {
    x: number,
    y: number,
    size? : number
    graphicUrl: string,
    img?: HTMLImageElement,
    toBeRedrawn? :boolean,
    resized? :boolean,
    mouseOnMap? :boolean,
    sourceWidth?: number,
    sourceHeight?: number,
    currentGraphicUrl?: string,
    isVisible? : boolean,
    isDrawn? : boolean

}

export type characterType = assetType & {
    aimedX?: number,
    aimedY?: number,
    id: string,
    active?: boolean,
}

export type mapType = assetType & {
    visibleWidth: number,
    visibleHeight: number,
    canvas: CanvasRenderingContext2D,
    rawCanvas: HTMLCanvasElement,
    assets : characterType[],
    pressedKeys: any,
    presets: mapPresets,
    mouseX :number,
    mouseY: number,
    onCanvasX: number,
    onCanvasY: number,
    borderVisible? : boolean,
    onCanvasWidth: number,
    onCanvasHeight: number,
    sourceX: number,
    sourceY: number,
    rightBorderVisible? : boolean,
    bottomBorderVisible? : boolean,
    borderImg?: HTMLImageElement,
    borderImgReady?: boolean,
    frameDrawing? : boolean,
    activeSide: number,
    controllFunction: Function,
    activeAssetId?: string,
    absoluteMouseX: number,
    absoluteMouseY: number
}

export function getDefaultMap(canvasContext: CanvasRenderingContext2D, canvas: HTMLCanvasElement, presets:mapPresets, externalFunction: Function){
    const returned : mapType = {

        canvas: canvasContext,
        rawCanvas: canvas,
        assets: [],
        x: 0,
        y: 0,
        sourceWidth: 0,
        sourceHeight: 0,
        visibleWidth: 0,
        visibleHeight: 0,
        graphicUrl: 'https://drive.google.com/uc?id=1ct4LpheQOGqZQo7KD5MmVl33AXlBiDuI',
        currentGraphicUrl: '',
        toBeRedrawn: true,
        presets: presets,
        mouseX :0,
        mouseY :0,
        pressedKeys: {},
        onCanvasX: 0,
        onCanvasY: 0,
        onCanvasWidth: 0,
        onCanvasHeight: 0,
        sourceX: 0,
        sourceY: 0,
        activeSide: 0,
        controllFunction: externalFunction,
        absoluteMouseX: 0,
        absoluteMouseY: 0
        
    }

    return returned;
}

export type mapPresets = {
    ASSET_SIZE : number,
    PRIMARY_SCROLL_KEY : string,
    SECONDARY_SCROLL_KEY : string,
    DISABLE_MINI_MAP_KEY : string,     
    START_MEASURE_KEY: string,
    STOP_MEASURE_KEY: string,
    MINI_MAP_HEIGHT_PERCENT: number,
    MINI_MAP_WIDTH_PERCENT: number,
    MAP_WIDTH_PERCENT: number,
    MAP_HEIGHT_PERCENT: number,
    MAP_BORDER_LENGTH: number,
    SCROLLING_SPEED: number,
    SCROLLING_BOOSTER: number,
    SCROLL_MOUSE_POSITION_THRESHOLD: number //0-1,
    POSITION_X_ON_CANVAS: number,
    POSITION_Y_ON_CANVAS: number,
    MAP_BORDER_COLOR: string,
    BORDER_GRAPHIC_URL: string,
    ASSET_STEP_SIZE: number,
    ASSET_ACTIVE_STROKE_STYLE: string,
    ASSET_ACTIVE_LINE_WIDTH: number,
    ASSET_ACTIVE_SHADOW_FILL_STYLE: string,
    PLACEHOLDER_TEXT : string,
    PLAHOLDER_FILL_STYLE : string,
    PLACEHOLDER_TEXT_ALIGNMENT: 'start' | 'end' | 'center' | 'left' | 'right',
    PLACEHOLDER_FONT: string

}

export function getMainMapPresets(){
    const returned : mapPresets = {
        ASSET_SIZE : 50,
        ASSET_STEP_SIZE: 10,
        PRIMARY_SCROLL_KEY : 'Shift',
        SECONDARY_SCROLL_KEY : 'Alt',
        DISABLE_MINI_MAP_KEY : 'Control',
        START_MEASURE_KEY: 'r',
        STOP_MEASURE_KEY: 't',
        MINI_MAP_HEIGHT_PERCENT: 30,
        MINI_MAP_WIDTH_PERCENT: 30,
        MAP_WIDTH_PERCENT: 55,
        MAP_HEIGHT_PERCENT: 60,
        MAP_BORDER_LENGTH: 100,
        SCROLLING_SPEED: 5,
        SCROLLING_BOOSTER: 15,
        SCROLL_MOUSE_POSITION_THRESHOLD: 0.1,
        POSITION_X_ON_CANVAS: 0,
        POSITION_Y_ON_CANVAS: 0,
        MAP_BORDER_COLOR: 'gray',
        BORDER_GRAPHIC_URL: '',
        ASSET_ACTIVE_STROKE_STYLE: 'red',
        ASSET_ACTIVE_LINE_WIDTH: 3,
        ASSET_ACTIVE_SHADOW_FILL_STYLE: 'gray',
        PLACEHOLDER_TEXT: 'Map is loading...',
        PLAHOLDER_FILL_STYLE: 'white',
        PLACEHOLDER_TEXT_ALIGNMENT: 'center',
        PLACEHOLDER_FONT: '30px Fondamento'
    }
    
    return returned;
}