import { processMap } from "./mapMain"
import { getMainMapPresets, characterType } from "./mapTypes";

export default function Map() {
  const mainID = 'main-map';
  const characters: characterType[] = [];
  setTimeout(() => {characters.push({x:200, y:200, graphicUrl:'https://drive.google.com/uc?id=1nDT9hUjVmFPDmsCkwjCQSCTTt1rBkU7n', id: '999'})}, 1000)

  processMap(mainID, getMainMapPresets(), characters, mapExternalControl)
  return (
    <canvas id = {mainID} />
  )

  function mapExternalControl(controlWord: string, args: any){
    switch(controlWord){
      case 'move-order':{
        const movingOne = characters.find(char => char.id === args[0]);
        if (!movingOne) return;
        movingOne.aimedX = args[1];
        movingOne.aimedY = args[2];
      }
    }
  }
}
