import { mapType, rightClickMenuType } from "./mapTypes";

export function handleRightClickMenu(map: mapType){
    if (!map.isContextMenuOpened) return;
    if (!map.choosenContextMenu) map.choosenContextMenu = getDefaultRightClickMenu();

    
    map.canvas.font = `${map.mapContextMenuFontSize}px ${map.mapContextMenuFontName}`;
    // const widths = map.choosenContextMenu.map(section => map.canvas.measureText(section.label).width);
    const widths = map.choosenContextMenu.map(section => map.canvas.measureText(section.label).width);

    map.mapContextMenuWidth = Math.max(...widths) + 2 * map.mapContextMargin;
    map.mapContextMenuHeight = map.choosenContextMenu.length * map.mapContextMenuFontSize + 1 * map.mapContextMargin;
}

function getDefaultRightClickMenu() : rightClickMenuType{
    return[{label: 'Draw', event: (map: mapType) =>  drawContextMenu(map)}]
}

function drawContextMenu(map: mapType){
    map.choosenContextMenu = [{label: 'Line', event: () => {} }, { label: 'Circle', event: () => {} }];
}
