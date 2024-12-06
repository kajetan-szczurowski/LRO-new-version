import { mapType, rightClickMenuType } from "./mapTypes";
import { setDrawingModeShape, resetDrawingModeShape, ShapeNames } from "./mapDrawingMode";

export function handleRightClickMenu(map: mapType){
    if (!map.isContextMenuOpened) return;
    if (!map.contextMenuHeight || !map.choosenContextMenu || !map.choosenContextMenu.length) return;
    map.contextMenuItemHeight = (map.contextMenuHeight - 2 * map.contextMargin) / map.choosenContextMenu.length;
    if (!mouseIsOnContextMenu(map)) {
        handleMouseOutOfContextMenu(map);
        return;
    };

    map.selectedContextMenuItem = getSelectedContextMenuItem(map);
    map.toBeRedrawn = true;
}

function getSelectedContextMenuItem(map: mapType){
    if (!map.contextMenuY || !map.choosenContextMenu) return;
    if (!map.choosenContextMenu.length || !map.contextMenuHeight) return;
    if (map.mouseY < map.contextMenuY + map.contextMargin) return undefined;
    if (map.mouseY > map.contextMenuY + map.contextMenuHeight - map.contextMargin) return undefined;
    const mouseOnContextRelativeY = (map.mouseY - (map.contextMenuY + map.contextMargin));
    return Math.floor(mouseOnContextRelativeY / map.contextMenuItemHeight);
}

export function handleRightMenuMouseDown(map: mapType){
    if (!mouseIsOnContextMenu(map)){
        closeContextMenu(map);
        return;
    };

    if (!map.choosenContextMenu || map.selectedContextMenuItem === undefined) return;

    map.choosenContextMenu[map.selectedContextMenuItem].event(map);
}

function handleMouseOutOfContextMenu(map: mapType){
    map.selectedContextMenuItem = undefined;
    map.toBeRedrawn = true;
}

export function closeContextMenu(map: mapType){
    map.isContextMenuOpened = false;
    map.toBeRedrawn = true;
}


export function initContextMenu(map: mapType){
    map.isContextMenuOpened = true;
    map.contextMenuX = map.mouseX;
    map.contextMenuY = map.mouseY;
    map.choosenContextMenu = getDefaultRightClickMenu();
    setContextMenu(map);
    resetDrawingModeShape(map);
}

function setContextMenu(map: mapType){
    if (!map.choosenContextMenu) return;
    map.contexMenuFontStyle = `${map.contextMenuFontSize}px ${map.contextMenuFontName}`;
    map.canvas.font = map.contexMenuFontStyle;
    const widths = map.choosenContextMenu.map(section => map.canvas.measureText(section.label).width);
    map.contextMenuWidth = Math.max(Math.max(...widths) + 2 * map.contextMargin, map.contextMenuMinWidth);
    map.contextMenuHeight = 2 * map.contextMargin + map.contextItemsDistance * (map.choosenContextMenu.length - 1) + map.choosenContextMenu.length * map.contextMenuFontSize + map.contextExtraDownMargin;
    map.toBeRedrawn = true;
}

function mouseIsOnContextMenu(map: mapType){
    if (!map.mouseOnMap) return;
    if (!map.contextMenuX || !map.contextMenuWidth) return false;
    if (!map.contextMenuY || !map.contextMenuHeight) return false;

    const xOK = map.mouseX >= map.contextMenuX && map.mouseX <= map.contextMenuX + map.contextMenuWidth; 
    const yOK = map.mouseY >= map.contextMenuY && map.mouseY <= map.contextMenuY + map.contextMenuHeight; 
    return xOK && yOK;

}

function getDefaultRightClickMenu() : rightClickMenuType{
    return[{label: 'Draw', event: (map: mapType) =>  drawContextMenu(map)}, {label: 'kopyto', event: () => {console.log('kopyto')}}]
}

function drawContextMenu(map: mapType){
    map.choosenContextMenu = [{label: 'Line', event: (map: mapType) => chooseDrawingShape(map, 'line') }, { label: 'Circle', event: (map: mapType) => chooseDrawingShape(map, 'circle') },
        { label: 'Cone', event: (map: mapType) => chooseDrawingShape(map, 'cone') }
    ];
    setContextMenu(map);
}

function chooseDrawingShape(map: mapType, shape: ShapeNames){
    setDrawingModeShape(map, shape);
    closeContextMenu(map);
}