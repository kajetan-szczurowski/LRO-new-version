import { mapType, characterType, ConditionDrawingData } from "./mapTypes";
import { DrawingData } from "./mapDrawingMode";
import { degreesToRadians } from "./mapMath";
import { showCoordinates, hideConditions } from "../CharacterBox/Settings";


export function drawAll(map: mapType){
    drawMap(map);
    map.assets.forEach(ass => {if (ass.isVisible) drawAsset(ass, map)});
    drawActiveAsset(map);
    drawMapBorderGraphic(map);
    drawUserDrawings(map);
    drawDrawingDuringEdit(map);
    drawMeasure(map);
    drawMiniMap(map);
    drawCoordinates(map);
    drawPing(map);
    drawHP(map);
    drawConditions(map);
    drawContextMenu(map);
    map.frameDrawing = false;

}

function drawDrawingDuringEdit(map: mapType){
    if (!map.editingDrawing.userName || !map.drawingSelectionRectangle) return;
    const dontShowRectangle = map.editingDrawing.shapeType === 'line' && map.editingDrawingOperation === 'rotating';
    if (!dontShowRectangle) drawSelectedDrawingRectangle(map);
    if (map.editingDrawingOperation === '') return;
    drawUsersShape(map, map.editingDrawing.shapeType, false, map.editingDrawing, true);

}

function drawSelectedDrawingRectangle(map: mapType){
    if (!map.drawingSelectionRectangle) return;
    map.canvas.setLineDash([5, 5]);
    const {x, y, width, height} = {...map.drawingSelectionRectangle};
    drawRectangle({canvasContext: map.canvas, x: x - map.x, y: y - map.y, width: width, height: height, strokeStyle: 'red', lineWidth: 1});
    map.canvas.setLineDash([]);
}

function drawUserDrawings(map: mapType){
    map.drawnShapes.forEach(userShapes => userShapes.shapes.forEach(shape => drawUsersShape(map, shape.shapeType, false, shape)));
}

// function drawDrawingModePreview(map: mapType){
//     if (!map.drawingModeShape) return;
//     drawUsersShape(map, map.drawingModeShape);
//     writeMeasureText(map);
// }


function drawUsersShape(map: mapType, shapeName: string, preview = true, customShape: DrawingData | null = null, shapeDuringEditing: boolean = false){
    //preview - obsolete, migth clean up later
    if (!shapeDuringEditing && map.editingDrawingOperation === 'resizing' && customShape){
        if (map.editingDrawing.id === customShape.id) return;
    }

    if (!preview && !customShape) return;
    switch (shapeName){
        case 'circle':
            // if (preview) drawPreviewCircle(map);
             if (customShape) drawCircle({canvasContext: map.canvas, x: customShape.x - map.x, y: customShape.y - map.y,
                radius: customShape.size, fillStyle: customShape.color});
            break;
        
        case 'cone':
            // if (preview) drawPreviewCone(map);
             if (customShape) drawCone({canvasContext: map.canvas, x: customShape.x - map.x , y: customShape.y - map.y,
                radius: customShape.size, fillStyle: customShape.color, radians: degreesToRadians(customShape.angle)});
            break;

        case 'line':
            // if (preview) drawPreviewLine(map);
             if (customShape) drawUsersLine(map, customShape);
            break;
    }
}

function drawCoordinates(map: mapType){
    if (!showCoordinates.value) return;
    writeText({canvasContext: map.canvas, x:map.presets.COORDINATES_BOX_X, y: map.presets.COORDINATES_BOX_Y, font: map.presets.COORDINATES_TEXT_FONT, 
        fillStyle: map.presets.DISTANCE_FONT_FILL_STYLE, text: `x: ${Math.round(map.absoluteMouseX)} y: ${Math.round(map.absoluteMouseY)}`, 
        strokeStyle: map.presets.DISTANCE_FONT_STROKE_STYLE})
}

function drawOneCondition(map:mapType, condition: ConditionDrawingData){
    drawRectangle({canvasContext: map.canvas, x: condition.x -5, y: condition.y - 5, width: condition.width, height: condition.height, fillStyle: '#493f33'});
    drawRectangle({canvasContext: map.canvas, x: condition.x -5, y: condition.y - 5, width: condition.width, height: condition.height, strokeStyle: 'black', lineWidth: 2});
    writeText({canvasContext: map.canvas, x: condition.x, y: condition.y + 10, font: map.presets.CONDITION_FONT, textAlign: 'left', text: condition.label, fillStyle: map.presets.HP_BAR_TEXT_COLOR});
    writeText({canvasContext: map.canvas, x: condition.forceX, y: condition.y + 10, font: map.presets.CONDITION_FONT, textAlign: 'left', text: String(condition.force), fillStyle: map.presets.HP_BAR_TEXT_COLOR});
}

function drawConditions(map: mapType){
    if (hideConditions.value) return;
    if (!map.HoveredCharacterConditions || map.HoveredCharacterConditions.length === 0) return;
    map.HoveredCharacterConditions.forEach(condition => {
        drawOneCondition(map, condition);
    });
}

function drawHP(map: mapType){
    if (!map.maxAssetHP) return;
    if (map.currentAssetHP === undefined || map.currentAssetHP === null) return;
    if (map.measuring) return;
    const borderX = map.HPBarX - map.presets.HP_BAR_BORDER_THICKNESS / 2;
    const borderWidth = map.HPBarWrapperWidth + map.presets.HP_BAR_BORDER_THICKNESS;
    const borderY = map.HPBarY - map.presets.HP_BAR_BORDER_THICKNESS / 2;
    const borderHeight = map.presets.HP_BAR_HEIGHT + map.presets.HP_BAR_BORDER_THICKNESS;
    //TODO: Styling
    drawRectangle({canvasContext: map.canvas, x: map.HPBarX, y: map.HPBarY, width: map.HPBarWrapperWidth, height: map.presets.HP_BAR_HEIGHT, fillStyle: map.presets.HP_BAR_EMPTY_COLOR});
    drawRectangle({canvasContext: map.canvas, x: borderX, y: borderY, width: borderWidth, height: borderHeight, strokeStyle: map.presets.HP_BAR_BORDER_COLOR, lineWidth: map.presets.HP_BAR_BORDER_THICKNESS});
    drawRectangle({canvasContext: map.canvas, x: map.HPBarX, y: map.HPBarY, width: map.HPBarFilledWidth, height: map.presets.HP_BAR_HEIGHT, fillStyle: map.presets.HP_BAR_COLOR   });
    if (map.HPBarText){
        const textY = map.HPBarY + map.presets.HP_BAR_TEXT_OFFSET_Y;
        writeText({canvasContext: map.canvas, x: map.HPBarTextX, y: textY, font: map.presets.HP_BAR_FONT, fillStyle: map.presets.HP_BAR_TEXT_COLOR, text: map.HPBarText, textAlign: map.presets.HP_BAR_TEXT_ALIGN });
    }
    // writeText({canvasContext: map.canvas, x: map.visibleWidth / 2 - 50, y: 20,  font: map.contexMenuFontStyle ?? '', text: `${map.currentAssetHP}/${map.maxAssetHP}`, fillStyle: map.contextMenuTextColorHover});
}

function drawUsersLine(map: mapType, lineData: DrawingData){
    if (!lineData.linePoint1 || !lineData.linePoint2) return;
    const x1 = lineData.linePoint1.x - map.x;
    const y1 = lineData.linePoint1.y - map.y;
    const x2 = lineData.linePoint2.x - map.x;
    const y2 = lineData.linePoint2.y - map.y;
    drawLine({canvasContext: map.canvas, x1: x1, y1: y1, x2: x2, y2: y2, lineWidth: 6, 
        strokeStyle: lineData.color});
}

// function drawPreviewCircle(map: mapType){
//     drawCircle({canvasContext: map.canvas, x: map.editingDrawing.x, y: map.editingDrawing.y, 
//         radius: map.editingDrawing.size, fillStyle: '#000'});
// }

// function drawPreviewCone(map: mapType){
//     drawCone({canvasContext: map.canvas, x: map.editingDrawing.x, y: map.editingDrawing.y, radius: map.editingDrawing.size, fillStyle: '#000',
//         radians: degreesToRadians(map.editingDrawing.angle)});
// }

// function drawPreviewLine(map: mapType){
//     if (!map.editingDrawing.linePoint1 || !map.editingDrawing.linePoint2) return;
//     const x1 = map.editingDrawing.linePoint1.x;
//     const y1 = map.editingDrawing.linePoint1.y;
//     const x2 = map.editingDrawing.linePoint2.x;
//     const y2 = map.editingDrawing.linePoint2.y;
//     drawLine({canvasContext: map.canvas, x1: x1, y1: y1, x2: x2, y2: y2, lineWidth: 6, 
//             strokeStyle: '#000'});
// }

function drawContextMenu(map: mapType){
    if (!map.isContextMenuOpened) return;
    if (!map.contextMenuX || !map.contextMenuY || !map.contextMenuWidth || !map.contextMenuHeight) return;
    if (!map.choosenContextMenu || ! map.contexMenuFontStyle ) return;

    drawRectangle({canvasContext: map.canvas, x:map.contextMenuX, y:map.contextMenuY, width: map.contextMenuWidth, 
            height:map.contextMenuHeight, strokeStyle: map.contextMenuBorderColor,
             lineWidth: map.presets.ASSET_ACTIVE_LINE_WIDTH, fillStyle: map.contextMenuBackgroundColor});

    let textY = map.contextMenuY + map.contextMargin;
    let label: string;
    const textX = map.contextMenuX + map.contextMargin; 
    for (let index = 0; index < map.choosenContextMenu.length; index++){

        if (index === map.selectedContextMenuItem) 
            drawRectangle({canvasContext: map.canvas, x: textX, y: textY, height: map.contextMenuItemHeight, 
                width: map.contextMenuWidth - 2*map.contextMargin, fillStyle: map.contextMenuBackgroundColorHover});

        textY += map.contextMenuFontSize;
        label = map.choosenContextMenu[index].label; 
        const textColor = index === map.selectedContextMenuItem? map.contextMenuTextColorHover: map.contextMenuTextColor;
        

        writeText({canvasContext: map.canvas, x:textX, y: textY, font: map.contexMenuFontStyle, 
            fillStyle: textColor, text: label})
        textY += map.contextItemsDistance;
    }
    
}

function drawAsset(asset: characterType, map: mapType){
    if (!asset.img || ! asset.sourceWidth || !asset.sourceHeight || !asset.size) return;
    const onCanvasX = asset.x - map.x;
    const onCanvasY = asset.y - map.y;
    let imageSource = asset.img;
    let sourceWidth = asset.sourceWidth;
    let sourceHeight = asset.sourceHeight;
    if (asset.maxHP) 
        if (asset.currentHP === 0 && map.deadAssetImage.img){
            imageSource = map.deadAssetImage.img;
            sourceWidth = map.deadAssetImage.img.width;
            sourceHeight = map.deadAssetImage.img.height;
        } 
    map.canvas.drawImage(imageSource, 0, 0, sourceWidth, sourceHeight, onCanvasX, onCanvasY, asset.size, asset.size);
    if (asset.active)
        drawRectangle({canvasContext: map.canvas, x:onCanvasX, y:onCanvasY, width:asset.size, 
                       height:asset.size, strokeStyle: map.presets.ASSET_ACTIVE_STROKE_STYLE, lineWidth: map.presets.ASSET_ACTIVE_LINE_WIDTH});

    asset.toBeRedrawn = false;

    //<Miron's aura, please make this proper later>
    if (asset.name.toLowerCase() !== 'miron') return;
    const MIRON_AURA_KEY = 'LRO-application-Miron-aura';
    const mironAuraRadius = Number(sessionStorage.getItem(MIRON_AURA_KEY)) ?? 0;
    if (!mironAuraRadius) return;
    const circleX = onCanvasX + asset.size / 2;
    const circleY = onCanvasY + asset.size / 2;
    const AURA_COLOR_KEY = 'LRO-application-aura-color';
    const auraBaseColor = localStorage.getItem(AURA_COLOR_KEY) ?? '#000000';
    const auraFillColor = `${auraBaseColor}50`;
    drawCircle({canvasContext: map.canvas, x: circleX, y: circleY, radius: mironAuraRadius * 10, fillStyle: auraFillColor});
    //</Miron's aura>
}

function drawActiveAsset(map: mapType){
    if (!map.mouseOnMap || !map.activeSide) return;
    drawRectangle({canvasContext: map.canvas, x: map.mouseX - map.activeSide / 2, y: map.mouseY - map.activeSide / 2, width: map.activeSide,
                   height: map.activeSide, fillStyle: map.presets.ASSET_ACTIVE_SHADOW_FILL_STYLE});
}

function drawPing(map: mapType){
    if (!map.pinging) return;
    if (!map.pingX || !map.pingY || !map.pingFilledRadius || !map.pingCutRadius) return;
    drawTorus({canvasContext: map.canvas, x: map.pingX - map.x, y: map.pingY - map.y, fullRadius: map.pingFilledRadius, emptyRadius: map.pingCutRadius, fillStyle: map.presets.PING_FILL_STYLE});
    if (map.showMiniMap && map.pingVisibleOnMiniMap) drawPingOnMiniMap(map);
}

function drawPingOnMiniMap(map: mapType){
    if (!map.miniMapPingX || !map.miniMapPingY || !map.miniMapPingRadius) return;
    drawCircle({canvasContext: map.canvas, x: map.miniMapPingX, y: map.miniMapPingY, radius: map.miniMapPingRadius, fillStyle: map.presets.PING_MINI_MAP_COLOR});
}

function drawMeasure(map: mapType){
    if (!map.measuring) return;
    const onCanvasX =  map.measurePoint.x - map.x;
    const onCanvasY = map.measurePoint.y - map.y;
    const lineStyle = map.distanceOverflowing? map.presets.DISTANCE_OVERFLOWING_LINE_COLOR : map.presets.DISTANCE_LINE_COLOR;


    drawCircle({canvasContext: map.canvas, x: onCanvasX, y: onCanvasY, radius: map.measureRadius,
                fillStyle: map.presets.DISTANCE_CIRCLE_FILL_STYLE});

    drawLine({canvasContext: map.canvas, x1: onCanvasX, y1: onCanvasY, x2: map.mouseX, y2: map.mouseY,
        lineWidth: map.measureLineWidth, strokeStyle: lineStyle});

    writeMeasureText(map);
}

function writeMeasureText(map:mapType){
    const textFilStyle = map.distanceOverflowing? map.presets.DISTANCE_OVERFLOWING_FONT_FILL_STYLE : map.presets.DISTANCE_FONT_FILL_STYLE;
    const textStrokeStyle = map.distanceOverflowing? map.presets.DISTANCE_OVERFLOWING_FONT_STROKE_STYLE : map.presets.DISTANCE_FONT_STROKE_STYLE;

    writeText({canvasContext: map.canvas, x:map.mouseX + 15, y: map.mouseY, font: map.measureFont, 
        fillStyle: textFilStyle, text: `${map.distance.feets} ft`, strokeStyle: textStrokeStyle})

    writeText({canvasContext: map.canvas, x:map.mouseX + 15, y: map.mouseY + map.canvas.measureText('M').width * 1.2, font: map.measureFont, 
    fillStyle: textFilStyle, text: `${map.distance.meters} m`, strokeStyle: textStrokeStyle})
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

function drawCone({canvasContext, x, y, radius, radians, fillStyle = undefined, strokeStyle = undefined}: coneDrawingType){
    canvasContext.beginPath();
    canvasContext.moveTo(x, y); 
    canvasContext.arc(x, y, radius, radians, 0.5 * Math.PI + radians);
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

function drawTorus({canvasContext, x, y, fullRadius, emptyRadius, fillStyle = undefined} : torusDrawingType){
    if (fillStyle) canvasContext.fillStyle = fillStyle;
    canvasContext.beginPath();
    canvasContext.arc(x, y, fullRadius, 0, Math.PI * 2, false); // outer - filled
    canvasContext.arc(x, y, emptyRadius, 0, Math.PI * 2, true); // inner - unfilled
    canvasContext.fill();
}

type torusDrawingType = {
    canvasContext: CanvasRenderingContext2D,
    x: number,
    y: number,
    fullRadius: number,
    emptyRadius: number,
    fillStyle?: string
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

type coneDrawingType = circleDrawingType &{
    radians: number
}

type lineDrawingType = {
    canvasContext: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    strokeStyle?:string,
    lineWidth?: number
    rotationRadians?: number
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