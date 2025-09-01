import { characterType, mapType } from "./mapTypes";
import { loadImage } from "./mapMain";
import * as geometry from "./mapMath";
import { stepSounds, initiativeAnimationHidden } from "../CharacterBox/Settings";
import { mapCharacters } from "./Map";


export function handleCharacters(map:mapType){
    let noCharasterIsMoving = true;
    map.assets.forEach(character => {
        if (!character.img) loadImage(character);
        handleCharacterVisibility(character, map);
        if (checkForMoving(character)) {
            handleMove(character, map);
            stepsSoundPlay();
            noCharasterIsMoving = false;
        }
    })
    if (noCharasterIsMoving) stepsSoundStop();

    map.initiative.forEach(ini => {
        if (checkForMoving(ini)) handleMove(ini, map, 30);
    })
}

export function isMouseOnCharacter(map:mapType, character:characterType){
    if(!character || !character.size) return;
    const [x, y, lowX, lowY, bigX, bigY] = [map.absoluteMouseX, map.absoluteMouseY, character.x, character.y, character.x + character.size, character.y + character.size];
    return x >= lowX && y >= lowY && x <= bigX && y <= bigY;
}

export function handleCharactersDataChange(map: mapType, newData: characterType[]){
    let characterReadFromHash: characterType | undefined;
    if (newData.length) newData.forEach((a: any) => {
          map.assetsHashedTable.set(a.id, a);
        });
        for (let i = 0; i < map.assets.length; i++){
          characterReadFromHash = map.assetsHashedTable.get(map.assets[i].id);
          if (!characterReadFromHash) continue;
          map.assets[i].conditions = characterReadFromHash.conditions;
          map.assets[i].currentHP = characterReadFromHash.currentHP;
          map.assets[i].maxHP = characterReadFromHash.maxHP;
          map.assets[i].name = characterReadFromHash.name;
        }
        mapCharacters.value = map.assets;
}

export function handleInitativeAnimation(map:mapType){
    if (!map.initiativeAnimationStage) return;

    switch (map.initiativeAnimationStage){
        case 1: {
            map.initiativeElementsToMoveDown.forEach(element => element.aimedY = element.y + map.presets.INITIATIVE_ASSET_SIZE);
            map.initiativeElementsToMoveLeft.forEach(element => element.aimedX = element.x - map.initiativeAnimationDistanceX);
            map.initiativeAnimationStage = 2;
            return;
        }

        case 2: {
            for (let i = 0; i< map.initiative.length; i++) 
                if (map.initiative[i].aimedX !== map.initiative[i].x || map.initiative[i].aimedY !== map.initiative[i].y) return;
            const count = map.initiativeElementsToMoveLeft.length;
            const distanceX = count * (map.presets.INITIATIVE_ASSET_SIZE + map.presets.INITIATIVE_DISTANCE_BETWEEN_ASSETS);
            map.initiativeElementsToMoveDown.forEach(element => element.aimedX = element.x + distanceX);
            map.initiativeAnimationStage = 3;
            return;
        }

        case 3:{
            for (let i = 0; i< map.initiativeElementsToMoveDown.length; i++)
                if (map.initiativeElementsToMoveDown[i].aimedX !== map.initiativeElementsToMoveDown[i].x) return;
            map.initiativeElementsToMoveDown.forEach(element => element.aimedY = map.initiativeYPosition);
            map.initiativeAnimationStage = 4;
            return;
        }

        case 4:{
            for (let i = 0; i< map.initiativeElementsToMoveDown.length; i++)
                if (map.initiativeElementsToMoveDown[i].aimedY !== map.initiativeElementsToMoveDown[i].y) return;
            map.initiative.sort((a, b) => a.x - b.x);
            map.initiativeAnimationStage = 0;
        }
    }
}

export function handleInitiativeChangeCurrent(newCurrentID: string, map: mapType){
    if (!map.inititiveCashedFromServer) return;
    map.inititiveCashedFromServer.currentID = newCurrentID;

    if (map.inititiveCashedFromServer.queue.length > map.initiative.length || initiativeAnimationHidden.value){
        prepareInitative(map);
        return;
    }

    const startX = map.initiative[0].x;
    map.initiativeElementsToMoveDown = [];
    map.initiativeElementsToMoveLeft = [];
    let temporaryArray = map.initiativeElementsToMoveDown;
    let foundFirstMatching = false;

    for (let i = 0; i < map.initiative.length; i++){
        if (newCurrentID === map.initiative[i].id && !foundFirstMatching){
            foundFirstMatching = true;
            if (i === 0) return; //job not required
            temporaryArray = map.initiativeElementsToMoveLeft;
            map.initiativeAnimationDistanceX = map.initiative[i].x - startX;
        }
        temporaryArray.push(map.initiative[i]);
    }

    map.initiativeAnimationStage = 1;
}

export function handleInitiativeFromServer(queue: {id: string, name: string}[], currentID: string, map: mapType){
    map.initiative = [];
    if (!queue || !queue.length) return;
    map.inititiveCashedFromServer = {queue, currentID};
    prepareInitative(map);
}

export function prepareInitative(map: mapType){
    if (!map.inititiveCashedFromServer) return;
    map.initiativeYPosition = map.presets.INITIATIVE_Y_POSITION_PERCENTAGE * map.rawCanvas.height / 100;
    map.initiative = [];
    const {initativesCount, initiativeMargin} = getInitiativeGeometry(map);
    map.initiativeLeftDecoratorX = initiativeMargin;
    const {queue, currentID} = map.inititiveCashedFromServer;
    let indexOfActive: number | null = null;
    for (let i = 0; i < queue.length; i++){
        if (queue[i].id === currentID) indexOfActive = i;
    }

    const queueStartIndex = indexOfActive ?? 0;
    let queueIndex = queueStartIndex;
    let currentX = initiativeMargin + map.presets.INITIATIVE_DECORATOR_WIDTH + map.presets.INITIATIVE_PADDING;
    const increaseX = map.presets.INITIATIVE_ASSET_SIZE + map.presets.INITIATIVE_DISTANCE_BETWEEN_ASSETS;
    
    for (let i = 0; i < initativesCount; i++){
        if (queueIndex >= queue.length) queueIndex = 0;
        if (!map.assetsHashedTable.has(queue[queueIndex].id)) continue;
        const currentCharacter = map.assetsHashedTable.get(queue[queueIndex].id);
        if (!currentCharacter) return;
        const newIniElement = {...currentCharacter};
        newIniElement.size = map.presets.INITIATIVE_ASSET_SIZE;
        newIniElement.y = map.initiativeYPosition;
        newIniElement.x = currentX;
        newIniElement.aimedY = newIniElement.y;
        newIniElement.aimedX = newIniElement.x;
        map.initiative.push(newIniElement);
        currentX += increaseX;
        queueIndex++;
    }
    map.initiativeRightDecoratorX = currentX;
    map.initiative.sort((a, b) => a.x - b.x);
}

function getInitiativeGeometry(map: mapType){
    const presets = map.presets;
    const reservedWidth = Math.floor(map.rawCanvas.width * presets.INITIATIVE_MAX_WIDTH_PERCENTAGE / 100);
    const decoratorsWidth = 2 * presets.INITIATIVE_DECORATOR_WIDTH;
    const paddingsWidth = 2 * presets.INITIATIVE_PADDING;
    const lengthNumerator = reservedWidth - decoratorsWidth - paddingsWidth + presets.INITIATIVE_DISTANCE_BETWEEN_ASSETS;
    const lengthDenominator = presets.INITIATIVE_ASSET_SIZE + presets.INITIATIVE_DISTANCE_BETWEEN_ASSETS;
    const length = Math.floor(lengthNumerator / lengthDenominator);
    const trueWidth = decoratorsWidth + paddingsWidth + length * presets.INITIATIVE_ASSET_SIZE + (length - 1) * presets.INITIATIVE_DISTANCE_BETWEEN_ASSETS;
    const margin = (map.rawCanvas.width - trueWidth) / 2;
    return {initativesCount: length, initiativeMargin: margin};  
}

function stepsSoundPlay(){
    if (!stepSounds.value) return;
    const stepsAudio: HTMLAudioElement | null = document.querySelector('.steps-audio');
    if (stepsAudio) stepsAudio.play();
}

function stepsSoundStop(){
    const stepsAudio: HTMLAudioElement | null = document.querySelector('.steps-audio');
    if (stepsAudio) stepsAudio.pause();
}

function handleCharacterVisibility(asset: characterType, map: mapType){
    if(!asset.sourceWidth || !asset.sourceHeight) return;
    if (!asset.size) asset.size = map.presets.ASSET_SIZE;
    const lowX = asset.x + asset.size >= map.x;
    const lowY = asset.y + asset.size >= map.y;
    const bigX = asset.x <= map.x + map.visibleWidth;
    const bigY = asset.y <= map.y + map.visibleHeight;
    asset.isVisible = lowX && lowY && bigX && bigY;
    if (!asset.isDrawn) asset.toBeRedrawn = true;
}

function checkForMoving(asset: characterType){
    if (!asset.aimedX || !asset.aimedY) return false;
    return asset.aimedX !== asset.x || asset.aimedY !== asset.y;
}

function handleMove(asset: characterType, map:mapType, customStepSize: number = 0){
    const move: moveType = {direction: undefined, values: {x:0, y:0}};
    move.direction = getMoveDirection(asset);
    move.values = getMoveIncrease(asset, move, customStepSize || map.presets.ASSET_STEP_SIZE);
    asset.x = move.values.x;
    asset.y = move.values.y;
    asset.toBeRedrawn = true;
}

function getMoveDirection(asset:characterType){
    if (!asset.aimedX || !asset.aimedY) return;
    return geometry.cartesianQuadrant(asset.x, asset.y, asset.aimedX, asset.aimedY);
    // if (asset.aimedX > asset.x  && asset.aimedY > asset.y) return "I";
    // if (asset.aimedX < asset.x  && asset.aimedY > asset.y) return "II";
    // if (asset.aimedX < asset.x  && asset.aimedY < asset.y) return "III";
    // if (asset.aimedX > asset.x  && asset.aimedY < asset.y) return "IV";
    // if (asset.aimedX == asset.x) return "vertical";
    // if (asset.aimedY == asset.y) return "horizontal";
}

function getMoveIncrease(asset:characterType, move: moveType, step: number){
    const [aimX, aimY, curX, curY] = [asset.aimedX, asset.aimedY, asset.x, asset.y];
    if (!aimX || ! aimY) return{x: curX, y: curY};
    const distance = geometry.euclideanDistance(curX, curY, aimX, aimY);
    if (distance < step)
        return({x: aimX, y: aimY})

    if (move.direction === 'vertical' && aimY > curY) return {x: curX, y: curY + step};
    if (move.direction === 'vertical' && aimY < curY) return {x: curX, y: curY - step};
    if (move.direction === 'horizontal' && aimX > curX) return {x: curX + step, y: curY};
    if (move.direction === 'horizontal' && aimX < curX) return {x: curX - step, y: curY};
    
    const dx = Math.abs(aimX - curX);
    const dy = Math.abs(aimY - curY);
    const mainAxisCalculation = (mod:number) => Math.sqrt( ((distance - step) ** 2) / (1 + mod * mod) ); //Pitagoras

    let [modifier, newX, newY] = [0,0,0];
    if (dx === dy) {
        newX = (distance - step) / Math.sqrt(2);
        newY = newX;
    }

    if (dx > dy) {
        modifier = dx / dy;
        newY = mainAxisCalculation(modifier);
        newX = newY * modifier;
    }

    if (dy > dx){
        modifier = dy / dx;
        newX = mainAxisCalculation(modifier);
        newY = modifier * newX;
    }

    switch (move.direction){
        case "I": return {x: aimX - newX, y: aimY - newY};
        case "II": return {x: aimX + newX, y: aimY - newY};
        case "III": return {x: aimX + newX, y: aimY + newY};
        case "IV": return {x: aimX - newX, y: aimY + newY};
    }
    return{x: curX, y: curY};
    

}


type moveType = {
    direction: "I" | "II" | "III" | "IV" | "vertical" | "horizontal" | undefined,
    values : {x: number, y:number}

}
