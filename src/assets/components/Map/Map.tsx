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
  setTimeout(() => {socket.emit('send-me-assets')}, 1000)


  processMap(mainID, getMainMapPresets(), characters, mapExternalControl, socket)
  return (
    <canvas id = {mainID} />
  )

  function mapExternalControl(controlWord: string, args: any, mapData: mapType){
    switch(controlWord){
      case 'move-order-output':{
        const loggedUserID = sessionStorage.getItem(SESSION_STORAGE_LOGIN_ID_KEY);
        socket.emit('move-proposition', {id: args[0], x: args[1], y: args[2], userID: loggedUserID});
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
      }
    }
  }

}


function TEMP_mapDevelopement(){
  //Delete after development

  //developing alghoritm for shortening movement if exceeds characters speed
  const startPoint = {x: 50, y: 50};
  const points = [{x: 10, y: 10}, {x: 10, y: 50}, {x: 100, y: 10}, {x: 100, y: 50}, {x: 100, y: 100}, {x: 50, y: 100},
    {x: 10, y: 100}, {x: 50, y: 10}];

  const distances = points.map(onePoint => geometry.euclideanDistance(onePoint.x, onePoint.y, startPoint.x, startPoint.y));
  const minimalDistance = Math.min(...distances);


}