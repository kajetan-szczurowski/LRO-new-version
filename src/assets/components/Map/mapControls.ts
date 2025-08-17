import { getDefaultDrawing, mapType } from "./mapTypes"
import { isMouseOnCharacter } from "./mapCharacters";
import { mapDataState } from "../../states/GlobalState";
import * as mapMath from "./mapMath";
import { initContextMenu, handleRightMenuMouseDown, closeContextMenu, drawingSelectedContextMenu } from "./mapRightClickMenu";
import { findLineCenter, findLineSize, handleDrawingMode, isMouseOnDrawing, resetDrawingSelection, setDrawingSelectionData } from "./mapDrawingMode";
import { usersDataState } from "../../states/GlobalState";

export function canvasEventListeners(map: mapType){
    map.rawCanvas.addEventListener('mousemove', (e) => handleMouseMove(e, map));
    map.rawCanvas.addEventListener('mouseout', () => {map.mouseOnMap = false});
    map.rawCanvas.addEventListener('click', () => handleClick(map));
    map.rawCanvas.addEventListener('mousedown', () => handleMouseDown(map));
    map.rawCanvas.addEventListener('mouseup', () => handleMouseUp(map));


    map.rawCanvas.addEventListener('contextmenu', (e) => handleContextMenu(e, map));
    map.rawCanvas.addEventListener('dblclick', () => handleDoubleClick(map));
    // map.rawCanvas.ondblclick(() => handleDoubleClick(map));
    addEventListener('resize', () => {map.resized = true})
    addEventListener('keydown', (e) => handleKeyDown(e, map));
    addEventListener("keyup", event => {map.pressedKeys[event.key] = false});
}

export function miniMapControl(map:mapType){
    if (!map.img) return;
    if (!map.miniMapX || !map.miniMapY) return;
    if (!map.miniMapHeight || !map.miniMapWidth) return;

    if (map.pressedKeys[map.presets.DISABLE_MINI_MAP_KEY] && map.mouseOnMap && map.allowHideMiniMap){
        map.showMiniMap = map.showMiniMap? false : true;
        map.toBeRedrawn = true;
        if (map.presets.MINI_MAP_HIDE_FILTER_TIME) map.allowHideMiniMap = false;
        if (map.presets.MINI_MAP_HIDE_FILTER_TIME) setTimeout(() => {map.allowHideMiniMap = true}, map.presets.MINI_MAP_HIDE_FILTER_TIME);
        if (!map.showMiniMap) return;
    }

    map.mouseOnMiniMap = map.mouseX > map.miniMapX && map.mouseX < map.miniMapX + map.miniMapWidth
                        && map.mouseY > map.miniMapY && map.mouseY < map.miniMapY + map.miniMapHeight;
    if (!map.mouseOnMiniMap) return;
    
    const [widthOffset, heightOffset] = [0.5 * map.rawCanvas.width, 0.5 * map.rawCanvas.height];
    const [miniX, miniY] = [map.mouseX - map.miniMapX, map.mouseY - map.miniMapY];
    const newX = miniX / map.miniMapWidth * map.img.width;
    const newY = miniY / map.miniMapHeight * map.img.height;
    const aimX = limitValue(newX, widthOffset, map.img.width - widthOffset);
    const aimY = limitValue(newY, heightOffset, map.img.height - heightOffset);
    map.miniMapAimedX = aimX - widthOffset;
    map.miniMapAimedY = aimY - heightOffset;
    map.miniMapPointerX = map.miniMapX + (aimX - widthOffset) / map.img.width * map.miniMapWidth;
    map.miniMapPointerY = map.miniMapY + (aimY - heightOffset) / map.img.height * map.miniMapHeight;

    map.toBeRedrawn = true;
}

export function handleMeasure(map:mapType){
    if (!map.mouseOnMap) return;
    if (map.measuring) calculateMeasure(map);
    handleMoveOverflow(map);
    const enable = map.pressedKeys[map.presets.START_MEASURE_KEY] || map.pressedKeys[map.presets.START_MEASURE_KEY.toUpperCase()];
    const disable = map.pressedKeys[map.presets.STOP_MEASURE_KEY] || map.pressedKeys[map.presets.STOP_MEASURE_KEY.toUpperCase()];

    // if (map.drawingModeShape) return;

    if ((!enable && !disable) || (enable && disable)) return;
    if ((map.measuring && enable) || !map.measuring && disable) return;
    
    if (!map.measuring && enable) startMeasuring(map);
    if (map.measuring && disable) stopMeasuring(map);
}


function handleMoveOverflow(map: mapType){
    if (map.activeAssetId && map.measureRadius && map.distance.feets) {
        const currentAsset = map.assets.find(a => a.id === map.activeAssetId);
        if (!currentAsset) return;
        if (!currentAsset.speed) return;
        const currentFeets =  Number(map.distance.feets);
        if (currentFeets > currentAsset.speed) 
            map.distanceOverflowing = true;
    }

}

function handleRotatingDrawing(map: mapType){
    //TODO: use contants insted of magic numbers and magic strings
    if (map.drawingMoving.ready) return;

    if (!map.drawingSelectionRectangle){
        document.body.style.cursor = 'auto';
        map.drawingRotating.ready = false;
        return;
    }

    const xPoint = map.drawingSelectionRectangle.x + map.drawingSelectionRectangle.width;
    const yPoint = map.drawingSelectionRectangle.y;
    const mouseInPlaceX = valueIsInProximity(map.absoluteMouseX, xPoint, 10);
    const mouseInPlaceY = valueIsInProximity(map.absoluteMouseY, yPoint, 10);
    if (mouseInPlaceX && mouseInPlaceY && map.editingDrawingOperation != "rotating" ){
        document.body.style.cursor = 'grab';
        map.drawingRotating.ready= true;
        return;
    }

    map.drawingRotating.ready= false;

}   

function handleMovingDrawing(map: mapType){
    //TODO: use contants insted of magic numbers and magic strings
    if (map.editingDrawingOperation === "moving") return;
    if (map.editingDrawingOperation === 'rotating') return;
    if (!map.editingDrawing.userName) return;
    const xOk = valueIsInProximity(map.absoluteMouseX, map.editingDrawing.x, 10);
    const yOk = valueIsInProximity(map.absoluteMouseY, map.editingDrawing.y, 10);
    if (xOk && yOk){
        document.body.style.cursor = 'all-scroll';
        map.drawingMoving.ready= true;
        return;
    }

    document.body.style.cursor = 'auto';
    map.drawingMoving.ready = false;

}

function handleResizingDrawing(map: mapType){
    //TODO: use contants insted of magic numbers and magic strings
    if (!map.drawingSelectionRectangle) return;
    if (map.drawingSelectionRectangle.width === 0) return;
    if (!map.editingDrawing.userName) return;
    if (map.drawingMoving.ready) return;
    if (map.editingDrawingOperation === 'moving' || map.editingDrawingOperation === 'rotating') return

    if(map.editingDrawingOperation === 'resizing' ){
        map.drawingResizng.currentPoint = {x: map.absoluteMouseX, y: map.absoluteMouseY};
    }


    if (!map.drawingSelectionRectangle){
        document.body.style.cursor = 'auto';
        map.drawingResizng.ready = false;
        return;
    } 
    const leftXOk = valueIsInProximity(map.absoluteMouseX, map.drawingSelectionRectangle.x, 10);
    const rightXOk = valueIsInProximity(map.absoluteMouseX, map.drawingSelectionRectangle.x + map.drawingSelectionRectangle.width, 10);
    const yNotOk = map.absoluteMouseY < map.drawingSelectionRectangle.y || map.absoluteMouseY > map.drawingSelectionRectangle.y + map.drawingSelectionRectangle.height;
    if ((!leftXOk && ! rightXOk) || yNotOk){
         document.body.style.cursor = 'auto';
         map.drawingResizng.ready = false;
        return;
    }
    document.body.style.cursor = 'w-resize';
    map.drawingResizng.ready = true;
}

function valueIsInProximity(valueToCheck: number, pointToCompare: number, proximity: number){
    const smallOK = pointToCompare - proximity < valueToCheck;
    const bigOK = pointToCompare + proximity > valueToCheck;
    return smallOK && bigOK;
}



export function handleScrolling(map:mapType){
    if (!map.rightBorderVisible) map.onCanvasWidth = map.rawCanvas.width;
    if (!map.bottomBorderVisible) map.onCanvasHeight = map.rawCanvas.height;

    if (!map.mouseOnMap) return;
    if (!map.pressedKeys.hasOwnProperty(map.presets.PRIMARY_SCROLL_KEY)){
        return;
    } 

    if (!map.pressedKeys[map.presets.PRIMARY_SCROLL_KEY]) return;
    let secondaryClicked = false;
    if (map.pressedKeys.hasOwnProperty(map.presets.SECONDARY_SCROLL_KEY))
        if (map.pressedKeys[map.presets.SECONDARY_SCROLL_KEY]) secondaryClicked = true;

    const booster = secondaryClicked?
        map.presets.SCROLLING_BOOSTER: map.presets.SCROLLING_SPEED;

    const xMove = checkForScrolling(map, map.mouseX, map.rawCanvas.width);
    const yMove = checkForScrolling(map, map.mouseY, map.rawCanvas.height);

    if (xMove.moving) scrollMap(map, booster, "x", xMove.increasing);
    if (yMove.moving) scrollMap(map, booster, "y", yMove.increasing);


    // handleMapBorderLogic(map);
}

function handleContextMenu(e:MouseEvent, map:mapType){
    e.preventDefault();
    if (map.activeAssetId){
        const activeCharacter = map.assets.find(char => char.id === map.activeAssetId);
        if (activeCharacter) activeCharacter.active = false;
        map.activeAssetId = '';
        map.activeSide = 0;
        stopMeasuring(map);
    }

    for(let i = map.assets.length - 1; i >= 0; i--){
        if (isMouseOnCharacter(map, map.assets[i])){
            map.controllFunction('delete-asset', [map.assets[i].id]);
            return;
        }
    }

    if (map.editingDrawing.id){
        drawingSelectedContextMenu(map);
        return;
    }

    initContextMenu(map);

}


function startMeasuring(map:mapType, x?:number, y?:number){
    map.measuring = true;
    const startX = x? x : map.absoluteMouseX;
    const startY = y? y : map.absoluteMouseY;
    map.measurePoint = {x: startX, y: startY};
}

function stopMeasuring(map:mapType){
    map.measuring = false;
}

function calculateMeasure(map:mapType){
    if (!map.measuring) return;

    if (map.activeAssetId){
        const asset = map.assets.find(char => char.id === map.activeAssetId);
        if (asset && asset.size) map.measurePoint = {x: asset.x + asset.size / 2, y: asset.y + asset.size / 2};
    }
    map.measureRadius = mapMath.euclideanDistance(map.measurePoint.x, map.measurePoint.y, map.absoluteMouseX, map.absoluteMouseY);
    const measureRounding = (value: number) => Math.round(value * 100) / 100;
    const distance = mapMath.euclideanDistance(map.measurePoint.x, map.measurePoint.y, map.absoluteMouseX, map.absoluteMouseY);
    const relativeDistance = distance / map.presets.ASSET_SIZE;
    const fixedDistance = measureRounding(relativeDistance);
    const feets = map.presets.FEET_DISTANCE_MULTIPLIER * fixedDistance;
    const meters = mapMath.feetsToMeters(feets);
    map.distance.feets = measureRounding(feets).toFixed(2);
    map.distance.meters = measureRounding(meters).toFixed(2);
    map.measureRadius = distance;
}

function handleMapBorderLogic(map:mapType){
    if(!map.sourceHeight || !map.sourceWidth) return;
    if(!map.img) return;
    const tooLow = map.x < 0 || map.y < 0;
    const bigX = map.x + map.visibleWidth > map.img?.width;
    const bigY = map.y + map.visibleHeight > map.img.height;
    const tooBig = bigX || bigY;

    map.borderVisible = tooBig || tooLow;
    map.onCanvasX = map.presets.POSITION_X_ON_CANVAS;
    map.onCanvasY = map.presets.POSITION_Y_ON_CANVAS;
    map.onCanvasWidth = map.visibleWidth;
    map.onCanvasHeight = map.visibleHeight;
    map.sourceX = map.x;
    map.sourceY = map.y;
    map.rightBorderVisible = bigX;
    map.bottomBorderVisible = bigY;

    if (!map.borderVisible) return;
    if (map.x < 0) {
        map.onCanvasX = Math.abs(map.x)
        map.sourceX = 0;
    };
    if (map.y < 0) {
        map.onCanvasY = Math.abs(map.y)
        map.sourceY = 0
    };

    if (bigX){
        const widthDiffer = map.visibleWidth + map.x - map.sourceWidth;
        map.onCanvasWidth = map.visibleWidth - widthDiffer;
    }

    if (bigY){
        const heightDiffer = map.visibleHeight + map.y - map.sourceHeight;
        map.onCanvasHeight = map.visibleHeight - heightDiffer;
    }  

}

function handleMouseUp(map: mapType){
    map.editingDrawingOperation = '';
}

function handleMouseDown(map: mapType){
    map.lastMouseDownTime = Date.now();
    map.lastPointOfMouseDown = {x: map.absoluteMouseX, y: map.absoluteMouseY};
    if (!map.drawingResizng.ready && !map.drawingRotating.ready && !map.drawingMoving.ready) return;

    if (map.editingDrawingOperation !== 'resizing' && map.drawingResizng.ready && !map.drawingRotating.ready){
        map.editingDrawingOperation = 'resizing';
        map.drawingResizng.initialDistance = mapMath.euclideanDistance(map.absoluteMouseX, map.absoluteMouseY, map.editingDrawing.x, map.editingDrawing.y);
        map.drawingResizng.initialSize = map.editingDrawing.size;
        map.drawingHasChanged = true;
        return;
    }

    if (map.editingDrawingOperation !== 'rotating'  && map.drawingRotating.ready){
        map.editingDrawingOperation = 'rotating';
        map.drawingRotating.referencePoint = {x: map.absoluteMouseX, y: map.absoluteMouseY};
        map.drawingRotating.previousPoint = {x: map.absoluteMouseX, y: map.absoluteMouseY};
        map.drawingRotating.initialAngle = map.editingDrawing.angle;
        document.body.style.cursor = 'grabbing';
        map.drawingHasChanged = true;
        return;
    }

     if (map.editingDrawingOperation !== 'moving'  && map.drawingMoving.ready){
        map.editingDrawingOperation = 'moving';
        map.drawingHasChanged = true;
        return;
    }

}

function handleClick(map: mapType){
    if (map.isContextMenuOpened){
        handleRightMenuMouseDown(map);
        return;
    }


    if (map.mouseOnMiniMap && map.miniMapAimedX !== undefined && map.miniMapAimedY !== undefined && map.showMiniMap){
        moveMap(map, map.miniMapAimedX, map.miniMapAimedY);
        return;
    }

    if (map.activeSide && map.activeAssetId){
        map.controllFunction('move-order-output', [map.activeAssetId, map.absoluteMouseX - map.activeSide / 2, map.absoluteMouseY - map.activeSide / 2], map);
        const activeElement = map.assets.find(char => char.id === map.activeAssetId);
        if (!activeElement) return;
        activeElement.active = false;
        map.activeSide = 0;
        map.activeAssetId = '';
        stopMeasuring(map);
        return;
    }

    let activeIndex = '';
    let activeSide: number | undefined = 0; 
    if (!map.drawingSelected && !map.pressedKeys[map.presets.PREVENT_SELECTING_CHARACTERS_KEY])
        for(let i = map.assets.length - 1; i >= 0; i--){
            if (isMouseOnCharacter(map, map.assets[i])){
                activeIndex = map.assets[i].id;
                activeSide = map.assets[i].size;
                map.activeAssetId = map.assets[i].id;
                break;
            } 
        }

    if (activeIndex !== '' && activeSide){
        map.activeSide = activeSide;
        startMeasuring(map);
        map.assets.forEach(char => {
            if (char.id === activeIndex) {
                char.active? char.active = false: char.active = true;
                if (!char.active) map.activeSide = 0;
            }

        else char.active = false;
    })
    return;
    }


    if (map.newDrawingInProgress){
        map.controllFunction('new-drawing-order', [map.absoluteMouseX, map.absoluteMouseY], map);
        map.editingDrawingOperation = '';
        map.editingDrawing = getDefaultDrawing();
        map.newDrawingInProgress = false;
        return;
    }

    const userName = usersDataState.value.userName;
    const isGM = usersDataState.value.isGM;
    let drawnItem = getDefaultDrawing();
    let currentOwner = '';
    for(let i = map.drawnShapes.length - 1; i >= 0; i--){
        if (map.editingDrawing.userName) break;
        currentOwner = map.drawnShapes[i].userName;
        if (userName !== currentOwner) if (!isGM) continue;
        const drawings = map.drawnShapes[i].shapes;
        for(let j = drawings.length -1; j >= 0; j--){
            drawnItem = drawings[j];
            if (isMouseOnDrawing(map, drawnItem)){
                map.editingDrawing = drawnItem;
                map.editingDrawing.userName = currentOwner;
                setDrawingSelectionData(map);
                if (map.editingDrawing.shapeType === 'line') findLineCenter(map);
                if (map.editingDrawing.shapeType === 'line') findLineSize(map);
                map.drawingSelected = true;
                break;
            }
        }

    }
    const now = Date.now();
    const timeDifference = now - map.lastMouseDownTime;
    if (currentOwner === '' && timeDifference < map.presets.MOUSE_CLICK_TIME_FILTER){
        if (map.drawingHasChanged){
            map.drawingHasChanged = false;
            map.controllFunction('edit-drawing-order', [map.absoluteMouseX, map.absoluteMouseY], map);
        }
        resetDrawingSelection(map);
    }




}

function handleDoubleClick(map: mapType){
    if (!map.img) return;
    if (map.absoluteMouseX < 0 || map.absoluteMouseY < 0) return;
    if (map.absoluteMouseX > map.img.width) return;
    if (map.absoluteMouseY > map.img.height) return;

    map.controllFunction('ping-order', [map.absoluteMouseX, map.absoluteMouseY]);
}

function handleEscapeButton(map: mapType){
    closeContextMenu(map);
    map.editingDrawingOperation === '';
}

function handleKeyDown(evt:KeyboardEvent, map:mapType){
    if (typeof map.pressedKeys != 'object') return;
    map.pressedKeys[evt.key] = true;
    if (evt.key === 'Escape') handleEscapeButton(map);
}

function handleMouseMove(e:MouseEvent, map:mapType){
    map.distanceOverflowing = false;
    map.mouseOnMap = true;
    const boundingRect = map.rawCanvas.getBoundingClientRect();
    map.mouseX = e.clientX - boundingRect.left;
    map.mouseY = e.clientY - boundingRect.top;
    map.absoluteMouseX = map.mouseX + map.sourceX - map.onCanvasX;
    map.absoluteMouseY = map.mouseY + map.sourceY - map.onCanvasY;
    handleMoveOverflow(map);
    handleDrawingMode(map);
    handleHP(map);
    handleMovingDrawing(map);
    handleResizingDrawing(map);
    handleRotatingDrawing(map);
    if (document.body.style.cursor !== 'auto' && !map.drawingSelected) document.body.style.cursor = 'auto';
}

function checkForScrolling(map:mapType, mousePosition: number, sideLength: number){
    const scrollRangeBig = sideLength * (1 - map.presets.SCROLL_MOUSE_POSITION_THRESHOLD);
    const scrollRangeSmall = sideLength * map.presets.SCROLL_MOUSE_POSITION_THRESHOLD;
    if (mousePosition >= scrollRangeBig) return {moving: true, increasing: true};
    if (mousePosition <= scrollRangeSmall) return {moving: true, increasing: false};
    return {moving: false};
}

function scrollMap(map:mapType, shift:number, axis: "x" | "y", increasing:boolean = false){
    if (axis !== "x" && axis !== "y") return;
    let targetOffset, multiplier;
    increasing? multiplier = 1: multiplier = -1; 
    targetOffset = map[axis] + multiplier * shift;
    if (targetOffset < (-1) * map.presets.MAP_BORDER_LENGTH) return;
    if (targetOffset > map.x + map.rawCanvas.width + map.presets.MAP_BORDER_LENGTH && axis === "x") return;
    if (targetOffset > map.y + map.rawCanvas.height + map.presets.MAP_BORDER_LENGTH && axis === "y") return;
    if (axis === "x" && increasing && map.visibleWidth - map.onCanvasWidth > map.presets.MAP_BORDER_LENGTH) return;
    if (axis === "y" && increasing && map.visibleHeight - map.onCanvasHeight > map.presets.MAP_BORDER_LENGTH) return;

    if (axis === 'x') moveMap(map, targetOffset, map.y);
    if (axis === 'y') moveMap(map, map.x, targetOffset);
}

function moveMap(map: mapType, x:number, y:number){
    map.x = x;
    map.y = y;
    // if (map.img && map.miniMapWidth && map.miniMapX) map.miniMapCurrentX = map.miniMapX + Math.max(map.x,0) / map.img.width * map.miniMapWidth;
    // if (map.img && map.miniMapHeight && map.miniMapY) map.miniMapCurrentY = map.miniMapY + Math.max(map.y,0) / map.img.height * map.miniMapHeight;
    // if (map.miniMapPointerX && map.miniMapWidth && map.miniMapX && map.miniMapPointerWidth && map.miniMapCurrentX) console.log(map.miniMapPointerWidth + map.miniMapCurrentX, 
    //     map.miniMapX + map.miniMapWidth);
    
    map.toBeRedrawn = true;
    handleMapBorderLogic(map);
    calculateMeasure(map);
    mapDataState.value.x = x;
    mapDataState.value.y = y;
}


export function limitValue(value: number, min: number, max: number){
    if (value < min) return min;
    if (value > max) return max;
    return value;
}


function handleHP(map: mapType){
    //TODO: refactor, please
    const isGM = usersDataState.value.isGM;
    const showText = isGM; // place for text logics for ordinary players
    let maxHP = 0;
    let currentHP = 0;
    let assetSize = 0;
    for(let i = map.assets.length - 1; i >= 0; i--){
        if (isMouseOnCharacter(map, map.assets[i])){
            if (map.assets[i].maxHP && map.assets[i].currentHP !== null && map.assets[i].currentHP !== undefined){
                if (map.assets[i].id === map.currentlyHoverAssetID) return;
                map.currentlyHoverAssetID = map.assets[i].id;
                assetSize = map.assets[i].size ?? map.presets.ASSET_SIZE; 
                maxHP = map.assets[i].maxHP ?? 0;
                currentHP = map.assets[i].currentHP ?? 0;
                // map.HPBarX = map.onCanvasWidth / 2 - map.presets.HP_BAR_WIDTH / 2;
                map.HPBarX = map.assets[i].x - map.x - map.presets.HP_BAR_WIDTH_OVERFLOW;
                map.HPBarY = map.assets[i].y - map.y + assetSize + map.presets.HP_BAR_TOP_MARGIN;
                map.HPBarWrapperWidth = assetSize + 2 * map.presets.HP_BAR_WIDTH_OVERFLOW;
                map.HPBarFilledWidth = currentHP / maxHP * map.HPBarWrapperWidth;
                if (isGM) map.HPBarText = `(${i}) ${currentHP}/${maxHP}`;
                if (showText) map.HPBarTextX = map.HPBarX + map.HPBarWrapperWidth / 2;
                map.maxAssetHP = maxHP;
                map.currentAssetHP = currentHP;
                }

                //TODO: refactor, beacuse it assigns also conditions

                const conditions = map.assets[i].conditions;
                if (!conditions) return;
                map.canvas.font = map.presets.CONDITION_FONT;
                let counter = 0;
                const assetX = map.assets[i].x + ((map.assets[i].size ?? 50) / 2);
                const startX = assetX - map.presets.CONDITION_ROW_MAX_WIDTH / 2;
                let currentX = startX;
                let currentY = map.assets[i].y + (map.assets[i].size ?? 50) + 30;
                let newWidth = 0;
                let currentXForce = 0;
                let widthDelta = 0;
                let startIndex = 0;
                map.HoveredCharacterConditions = [];
                conditions?.forEach(cond => {
                    if (map.HoveredCharacterConditions === undefined) return;
                    newWidth = map.canvas.measureText(`${cond.force} ${cond.label} `).width + 10;
                    currentXForce = currentX + map.canvas.measureText(`${cond.label}`).width + 5; 
                    counter++;
                    map.HoveredCharacterConditions?.push({x: currentX - map.x, y: currentY - map.y, width: newWidth, height: 25, forceX: currentXForce - map.x, ...cond});
                    currentX += newWidth + 20;
                    if (counter >= map.presets.MAX_CONDITIONS_PER_ROW){
                        widthDelta = currentX - assetX - assetX + startX;
                        currentX = startX;
                        currentY += 30;
                        counter = 0;
                        if (widthDelta !==0){
                            for (let j = startIndex; j < startIndex + map.presets.MAX_CONDITIONS_PER_ROW; j++){
                                map.HoveredCharacterConditions[j].x -=  (widthDelta / map.presets.MAX_CONDITIONS_PER_ROW);
                                map.HoveredCharacterConditions[j].forceX -=  (widthDelta / map.presets.MAX_CONDITIONS_PER_ROW);
                            }
                        }
                    }
                });

                return;
            }
        map.HoveredCharacterConditions = [];
        map.currentlyHoverAssetID = '';
            
    }
    map.maxAssetHP = 0;
    map.currentAssetHP = 0;

}
