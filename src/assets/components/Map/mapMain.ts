import { getDefaultMap, mapType, mapPresets, characterType } from "./mapTypes";
import * as drawing from "./mapDrawing"
import * as controls from "./mapControls"
import * as characters from "./mapCharacters"
import * as mapMath from "./mapMath"
import { Socket } from "socket.io-client";
import { limitValue } from "./mapControls";

export function processMap(canvasId : string, presets:mapPresets, charactersArray: characterType[], controllFunction: Function, socket:Socket, interval : number = 50){

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
        socket.on('map-control', (parameters) => {mapData.controllFunction(parameters.controlWord, parameters.args, mapData)});
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
    controls.miniMapControl(map);
    controls.handleMeasure(map);
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
        calculateTextsSizes(map); //For placeholder
        return;
    }
   
    map.visibleWidth = Math.min(maxWidth, map.sourceWidth);
    map.visibleHeight = Math.min(maxHeight, map.sourceHeight);
    map.rawCanvas.width = map.visibleWidth;
    map.rawCanvas.height = map.visibleHeight;
    map.toBeRedrawn = true;
    calculateMiniMapGeometry(map);
    calculateTextsSizes(map);
}

function calculateMiniMapGeometry(map:mapType){
    if (!map.presets.MINI_MAP_WIDTH_PERCENT || !map.presets.MINI_MAP_HEIGHT_PERCENT) return;
    if (!map.presets.MINI_MAP_RIGHT_MARGIN_PERCENT || !map.presets.MINI_MAP_BOTTOM_MARGIN_PERCENT) return;
    if (!map.img || !map.presets.MINI_MAP_BORDER_THICKNESS) return;
    const maxWidth = map.rawCanvas.width * map.presets.MINI_MAP_WIDTH_PERCENT / 100;
    const maxHeight = map.rawCanvas.height * map.presets.MINI_MAP_HEIGHT_PERCENT / 100;
    const marginRight = map.rawCanvas.width * map.presets.MINI_MAP_RIGHT_MARGIN_PERCENT / 100;
    const marginBottom = map.rawCanvas.height * map.presets.MINI_MAP_BOTTOM_MARGIN_PERCENT / 100;
    const ratio = map.img.width / map.img.height;
    
    const canvasWidth = ratio >= 1? maxWidth : maxHeight * ratio;
    const canvasHeight = ratio >= 1? maxWidth / ratio : maxHeight;
    const mapX = limitValue(map.x, 0, map.img.width - map.rawCanvas.width);
    const mapY = limitValue(map.y, 0, map.img.height - map.rawCanvas.height);

    map.miniMapBorderX = map.rawCanvas.width - marginRight - canvasWidth;
    map.miniMapBorderY = map.rawCanvas.height - marginBottom - canvasHeight;
    map.miniMapX = map.miniMapBorderX + map.presets.MINI_MAP_BORDER_THICKNESS / 2;
    map.miniMapY = map.miniMapBorderY + map.presets.MINI_MAP_BORDER_THICKNESS / 2;
    map.miniMapWidth = canvasWidth - map.presets.MINI_MAP_BORDER_THICKNESS;
    map.miniMapHeight = canvasHeight - map.presets.MINI_MAP_BORDER_THICKNESS;
    map.miniMapPointerWidth = map.rawCanvas.width / map.img.width * map.miniMapWidth;
    map.miniMapPointerHeight = map.rawCanvas.height / map.img.height * map.miniMapHeight;
    map.miniMapCurrentX = map.miniMapX + mapX / map.img.width * map.miniMapWidth;
    map.miniMapCurrentY = map.miniMapY + mapY / map.img.height * map.miniMapHeight;
}

function calculateTextsSizes(map:mapType){
    const diagonal = mapMath.hypotenuseFromPitagoras(map.rawCanvas.width, map.rawCanvas.height);
    const measureFontSize = diagonal * map.presets.DISTANCE_FONT_SIZE_PERCENT / 100;
    const placeholderFontSize = diagonal * map.presets.PLACEHOLDER_TEXT_SIZE_PERCENT / 100;
    map.measureFont = `${measureFontSize}px ${map.presets.DISTANCE_FONT}`;
    map.placeholderFont = `${placeholderFontSize}px ${map.presets.PLACEHOLDER_FONT}`;
}

function checkForRedrawning(map: mapType){
    map.assets.forEach(item => {if (item.toBeRedrawn) map.toBeRedrawn = true});
}

