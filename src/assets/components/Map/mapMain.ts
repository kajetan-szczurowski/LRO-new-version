import { getDefaultMap, mapType, mapPresets, characterType } from "./mapTypes";
import * as drawing from "./mapDrawing"
import * as controls from "./mapControls"
import * as characters from "./mapCharacters"

export function processMap(canvasId : string, presets:mapPresets, charactersArray: characterType[], controllFunction: Function, interval : number = 50){

    Object.freeze(presets);
    let mapData: mapType;


    setInterval(() => {
        if (mapData === undefined) mapIni(presets);
        if (mapData === undefined) return;
        mapData = performMapLogic(mapData, charactersArray);
        if (mapData.toBeRedrawn) {
                mapData.frameDrawing = true;
                requestAnimationFrame(() => drawing.drawAll(mapData));
                mapData.toBeRedrawn = false;
        }

    }, interval)

    function mapIni(presets: mapPresets){
        const canvasObject = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvasObject) return;
        const canvas = canvasObject.getContext('2d');
        if (!canvas) return;
        mapData = getDefaultMap(canvas, canvasObject, presets, controllFunction);
        controls.canvasEventListeners(mapData);
    }

}

function performMapLogic(map: mapType, charactersSource: characterType[]){
    if (map.currentGraphicUrl !== map.graphicUrl) loadImage(map);
    if (map.presets.BORDER_GRAPHIC_URL && !map.borderImg) loadBorderImg(map)
    if (!map.visibleWidth || map.resized) calculateCanvasSize(map);
    controls.handleScrolling(map);
    checkForCharacters(map,charactersSource);
    characters.handleCharacters(map);
    checkForRedrawning(map);

    return map;
}


function checkForCharacters(map: mapType, charactersSource: characterType[]){
    map.assets = [...charactersSource];
}

function loadBorderImg(map:mapType){
    map.borderImg = document.createElement('img');
    map.borderImg.src = map.presets.BORDER_GRAPHIC_URL;
    map.borderImg.onload = () => map.borderImgReady = true;
}

export function loadImage(item: characterType | mapType){
    if (!item.img) item.img = document.createElement('img');
    item.img.src = item.graphicUrl;
    item.currentGraphicUrl = item.graphicUrl;

    item.img.onload = function(){
        if (!item.img) return;
        item.sourceWidth = item.img?.width;
        item.sourceHeight = item.img?.height;
    }
}

function calculateCanvasSize(map: mapType){
    const maxWidth = window.innerWidth * map.presets.MAP_WIDTH_PERCENT / 100;
    const maxHeight = window.innerHeight * map.presets.MAP_HEIGHT_PERCENT / 100;
    
    if(!map.sourceHeight || !map.sourceWidth){
        map.rawCanvas.width = maxWidth;
        map.rawCanvas.height = maxHeight;
        map.toBeRedrawn = true;
        return;
    }
   
    map.visibleWidth = Math.min(maxWidth, map.sourceWidth);
    map.visibleHeight = Math.min(maxHeight, map.sourceHeight);
    map.rawCanvas.width = map.visibleWidth;
    map.rawCanvas.height = map.visibleHeight;
    map.toBeRedrawn = true;
}

function checkForRedrawning(map: mapType){
    map.assets.forEach(item => {if (item.toBeRedrawn) map.toBeRedrawn = true});
}

