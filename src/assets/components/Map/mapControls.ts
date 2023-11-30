import { mapType } from "./mapTypes"
import { isMouseOnCharacter } from "./mapCharacters";

export function canvasEventListeners(map: mapType){
    map.rawCanvas.addEventListener('mousemove', (e) => handleMouseMove(e, map));
    map.rawCanvas.addEventListener('mouseout', () => {map.mouseOnMap = false});
    map.rawCanvas.addEventListener('click', () => handleClick(map));
    addEventListener('resize', () => {map.resized = true})
    addEventListener('keydown', (e) => handleKeyDown(e, map));
    addEventListener("keyup", event => {map.pressedKeys[event.key] = false});
}

export function handleScrolling(map:mapType){
    if (!map.rightBorderVisible) map.onCanvasWidth = map.rawCanvas.width;
    if (!map.bottomBorderVisible) map.onCanvasHeight = map.rawCanvas.height;

    if (!map.mouseOnMap) return;
    if (!map.pressedKeys.hasOwnProperty(map.presets.PRIMARY_SCROLL_KEY)) return;
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

    handleMapBorderLogic(map);

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
    if (map.activeSide && map.activeAssetId){
        map.controllFunction('move-order', [map.activeAssetId, map.absoluteMouseX - map.activeSide / 2, map.absoluteMouseY - map.activeSide / 2]);
        const activeElement = map.assets.find(char => char.id === map.activeAssetId);
        if (!activeElement) return;
        activeElement.active = false;
        map.activeSide = 0;
        map.activeAssetId = '';
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

    map[axis] = targetOffset;
    map.toBeRedrawn = true;
}
