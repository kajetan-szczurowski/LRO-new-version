import { mapType, rightClickMenuType } from "./mapTypes";

export function handleRightClickMenu(map: mapType){
    if (!map.isContextMenuOpened) return;
    if (!mouseIsOnContextMenu(map)) return;
    if (!map.contextMenuY || !map.contextMenuHeight || !map.choosenContextMenu?.length) return;
    map.selectedContextMenuItem = Math.floor((map.mouseY - map.contextMenuY) / (map.contextMenuHeight / map.choosenContextMenu.length));
    map.toBeRedrawn = true;
}

export function initContextMenu(map: mapType){
    map.isContextMenuOpened = true;
    map.contextMenuX = map.mouseX;
    map.contextMenuY = map.mouseY;
    map.choosenContextMenu = getDefaultRightClickMenu();
    map.contexMenuFontStyle = `${map.contextMenuFontSize}px ${map.contextMenuFontName}`;
    map.canvas.font = map.contexMenuFontStyle;
    const widths = map.choosenContextMenu.map(section => map.canvas.measureText(section.label).width);
    map.contextMenuWidth = Math.max(...widths) + 2 * map.contextMargin;
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
    return[{label: 'Draw', event: (map: mapType) =>  drawContextMenu(map)}, {label: 'kopyto', event: () => {}}]
}

function drawContextMenu(map: mapType){
    map.choosenContextMenu = [{label: 'Line', event: () => {} }, { label: 'Circle', event: () => {} }];
}
