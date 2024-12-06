import { mapType } from "./mapTypes"
import { degreesToRadians } from "./mapMath";

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
        case "ROTATE_POSITIVE": {
            map.drawinModeAngle = map.drawinModeAngle + map.drawingModeAngleIncrease;
            break;
        }
        case "ROTATE_NEGATIVE": {
            map.drawinModeAngle = map.drawinModeAngle - map.drawingModeAngleIncrease;
            break;
        }
    }
    map.drawinModeAngle = getLimitedDrawingAngle(map.drawinModeAngle, map.drawingModeMinAngle, map.drawingModeMaxAngle);
    map.drawingModeAngleRadians = degreesToRadians(map.drawinModeAngle);
}

function getLimitedDrawingAngle(angle: number, min: number, max: number): number {
    if (angle > max) return min;
    if (angle < min) return max;
    return angle;
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
    map.drawingModeX = map.mouseX - map.drawingModeSize / 2;
    map.drawingModeY = map.mouseY;
}

export type ShapeNames = 'circle' | 'line' | 'cone'