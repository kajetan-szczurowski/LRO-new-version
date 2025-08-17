import { getDefaultDrawing, mapType } from "./mapTypes"
import { angleBetweenTwoPoints, degreesToRadians, euclideanDistance, feetsToMeters, radiansToDegrees } from "./mapMath";
import { usersDataState } from "../../states/GlobalState";


export function handleDrawingMode(map: mapType){
    if (map.editingDrawingOperation === '') return;
    if (!map.editingDrawing.userName) return;
    handleMoving(map);
    handleResizing(map);
    handleRotating(map);
    // handleColor(map);
    // if (['circle', 'cone'].includes(map.drawingModeShape)) handleCircular(map);
    // if (map.drawingModeShape === 'line') handleLine(map);
    // const controls = getDrawingControls();
    // const pressedControlKey = Object.keys(controls).find(key => map.pressedKeys[key]);
    // if (pressedControlKey) controlDrawingMode(map, controls[pressedControlKey]);
    assignDrawingModeShapeSize(map);
    map.toBeRedrawn = true;
    // map.drawinModeAngle = getLimitedDrawingAngle(map.drawinModeAngle, map.drawingModeMinAngle, map.drawingModeMaxAngle);
}

export function prepareNewDrawing(map: mapType, shape: ShapeNames){
    const DRAWING_COLOR_KEY = 'LRO-application-drawing-color';
    map.editingDrawing = getDefaultDrawing();
    map.editingDrawing.userName = usersDataState.value.userName;
    map.editingDrawing.x = map.absoluteMouseX;
    map.editingDrawing.y = map.absoluteMouseY;
    map.editingDrawing.angle = 0;
    map.editingDrawing.shapeType = shape;
    map.editingDrawingOperation = 'moving';
    map.editingDrawing.size = 50;
    map.editingDrawing.color = `${localStorage.getItem(DRAWING_COLOR_KEY) ?? '#ccc'}99`;
    if (map.editingDrawing.shapeType === 'line') handeEditingLine(map);
    setDrawingSelectionData(map);
    handleDrawingMode(map);
    map.newDrawingInProgress = true;
}


export function setDrawingSelectionData(map: mapType){
    if (map.editingDrawing.userName === ''){
        map.drawingSelectionRectangle = undefined;
        return;
    }

    if (['circle', 'cone'].includes(map.editingDrawing.shapeType)){
        const selectedX = map.editingDrawing.x - map.editingDrawing.size;
        const selectedY = map.editingDrawing.y - map.editingDrawing.size;
        const side = map.editingDrawing.size * 2;
        map.drawingSelectionRectangle = {x: selectedX, y: selectedY, width: side, height: side};
        return;
    }

    if (map.editingDrawing.shapeType === 'line'){
        if (!map.editingDrawing.linePoint1 || !map.editingDrawing.linePoint2) return;
        const selectedX = Math.min(map.editingDrawing.linePoint1.x, map.editingDrawing.linePoint2.x)
        const selectedY = Math.min(map.editingDrawing.linePoint1.y, map.editingDrawing.linePoint2.y)
        const selectedWidth = Math.abs(map.editingDrawing.linePoint1.x - map.editingDrawing.linePoint2.x);
        const selectedHeight = Math.abs(map.editingDrawing.linePoint1.y - map.editingDrawing.linePoint2.y);
        map.drawingSelectionRectangle = {x: selectedX - 10, y: selectedY - 10 , width: selectedWidth + 20, height: selectedHeight + 20};
        return;
    }
}

export function isMouseOnDrawing(map: mapType, drawing: DrawingData){
    if (!drawing) return;
    const [x, y] = [map.absoluteMouseX, map.absoluteMouseY];
    if (drawing.shapeType === 'circle' || drawing.shapeType === 'cone'){
        const [lowX, lowY, bigX, bigY] = [drawing.x - drawing.size, drawing.y - drawing.size, drawing.x + drawing.size, drawing.y + drawing.size];
        return x >= lowX && y >= lowY && x <= bigX && y <= bigY;
    }
    if (drawing.shapeType === 'line'){
        if (!drawing.linePoint1 || ! drawing.linePoint2) return false;
        const lowX = Math.min(drawing.linePoint1.x, drawing.linePoint2.x) - 10;
        const lowY = Math.min(drawing.linePoint1.y, drawing.linePoint2.y) - 10;
        const bigX = Math.max(drawing.linePoint1.x, drawing.linePoint2.x) + 10;
        const bigY = Math.max(drawing.linePoint1.y, drawing.linePoint2.y) + 10;
        if (x < lowX || y < lowY || x > bigX || y > bigY) return false;
        return true;
    }

}

function handleRotating(map: mapType){
    //TODO: b key to map constant
    if (map.editingDrawingOperation !== "rotating") return;
    if (map.editingDrawing.angle === undefined || map.drawingRotating.initialAngle === undefined) return;
    if (!map.drawingSelectionRectangle) return;
    const currentPoint =  {x: map.absoluteMouseX, y: map.absoluteMouseY};
    const startPoint = map.drawingRotating.previousPoint;
    const centerPoint = {x: map.editingDrawing.x, y: map.editingDrawing.y};
    const angleDifference = radiansToDegrees(angleBetweenTwoPoints(centerPoint.x, centerPoint.y, currentPoint.x, currentPoint.y, startPoint.x, startPoint.y));
    const backwardsOrder = map.pressedKeys['b'] || map.pressedKeys['B'];
    const angleModifier = backwardsOrder? -1 : 1;
    map.editingDrawing.angle = (map.drawingRotating.initialAngle + angleDifference * angleModifier) % 360;
    if (map.editingDrawing.angle < 0) map.editingDrawing.angle = 360;
    map.drawingRotating.initialAngle = map.editingDrawing.angle;
    map.drawingRotating.previousPoint = currentPoint;
    if (map.editingDrawing.shapeType === 'line'){
        handeEditingLine(map, {x: map.editingDrawing.x, y: map.editingDrawing.y})
    }
    setDrawingSelectionData(map);
}



function handleMoving(map: mapType){
    if (map.editingDrawingOperation !== 'moving') return;
    map.editingDrawing.x = map.absoluteMouseX;
    map.editingDrawing.y = map.absoluteMouseY;
    setDrawingSelectionData(map);
    if (map.editingDrawing.shapeType === 'line'){
        handeEditingLine(map);
    } 
}

function handleResizing(map: mapType){
    if (map.editingDrawingOperation !== 'resizing') return;
    if (!map.drawingResizng.initialSize || !map.drawingResizng.initialPoint|| !map.drawingResizng.initialDistance) return;
    const currentDistance = euclideanDistance(map.drawingResizng.currentPoint.x, map.drawingResizng.currentPoint.y, map.editingDrawing.x, map.editingDrawing.y);
    const currentSizeRatio = currentDistance / map.drawingResizng.initialDistance;
    const newSize = map.drawingResizng.initialSize * currentSizeRatio;
    if (Math.abs(newSize - map.editingDrawing.size) > map.presets.SIZE_INCREASE_FILTER) return;
    if (newSize > map.presets.DRAWING_MAX_SIZE || newSize < map.presets.DRAWING_MIN_SIZE) return;
    map.editingDrawing.size = newSize;
    if (map.editingDrawing.shapeType === 'line'){
        handeEditingLine(map, {x: map.editingDrawing.x, y: map.editingDrawing.y});
    }
    setDrawingSelectionData(map);
}

// function handleColor(map: mapType){
//     const DRAWING_COLOR_KEY = 'LRO-application-drawing-color';
//     const drawingColorProposition = localStorage.getItem(DRAWING_COLOR_KEY);
//     const drawingPreviewColor = drawingColorProposition? `${drawingColorProposition}99` : map.drawingModePreviewStyle;
//     map.drawingModePreviewStyle = drawingPreviewColor;
// }

// function handleCircular(map: mapType){
//     map.drawingModeX = map.mouseX;
//     map.drawingModeY = map.mouseY;
// }

// function handleLine(map: mapType){
//     [map.drawingModeLinePoint1, map.drawingModeLinePoint2]  = getLinePoints(map);
// }

export function resetDrawingSelection(map: mapType){
    map.editingDrawing = getDefaultDrawing();
    map.editingDrawingOperation = '';
    setDrawingSelectionData(map);
    map.drawingSelected = false;
}

export function findLineCenter(map: mapType){
    if (!map.editingDrawing.linePoint1 || !map.editingDrawing.linePoint2) return;
    const smallX = Math.min(map.editingDrawing.linePoint1.x, map.editingDrawing.linePoint2.x);
    const smallY = Math.min(map.editingDrawing.linePoint1.y, map.editingDrawing.linePoint2.y);
    const bigX = Math.max(map.editingDrawing.linePoint1.x, map.editingDrawing.linePoint2.x);
    const bigY = Math.max(map.editingDrawing.linePoint1.y, map.editingDrawing.linePoint2.y);
    map.editingDrawing.x = smallX + (bigX - smallX) / 2;
    map.editingDrawing.y = smallY + (bigY - smallY) / 2;

}

export function findLineSize(map: mapType){
    if (!map.editingDrawing.linePoint1 || !map.editingDrawing.linePoint2) return;
    const [p1, p2] = [map.editingDrawing.linePoint1, map.editingDrawing.linePoint2]
    map.editingDrawing.size = euclideanDistance(p1.x, p1.y, p2.x, p2.y);
}

function handeEditingLine(map: mapType, middlePoint = {x: map.absoluteMouseX, y: map.absoluteMouseY}){
    //TODO: merge with handleLine
    [map.editingDrawing.linePoint1, map.editingDrawing.linePoint2]  = getLinePoints(map, middlePoint);

}

function getLinePoints(map: mapType, middlePoint = {x: map.absoluteMouseX, y: map.absoluteMouseY}){
    const current = middlePoint;
    //TODO: handle default size
    const size = map.editingDrawing.size? map.editingDrawing.size : 50;
    if ([0, 180].includes(map.editingDrawing.angle ))
        return [ {x: current.x - size / 2, y: current.y },
                 {x: current.x + size / 2, y: current.y }]
    
    if ([90, 270].includes(map.editingDrawing.angle))
        return [ {x: current.x , y: current.y - size / 2},
                 {x: current.x , y: current.y + size / 2}]

    const lineA = Math.tan(degreesToRadians(map.editingDrawing.angle));
    const lineB = current.y - lineA * current.x;
    const increaseX = size / 2 * Math.cos(degreesToRadians(map.editingDrawing.angle));
    const x1 = current.x + increaseX;
    const x2 = current.x - increaseX;
    const y1 = lineA * x1 + lineB;
    const y2 = lineA * x2 + lineB;
    return [ {x: x1, y: y1}, {x: x2, y: y2} ];
}

function assignDrawingModeShapeSize(map: mapType){
    // if (!map.drawingModeLinePoint1 || !map.drawingModeLinePoint2) return;
    const measureRounding = (value: number) => Math.round(value * 100) / 100;
    const relativeDistance = map.editingDrawing.size / map.presets.ASSET_SIZE;
    const fixedDistance = measureRounding(relativeDistance);
    const feets = map.presets.FEET_DISTANCE_MULTIPLIER * fixedDistance;
    const meters = feetsToMeters(feets);
    map.distance.feets = measureRounding(feets).toFixed(2);
    map.distance.meters = measureRounding(meters).toFixed(2);
}

export function getDrawingData(map: mapType): DrawingDataToServer{
    const id = usersDataState.value.userID;
    const shape = map.editingDrawing.shapeType;
    const color = map.editingDrawing.color
    const sizePixels = map.editingDrawing.size;
    const sizeFeets = map.distance.feets;
    const sizeMeters = map.distance.meters;

    // let point1, point2 : {x: number, y: number} | undefined;
    const point1 = map.editingDrawing.linePoint1;
    if (point1) point1.x;
    if (point1) point1.y;
    const point2 = map.editingDrawing.linePoint2;
    if (point2) point2.x;
    if (point2) point2.y;
    const angle  = map.editingDrawing.angle
    // const x = map.drawingModeX;
    // const y = map.drawingModeY;
    const x = map.absoluteMouseX;
    const y = map.absoluteMouseY;


    const result: DrawingDataToServer = {
        userID: id, shapeType: shape as ShapeNames | "", color: color,
        size: sizePixels, feets: sizeFeets, meters: sizeMeters,
        linePoint1: point1, linePoint2: point2,
        angle: angle, x: x, y: y};
    return result;
}


export type ShapeNames = 'circle' | 'line' | 'cone'
export type DrawingData = {
    id?: string,
    userName?: string,
    shapeType: ShapeNames | "",
    color: string,
    size: number,
    feets: string,
    meters: string,
    angle: number,
    x: number,
    y: number,
    linePoint1? : {x: number, y: number}
    linePoint2? : {x: number, y: number}
}
type DrawingDataToServer = DrawingData & {userID: string};