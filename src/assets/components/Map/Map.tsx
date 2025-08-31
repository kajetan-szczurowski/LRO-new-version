import { processMap } from "./mapMain"
import { getMainMapPresets, characterType } from "./mapTypes";
import { useSocket } from "../../providers/SocketProvider";
import { mapType } from "./mapTypes";
import * as geometry from "./mapMath";
import { getDrawingData } from "./mapDrawingMode";
import { signal } from "@preact/signals-react";
import { handleCharactersDataChange, handleInitiativeChangeCurrent, handleInitiativeFromServer } from "./mapCharacters";

export const mapCharacters = signal<characterType[]>([]);


const characters: characterType[] = [];


export default function Map() {
  const socket = useSocket();
  const mainID = 'main-map';
  const SESSION_STORAGE_LOGIN_ID_KEY = 'LRO-logged-user-ID';
  setTimeout(() => {socket.emit('send-me-assets')}, 1000);


  processMap(mainID, getMainMapPresets(), characters, mapExternalControl, socket)
  return (
    <canvas id = {mainID} />
  )

  function mapExternalControl(controlWord: string, args: any, mapData: mapType){
    switch(controlWord){
      case 'move-order-output':{
        const loggedUserID = sessionStorage.getItem(SESSION_STORAGE_LOGIN_ID_KEY);
        const newPoint = movePropositionMiddleware(args[0], args[1], args[2], mapData);
        socket.emit('move-proposition', {id: args[0], limitedPosition: {x: newPoint.x, y: newPoint.y}, fullPosition:{x:args[1], y:args[2]}, userID: loggedUserID});
        return;
      }

      case 'move-order-input':{
        const movingOne = characters.find(char => char.id === args[0]);
        if (!movingOne) return;
        movingOne.aimedX = args[1];
        movingOne.aimedY = args[2];
        return;
      }

      case 'change-map':{
        mapData.graphicUrl = args[0];
        mapData.toBeRedrawn = true;
        mapData.resized = true;
        mapData.x = 0;
        mapData.y = 0;
        return;
      }

      case 'map-assets':{
        characters.splice(0, characters.length + 1);
        if (args.length) args.forEach((a: any) => {
          characters.push(a);
          mapData.assetsHashedTable.set(a.id, a);
        });
        if (!args.length) mapData.toBeRedrawn = true;
        mapCharacters.value = characters;
        return;
      }

      case 'map-assets-just-data':{
        
        handleCharactersDataChange(mapData, args);
        return;
      }

      case 'initiative-change':{
        handleInitiativeFromServer(args.queue, args.active, mapData);
        return;
      }

      case 'new-initiative-current':{
        handleInitiativeChangeCurrent(args, mapData);
        return;
      }

      case 'delete-asset':{
        const loggedUserID = sessionStorage.getItem(SESSION_STORAGE_LOGIN_ID_KEY);
        socket.emit('delete-asset', {assetID: args[0], userID: loggedUserID});
        return;
      }

      case 'ping-order':{
        const loggedUserID = sessionStorage.getItem(SESSION_STORAGE_LOGIN_ID_KEY);
        socket.emit('ping-order', {x: args[0], y: args[1], userID: loggedUserID});
        return;
      }

      case 'start-pinging':{
        if (mapData.pinging) return;
        mapData.pingX = args[0];
        mapData.pingY = args[1];
        mapData.startPing = true;
        return;

      }

      case 'new-drawing-order': {
        socket.emit('drawing-proposal', getDrawingData(mapData));
        return;
      }

      case 'delete-drawing-order': {
        const loggedUserID = sessionStorage.getItem(SESSION_STORAGE_LOGIN_ID_KEY);
        const id = mapData.editingDrawing.id;
        const drawingOwner = mapData.editingDrawing.userName;
        socket.emit('delete-drawing', {userID: loggedUserID, drawingID: id, owner: drawingOwner});
        return;

      }

      case 'edit-drawing-order': {
        const loggedUserID = sessionStorage.getItem(SESSION_STORAGE_LOGIN_ID_KEY);
        const {linePoint1, linePoint2, angle, size} = getDrawingData(mapData);
        const [x, y] = [mapData.editingDrawing.x, mapData.editingDrawing.y];
        const drawingLine = mapData.editingDrawing.shapeType === 'line';
        const pointPayload = drawingLine? {x1: linePoint1?.x, x2: linePoint2?.x, y1: linePoint1?.y, y2: linePoint2?.y} : {};
        const payload = {drawingID: mapData.editingDrawing.id, x: x, y: y, size: size / 10, angle: angle, ...pointPayload};
        socket.emit('edit-drawing', {userID: loggedUserID, ...payload, owner: mapData.editingDrawing.userName});
        return;
      }

      case 'drawings':{
        mapData.drawnShapes = args;
        mapData.toBeRedrawn = true;
      }
    }
  }

}

function movePropositionMiddleware(characterID: string, newX: number, newY: number,  mapData: mapType): {x: number, y: number, id: string} | any {
  if (!mapData.distanceOverflowing) return {x:newX, y: newY, id: characterID};
  const character = mapData.assets.find(char => char.id === characterID);
  if (!character) return {x:newX, y: newY, id: characterID};
  if (!character.speed) return {x:newX, y: newY, id: characterID};
  const limitedPosition = calculateLimitedPosition( {x: character.x, y: character.y}, {x: newX, y: newY}, character.speed, mapData);
  return {x: limitedPosition.x, y: limitedPosition.y, id: characterID};

}

  function calculateLimitedPosition(point1: pointType, point2: pointType, maxDistanceFeets: number, mapData: mapType) : pointType{ //TODO: move into mapControls
    const distance = geometry.euclideanDistance(point1.x, point1.y, point2.x, point2.y);
    const maxDistance = maxDistanceFeets / mapData.presets.FEET_DISTANCE_MULTIPLIER * mapData.presets.ASSET_SIZE;
    if (distance <= maxDistance) return point2;
    const difference = {x: Math.abs(point2.x - point1.x), y: Math.abs(point2.y - point1.y)};
    const angle = Math.abs(Math.asin(difference.x / distance));
    // const degrees = angle * 180 / Math.PI;
    // console.log(`coming to ${point2.x}, ${point2.y}. Angle is ${degrees}`);
    const limitedDifference = {x: maxDistance * Math.sin(angle), y: maxDistance * Math.cos(angle)};
    const newX = (point2.x > point1.x) ? point1.x + limitedDifference.x: point1.x - limitedDifference.x;
    const newY = (point2.y > point1.y) ? point1.y + limitedDifference.y : point1.y - limitedDifference.y;
    const newPoint = (point2.x !== point2.y)? {x: newX, y: newY}: {x: point2.x, y: (point2.y > point1.y)? point1.y + maxDistance : point1.y - maxDistance};
    return newPoint;
  }

  type pointType = {
    x: number,
    y: number
  }