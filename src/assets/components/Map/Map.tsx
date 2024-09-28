import { processMap } from "./mapMain"
import { getMainMapPresets, characterType } from "./mapTypes";
import { useSocket } from "../../providers/SocketProvider";
import { mapType } from "./mapTypes";
import * as geometry from "./mapMath";



const characters: characterType[] = [];


export default function Map() {
  const socket = useSocket();
  const mainID = 'main-map';
  const SESSION_STORAGE_LOGIN_ID_KEY = 'LRO-logged-user-ID';
  setTimeout(() => {socket.emit('send-me-assets')}, 1000);
  setTimeout(() => {mapDeveloping();}, 1000);


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

function mapDeveloping(){
  const testCharacter: characterType = {x: 50, y: 50, name: 'Andrzej', graphicUrl: 'https://s12.gifyu.com/images/SYsHt.png', id: '2137', speed: 15};
  // setTimeout(() => { 
    //  characters.push(testCharacter)
    //  testCharacter.aimedX = 300; testCharacter.aimedY = 300
    // console.log('added')},
      // 5000);
  // TEMP_mapDevelopement();

}


// function TEMP_mapDevelopement(){
  //Delete after development

  //developing alghoritm for shortening movement if exceeds characters speed
  // const startPoint = {x: 50, y: 50};
  // const points = [{x: 10, y: 10}, {x: 10, y: 50}, {x: 100, y: 10}, {x: 100, y: 50}, {x: 100, y: 100}, {x: 50, y: 100},
  //   {x: 10, y: 100}, {x: 50, y: 10}];

  // const distances = points.map(onePoint => geometry.euclideanDistance(onePoint.x, onePoint.y, startPoint.x, startPoint.y));
  // const minimalDistance = Math.min(...distances);
  // const targetDistance = minimalDistance - 1;
  // console.log('distance: ', targetDistance)
  // console.log(distances, minimalDistance, targetDistance)
  // points.forEach(onePoint => {
    // const newValue = TEMP_calculateNewPosition(startPoint, onePoint, targetDistance);
    // const printDistance = geometry.euclideanDistance(onePoint.x, onePoint.y, newValue.x, newValue.y);
    // console.log(`coming to ${onePoint.x}, ${onePoint.y}. Ended at ${newValue.x}, ${newValue.y}. Distance: ${printDistance}`)})

  // }

  function calculateLimitedPosition(point1: pointType, point2: pointType, maxDistanceFeets: number, mapData: mapType) : pointType{ //TODO: move into mapControls
    const distance = geometry.euclideanDistance(point1.x, point1.y, point2.x, point2.y);
    const maxDistance = maxDistanceFeets / mapData.presets.FEET_DISTANCE_MULTIPLIER * mapData.presets.ASSET_SIZE;
    // console.log('maxDistance: ' maxDistance)
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