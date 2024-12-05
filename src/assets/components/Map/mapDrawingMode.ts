import { mapType } from "./mapTypes"

export function handleDrawingMode(map: mapType){
    if (!map.drawingModeShape || map.drawingModeShape === "") return;
    if (['circle', 'cone'].includes(map.drawingModeShape)) handleCircular(map);
    if (map.drawingModeShape === 'line') handleLine(map);
    const controls = getDrawingControls();
    const pressedControlKey = Object.keys(controls).find(key => map.pressedKeys[key]);
    if (pressedControlKey) controlDrawingMode(map, controls[pressedControlKey]);
    map.toBeRedrawn = true;
}

export function setDrawingModeShape(map: mapType, shape: ShapeNames){
    map.drawingModeShape = shape;
    map.drawingModeSize = map.drawingModeDefaultSize;
    handleDrawingMode(map);
}


export function resetDrawingModeShape(map: mapType){
    map.drawingModeShape = "";
}

function controlDrawingMode(map: mapType, order: string){
    switch (order){
        case "ENLONG": {
            map.drawingModeSize = Math.min(map.drawingModeSize + map.drawingModeSizeIncrease, map.drawingModeMaxSize);
            break;
        }
        case "SHORTEN": {
            map.drawingModeSize = Math.max(map.drawingModeSize - map.drawingModeSizeIncrease, map.drawingModeMinSize);
            break;
        }
        
    }
}

function getDrawingControls(){
    const controls: {[key: string]: string} = {
        "ArrowUp": "ENLONG",
        "ArrowDown": "SHORTEN",
        "ArrowRight": "ROTATE_POSITIVE",
        "ArrowLeft": "ROTATE_NEGATIVE"
    }
    return controls;
}

function handleCircular(map: mapType){
    map.drawingModeX = map.mouseX;
    map.drawingModeY = map.mouseY;
}

function handleLine(map: mapType){

}

export type ShapeNames = 'circle' | 'line' | 'cone'