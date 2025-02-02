import { processMap } from "./mapMain"
import { getMainMapPresets, characterType } from "./mapTypes";
import { useSocket } from "../../providers/SocketProvider";
import { mapType } from "./mapTypes";
import * as geometry from "./mapMath";
import { getDrawingData } from "./mapDrawingMode";



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
        if (args.length) args.forEach((a: any) => characters.push(a));
        if (!args.length) mapData.toBeRedrawn = true;
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