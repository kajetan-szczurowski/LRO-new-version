import { mapType, characterType } from "./mapTypes";

export function drawAll(map: mapType){
    drawMap(map);
    map.assets.forEach(ass => {if (ass.isVisible) drawAsset(ass, map)});
    drawActiveAsset(map);
    drawMeasure(map);
    drawMapBorderGraphic(map);
    drawMiniMap(map);
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

function drawMeasure(map: mapType){
    if (!map.measuring) return;
    const onCanvasX =  map.measurePoint.x - map.x;
    const onCanvasY = map.measurePoint.y - map.y;

    drawCircle({canvasContext: map.canvas, x: onCanvasX, y: onCanvasY, radius: map.measureRadius,
                fillStyle: map.presets.DISTANCE_CIRCLE_FILL_STYLE});

    drawLine({canvasContext: map.canvas, x1: onCanvasX, y1: onCanvasY, x2: map.mouseX, y2: map.mouseY,
        lineWidth: map.measureLineWidth, strokeStyle: map.presets.DISTANCE_LINE_COLOR});

    writeMeasureText(map);
}

function writeMeasureText(map:mapType){
    writeText({canvasContext: map.canvas, x:map.mouseX + 15, y: map.mouseY, font: map.measureFont, 
        fillStyle: map.presets.DISTANCE_FONT_FILL_STYLE, text: `${map.distance.feets}ft`, strokeStyle: map.presets.DISTANCE_FONT_STROKE_STYLE})

    writeText({canvasContext: map.canvas, x:map.mouseX + 15, y: map.mouseY + map.canvas.measureText('M').width * 1.2, font: map.measureFont, 
    fillStyle: map.presets.DISTANCE_FONT_FILL_STYLE, text: `${map.distance.meters}m`, strokeStyle: map.presets.DISTANCE_FONT_STROKE_STYLE})
}

function drawMapBorderGraphic(map: mapType){
    if (!map.borderImgReady || !map.borderImg) return;
    map.canvas.drawImage(map.borderImg, 0,0, map.borderImg?.width, map.borderImg?.height, -10,-10, map.visibleWidth + 15, map.visibleHeight + 15); 

}

function drawMapPlaceholder(map: mapType){
    drawRectangle({canvasContext: map.canvas, x:0, y:0, width:map.rawCanvas.width, height:map.rawCanvas.height, fillStyle: map.presets.MAP_BORDER_COLOR});
    writeText({canvasContext: map.canvas, x: map.rawCanvas.width / 2, y: map.rawCanvas.height / 2,
               fillStyle: map.presets.PLAHOLDER_FILL_STYLE, font: map.placeholderFont,
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

function drawMiniMap(map: mapType){
    if (!map.showMiniMap) return;
    if (!map.miniMapBorderX || !map.miniMapBorderY || !map.miniMapWidth || !map.miniMapHeight) return;
    if (!map.presets.MINI_MAP_BORDER_THICKNESS || !map.img ||!map.miniMapX || !map.miniMapY) return;

    drawRectangle({canvasContext: map.canvas, x: map.miniMapBorderX, y: map.miniMapBorderY, width: map.miniMapWidth + map.presets.MINI_MAP_BORDER_THICKNESS,
                  height: map.miniMapHeight + map.presets.MINI_MAP_BORDER_THICKNESS, strokeStyle: map.presets.MINI_MAP_BORDER_STROKE_STYLE, lineWidth: map.presets.MINI_MAP_BORDER_THICKNESS});

    map.canvas.drawImage(map.img, 0,0, map.img.width, map.img.height, map.miniMapX,map.miniMapY, map.miniMapWidth, map.miniMapHeight);

    if (!map.miniMapPointerWidth || !map.miniMapPointerHeight) return;
    if(map.miniMapCurrentX && map.miniMapCurrentY)
    drawRectangle({canvasContext: map.canvas, x:map.miniMapCurrentX, y: map.miniMapCurrentY, width: map.miniMapPointerWidth, height: map.miniMapPointerHeight,
                  strokeStyle: map.presets.MINI_MAP_PREVIEW_STROKE_STYLE, lineWidth: map.presets.MINI_MAP_PREVIEW_LINE_WIDTH})

    if (!map.miniMapPointerX || !map.miniMapPointerY)  return;
    if (!map.mouseOnMiniMap) return;
    drawRectangle({canvasContext: map.canvas, x:map.miniMapPointerX, y:map.miniMapPointerY, width:map.miniMapPointerWidth,
         height:map.miniMapPointerHeight, fillStyle: map.presets.MINI_MAP_POINTER_FILL_STYLE});
    
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

function writeText({canvasContext, x, y, fillStyle = undefined, font, text, textAlign = undefined, strokeStyle = undefined} : textWritingType){
    canvasContext.font = font;
    if (textAlign) canvasContext.textAlign = textAlign;

    if (strokeStyle){
        canvasContext.strokeStyle = strokeStyle;
        canvasContext.strokeText(text, x, y);

    }

    if (fillStyle){
        canvasContext.fillStyle = fillStyle
        canvasContext.fillText(text, x, y);
    }

}

function drawLine({canvasContext, x1, y1, x2, y2, strokeStyle = undefined, lineWidth = undefined}:lineDrawingType){
    if (lineWidth && strokeStyle){
        canvasContext.lineWidth = lineWidth;
        canvasContext.strokeStyle = strokeStyle;
        canvasContext.beginPath();
        canvasContext.moveTo(x1, y1);
        canvasContext.lineTo(x2, y2);
        canvasContext.stroke();
    }
}

function drawCircle({canvasContext, x, y, radius, strokeStyle, fillStyle}: circleDrawingType){
    drawArc({canvasContext: canvasContext, x: x, y: y, radius: radius,
            strokeStyle: strokeStyle, fillStyle: fillStyle,
            startAngle: 0, endAngle: 2 * Math.PI});
}

function drawArc({canvasContext, x, y, radius, startAngle, endAngle, counterClockwise = false, fillStyle = undefined, strokeStyle = undefined}: arcDrawingType){
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, startAngle, endAngle, counterClockwise);

    if (fillStyle){
        canvasContext.fillStyle = fillStyle;
        canvasContext.fill();
        return;
    }

    if (strokeStyle){
        canvasContext.strokeStyle = strokeStyle;
        canvasContext.stroke();
        return;
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

type circleDrawingType = {
    canvasContext: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius:number,
    fillStyle?:string,
    strokeStyle?:string
}

type arcDrawingType = circleDrawingType &{
    startAngle: number,
    endAngle: number,
    counterClockwise?: boolean,

}

type lineDrawingType = {
    canvasContext: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    strokeStyle?:string,
    lineWidth?: number
}

type textWritingType = {
    canvasContext: CanvasRenderingContext2D,
    x: number,
    y: number,
    fillStyle?:string,
    strokeStyle?:string
    font: string,
    text: string,
    textAlign?: 'start' | 'end' | 'center' | 'left' | 'right'
}