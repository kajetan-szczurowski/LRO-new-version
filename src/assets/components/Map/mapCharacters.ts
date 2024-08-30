import { characterType, mapType } from "./mapTypes";
import { loadImage } from "./mapMain";
import * as geometry from "./mapMath";
import { stepSounds } from "../CharacterBox/Settings";

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
}

export function isMouseOnCharacter(map:mapType, character:characterType){
    if(!character || !character.size) return;
    const [x, y, lowX, lowY, bigX, bigY] = [map.absoluteMouseX, map.absoluteMouseY, character.x, character.y, character.x + character.size, character.y + character.size];
    return x >= lowX && y >= lowY && x <= bigX && y <= bigY;
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

function handleMove(asset: characterType, map:mapType){
    const move: moveType = {direction: undefined, values: {x:0, y:0}}
    move.direction = getMoveDirection(asset);
    move.values = getMoveIncrease(asset, move, map.presets.ASSET_STEP_SIZE);
    asset.x = move.values.x;
    asset.y = move.values.y;
    asset.toBeRedrawn = true;
}

function getMoveDirection(asset:characterType){
    if (!asset.aimedX || !asset.aimedY) return;
    if (asset.aimedX > asset.x  && asset.aimedY > asset.y) return "I";
    if (asset.aimedX < asset.x  && asset.aimedY > asset.y) return "II";
    if (asset.aimedX < asset.x  && asset.aimedY < asset.y) return "III";
    if (asset.aimedX > asset.x  && asset.aimedY < asset.y) return "IV";
    if (asset.aimedX == asset.x) return "vertical";
    if (asset.aimedY == asset.y) return "horizontal";
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
