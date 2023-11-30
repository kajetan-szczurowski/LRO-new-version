import { mapType, characterType } from "./mapTypes";

export function drawAll(map: mapType){
    drawMap(map);
    map.assets.forEach(ass => {if (ass.isVisible) drawAsset(ass, map)});
    drawActiveAsset(map);
    drawMapBorderGraphic(map);
    map.frameDrawing = false;
}

function drawAsset(asset: characterType, map: mapType){
    if (!asset.img || ! asset.sourceWidth || !asset.sourceHeight || !asset.size) return;
    const onCanvasX = asset.x - map.x;
    const onCanvasY = asset.y - map.y;

    map.canvas.drawImage(asset.img, 0, 0, asset.sourceWidth, asset.sourceHeight, onCanvasX, onCanvasY, asset.size, asset.size);
    if (asset.active)
        drawRectangle({canvasContext: map.canvas, x:onCanvasX, y:onCanvasY, width:asset.size, 
                       height:asset.size, strokeStyle: map.presets.ASSET_ACTIVE_STROKE_STYLE, lineWidth: map.presets.ASSET_ACTIVE_LINE_WIDTH});

    asset.toBeRedrawn = false;
}

function drawActiveAsset(map: mapType){
    if (!map.mouseOnMap || !map.activeSide) return;
    drawRectangle({canvasContext: map.canvas, x: map.mouseX - map.activeSide / 2, y: map.mouseY - map.activeSide / 2, width: map.activeSide,
                   height: map.activeSide, fillStyle: map.presets.ASSET_ACTIVE_SHADOW_FILL_STYLE});
}

function drawMapBorderGraphic(map: mapType){
    if (!map.borderImgReady || !map.borderImg) return;
    map.canvas.drawImage(map.borderImg, 0,0, map.borderImg?.width, map.borderImg?.height, -10,-10, map.visibleWidth + 15, map.visibleHeight + 15); 

}

function drawMapPlaceholder(map: mapType){
    drawRectangle({canvasContext: map.canvas, x:0, y:0, width:map.rawCanvas.width, height:map.rawCanvas.height, fillStyle: map.presets.MAP_BORDER_COLOR});
    writeText({canvasContext: map.canvas, x: map.rawCanvas.width / 2, y: map.rawCanvas.height / 2,
               fillStyle: map.presets.PLAHOLDER_FILL_STYLE, font: map.presets.PLACEHOLDER_FONT,
               text:map.presets.PLACEHOLDER_TEXT, textAlign: map.presets.PLACEHOLDER_TEXT_ALIGNMENT});
}

function drawMap(map: mapType){
    if (!map.img) return;

    if (!map.sourceWidth){
        drawMapPlaceholder(map);
        return;
    }

    if (map.borderVisible) drawRectangle({canvasContext: map.canvas, x:0, y:0, width:map.visibleWidth, height:map.visibleHeight, fillStyle: map.presets.MAP_BORDER_COLOR});
    map.canvas.drawImage(map.img, map.sourceX, map.sourceY, map.onCanvasWidth, map.onCanvasHeight, map.onCanvasX, map.onCanvasY, map.onCanvasWidth, map.onCanvasHeight);
}

function drawRectangle({canvasContext, x, y, width, height, fillStyle = undefined, strokeStyle = undefined, lineWidth = undefined}:rectangleDrawingType){
    if (fillStyle){
        canvasContext.fillStyle = fillStyle;
        canvasContext.fillRect(x, y, width, height);
    }

    if (strokeStyle && lineWidth){
        canvasContext.lineWidth = lineWidth;
        canvasContext.strokeStyle = strokeStyle;
        canvasContext.strokeRect(x, y, width, height);
    }
    
}

function writeText({canvasContext, x, y, fillStyle = undefined, font, text, textAlign = undefined} : textWritingType){
    canvasContext.font = font;
    if (textAlign) canvasContext.textAlign = textAlign;
    if (fillStyle){
        canvasContext.fillStyle = fillStyle
        canvasContext.fillText(text, x, y);
    }

}

type rectangleDrawingType = {
    canvasContext: CanvasRenderingContext2D,
    x: number,
    y: number,
    width:number,
    height:number,
    fillStyle?:string,
    strokeStyle?:string,
    lineWidth?: number
}

type textWritingType = {
    canvasContext: CanvasRenderingContext2D,
    x: number,
    y: number,
    fillStyle?:string,
    font: string,
    text: string,
    textAlign?: 'start' | 'end' | 'center' | 'left' | 'right'
}