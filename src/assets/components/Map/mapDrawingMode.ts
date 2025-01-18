import { mapType } from "./mapTypes"
import { degreesToRadians, feetsToMeters } from "./mapMath";
import { usersDataState } from "../../states/GlobalState";

export function handleDrawingMode(map: mapType){
    if (!map.drawingModeShape || map.drawingModeShape === "") return;
    if (['circle', 'cone'].includes(map.drawingModeShape)) handleCircular(map);
    if (map.drawingModeShape === 'line') handleLine(map);
    const controls = getDrawingControls();
    const pressedControlKey = Object.keys(controls).find(key => map.pressedKeys[key]);
    if (pressedControlKey) controlDrawingMode(map, controls[pressedControlKey]);
    assignDrawingModeShapeSize(map);
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
    [map.drawingModeLinePoint1, map.drawingModeLinePoint2]  = getLinePoints(map, map.mouseX, map.mouseY);
}

function getLinePoints(map: mapType, mouseX: number, mouseY: number){
    if ([0, 180].includes(map.drawinModeAngle))
        return [ {x: mouseX - map.drawingModeSize / 2, y: mouseY},
                 {x: mouseX + map.drawingModeSize / 2, y: mouseY}]
    
    if ([90, 270].includes(map.drawinModeAngle))
        return [ {x: mouseX, y: mouseY - map.drawingModeSize / 2},
                 {x: mouseX, y: mouseY + map.drawingModeSize / 2}]

    const lineA = Math.tan(degreesToRadians(map.drawinModeAngle));
    const lineB = mouseY - lineA * mouseX;
    const increaseX = map.drawingModeSize / 2 * Math.cos(degreesToRadians(map.drawinModeAngle));
    const x1 = mouseX + increaseX;
    const x2 = mouseX - increaseX;
    const y1 = lineA * x1 + lineB;
    const y2 = lineA * x2 + lineB;
    return [ {x: x1, y: y1}, {x: x2, y: y2} ];
}

function assignDrawingModeShapeSize(map: mapType){
    if (!map.drawingModeLinePoint1 || !map.drawingModeLinePoint2) return;
    const measureRounding = (value: number) => Math.round(value * 100) / 100;;
    const relativeDistance = map.drawingModeSize / map.presets.ASSET_SIZE;
    const fixedDistance = measureRounding(relativeDistance);
    const feets = map.presets.FEET_DISTANCE_MULTIPLIER * fixedDistance;
    const meters = feetsToMeters(feets);
    map.distance.feets = measureRounding(feets).toFixed(2);
    map.distance.meters = measureRounding(meters).toFixed(2);
}

export function getDrawingData(map: mapType): DrawingDataToServer{
    const id = usersDataState.value.userID;
    const shape = map.drawingModeShape ?? "";
    const color = map.drawingModePreviewStyle;
    const sizePixels = map.drawingModeSize;
    const sizeFeets = map.distance.feets;
    const sizeMeters = map.distance.meters;

    let point1, point2 : {x: number, y: number} | undefined;

    const result: DrawingDataToServer = {
        userID: id, shapeType: shape as ShapeNames | "", color: color,
        size: sizePixels, feets: sizeFeets, meters: sizeMeters,
        linePoint1: point1, linePoint2: point2};
    return result;
}


export type ShapeNames = 'circle' | 'line' | 'cone'
type DrawingDataToServer = {
    userID: string,
    shapeType: ShapeNames | "",
    color: string,
    size: number,
    feets: string,
    meters: string,
    linePoint1? : {x: number, y: number}
    linePoint2? : {x: number, y: number}
}