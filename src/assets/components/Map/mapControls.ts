import { mapType } from "./mapTypes"
import { isMouseOnCharacter } from "./mapCharacters";
import { mapDataState } from "../../states/GlobalState";
import * as mapMath from "./mapMath";

export function canvasEventListeners(map: mapType){
    map.rawCanvas.addEventListener('mousemove', (e) => handleMouseMove(e, map));
    map.rawCanvas.addEventListener('mouseout', () => {map.mouseOnMap = false});
    map.rawCanvas.addEventListener('click', () => handleClick(map));
    map.rawCanvas.addEventListener('contextmenu', (e) => handleContextMenu(e, map));
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
    const enable = map.pressedKeys[map.presets.START_MEASURE_KEY] || map.pressedKeys[map.presets.START_MEASURE_KEY.toUpperCase()];
    const disable = map.pressedKeys[map.presets.STOP_MEASURE_KEY] || map.pressedKeys[map.presets.STOP_MEASURE_KEY.toUpperCase()];

    if ((!enable && !disable) || (enable && disable)) return;
    if ((map.measuring && enable) || !map.measuring && disable) return;
    
    if (!map.measuring && enable) startMeasuring(map);
    if (map.measuring && disable) stopMeasuring(map);
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
        }
    }
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



function handleClick(map: mapType){

    if (map.mouseOnMiniMap && map.miniMapAimedX !== undefined && map.miniMapAimedY !== undefined && map.showMiniMap){
        moveMap(map, map.miniMapAimedX, map.miniMapAimedY);
        return;
    }

    if (map.activeSide && map.activeAssetId){
        map.controllFunction('move-order-output', [map.activeAssetId, map.absoluteMouseX - map.activeSide / 2, map.absoluteMouseY - map.activeSide / 2]);
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
    for(let i = map.assets.length - 1; i >= 0; i--){
        if (isMouseOnCharacter(map, map.assets[i])){
            activeIndex = map.assets[i].id;
            activeSide = map.assets[i].size;
            map.activeAssetId = map.assets[i].id;
            break;
        } 
    }

    if (activeIndex === '' || !activeSide) return;
    map.activeSide = activeSide;
    startMeasuring(map);
    map.assets.forEach(char => {
        if (char.id === activeIndex) {
            char.active? char.active = false: char.active = true;
            if (!char.active) map.activeSide = 0;
        }

        else char.active = false;
    })
}


function handleKeyDown(evt:KeyboardEvent, map:mapType){
    if (typeof map.pressedKeys != 'object') return;
    map.pressedKeys[evt.key] = true;
}

function handleMouseMove(e:MouseEvent, map:mapType){
    map.mouseOnMap = true;
    const boundingRect = map.rawCanvas.getBoundingClientRect();
    map.mouseX = e.clientX - boundingRect.left;
    map.mouseY = e.clientY - boundingRect.top;
    map.absoluteMouseX = map.mouseX + map.sourceX - map.onCanvasX;
    map.absoluteMouseY = map.mouseY + map.sourceY - map.onCanvasY;

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