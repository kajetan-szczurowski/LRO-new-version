import { useState,  useRef } from 'react'
import About from './About';
import Rolls from './Rolls';
import MapGraphics from '../GameMasterBox/MapGraphics';
import MapAuthorizations from '../GameMasterBox/MapAuthorizations';
import { Signal, useSignalEffect, signal} from "@preact/signals-react";
import { characterDataType } from '../../types/characterTypes';
import { useLocalStorage, useLocalStorageSignal } from '../../hooks/useStorage';
import Login from './Login';
import CharacterEditDialog from './CharacterEditDialog';
import AuxilaryCharacterButton from './AuxilaryCharacterButton';
import Combat from './Combat';
import { triggerSettingsWindow } from './Settings';
import { usersDataState } from '../../states/GlobalState';
import { useSocket } from '../../providers/SocketProvider';
import EditAttributeDialog from './Editables/EditAttributeDialog';

const chosenCharacterStorageKey = 'lets-roll-one-chosenID';
const charactersMapStorageKey = 'lets-roll-one-charactersMap';
const charactersStateStorageKey = 'lets-roll-one-charactersState';

export const characterData = signal<characterDataType | undefined>(getPlaceholderData());
export const characterMapSignal = signal<characterMap>({});
export const characterNameSignal = signal<string>("");

export default function CharacterBox() {
    const [charactersMap, setCharactersMap] = useLocalStorage<characterMap>(charactersMapStorageKey, {});
    const socket = useSocket();

    useSignalEffect(() => setCharactersMap(characterMapSignal.value));

    const charactersState = useLocalStorageSignal<characterDataType[]>(charactersStateStorageKey, []);
    const chosenCharacter = useLocalStorageSignal<string>(chosenCharacterStorageKey, '');
    useSignalEffect(function(){
      characterData.value = charactersState.value.find(char => char.id === chosenCharacter.value)
      usersDataState.value.currentCharacterID = chosenCharacter.value;
    });
    // useSignalEffect(function(){
    //   const state = charactersState.value;
    //   const current = chosenCharacter.value;
    //   const characterToChange = state.find(v => v.id === current);
    //   if (!characterToChange) return;
    //   const newArray  = state.filter(v => v.id !== current);
    //   if (!characterData.value) return;
    //   newArray.push(characterData.value)
    //   charactersState.value = newArray;; 
    // });

    useSignalEffect(function(){
      if (!characterData.value) return;
      const newArray = charactersState.peek().filter(v => v.id !== chosenCharacter.value);
      newArray.push(characterData.value);
      charactersState.value = newArray;
    })



    // useSignalEffect(() => {console.log('co tam?', charactersState.value)})
    // const charactersMap = useRef<[characterMap, characterMap[]]>();
    // usePreviousCharacterData(characterData, chosenCharacter);
    // usePreviousCharacterData(characterData, '');

    //
    //

    // const [cData, setcData] = useLocalStorage<characterDataType[]>(cDataKey, []);
    const [openWindow, setOpenWindow] = useState('about');
    const userIsGM = usersDataState.value.isGM;

    socket.on('trigger-refresh', handleRefresh)

    function handleRefresh(){
      if (!chosenCharacter.value) return;
      downloadCharacterData(chosenCharacter.value, charactersState);
    }


  return (
    // <charactersContext.Provider value={cData}>
      <section id = 'character-box' >
        <CharacterEditDialog/>
        <EditAttributeDialog/>
        <div id = 'login-bar'>
          <AuxilaryCharacterButton onClickEvent={triggerSettingsWindow} label = 'gear' />
          <AuxilaryCharacterButton onClickEvent={handleRefresh} label = 'refresh' />
          <Login/>
        </div>

        {/* <CharacterChanger map = {charactersMap} currentID = {chosenCharacter}/> */}
        <CharacterChanger currentID = {chosenCharacter} mainState={charactersState}/>


        <div className = 'navigation-buttons'>
              <NavigationButton state = 'about'/>
              <NavigationButton state = 'rolls'/>
              <NavigationButton state = 'combat'/>
              {userIsGM && <NavigationButton state = 'MapGraphics' />}
              {userIsGM && <NavigationButton state = 'mapAuthorizations' />}
        </div>


        <div id = 'character-info'>
            {openWindow === 'rolls' && <Rolls/>}
            {openWindow === 'about' && <About/>}
            {openWindow === 'combat' && <Combat/>}
            {openWindow === 'mapAuthorizations' && <MapAuthorizations/>}
            {openWindow === 'MapGraphics' && <MapGraphics/>}


        </div>

      </section>
    // </charactersContext.Provider>

  )
  
  function NavigationButton({state} : navigationProps) {
    const clickedClass = 'character-box-button category-button character-box-clicked';
    const unClickedClass = 'character-box-button category-button character-box-clickable';
    const className = state === openWindow? clickedClass : unClickedClass;
    return( 
      <button className = {className} onClick = {() => setOpenWindow(state)}>{state}</button>
    )

}







// type mapChanger = React.MutableRefObject<characterMap | undefined>
function CharacterChanger({ currentID, mainState}: changerProps){
  const dialogRef = useRef<HTMLDialogElement>(null);
  // useDefaultCharactersMap(setCharactersMap);
  const name = handleName();
  characterNameSignal.value = name;
  return(
    <>
      <button onClick = {handleButtonClick} className = "character-box-button choosing-button character-box-clickable" >{name}</button>
      <dialog className = 'character-changer' ref = {dialogRef}>
        <div>
          <DialogContent />
        </div>
      </dialog>
    </>
  )

  function DialogContent(){
    const buttonClass = 'character-box-button category-button character-box-clickable';
    if (!Object.keys(charactersMap).length) return( <> Nothing to show. Please contact your GM.</>);
    const charactersArray = compileCharactersArray();
    return(
      <>
        {charactersArray.map(character => {
          return(<button className={buttonClass} key = {character.id} onClick = {() => handleClick(character.id)}>{character.name}</button>)
        })}
  
      </>
    )

    function handleClick(id:string){
      if(!dialogRef.current) return;
      dialogRef.current.close();
      currentID.value = id;
      if (mainState.value.find(character => character.id === currentID.value)) return;
      downloadCharacterData(id, mainState);
    }

  }

  function compileCharactersArray(){
    return Object.keys(charactersMap).map(oneCharacter => {
      return {id: charactersMap[oneCharacter], name: oneCharacter}
  })

}

  function handleButtonClick(){
    if (!dialogRef.current) return;
    dialogRef.current.showModal();
  }

  function handleName(defaultName = '*characters*'){
    return characterData.value?.name || defaultName;
  }

}

// function useDefaultCharactersMap(setter: React.Dispatch<React.SetStateAction<characterMap>>){
  // async function getList(){
  //   try{

  //     const data = await fetch('http://localhost:3000/charactersIDMap');
  //     const jsoned = await data.json();
  //     setter(jsoned);

  //   }catch{return}
  // }

  // useEffect(() => {getList()}, [])
// }

// function usePreviousCharacterData(state: Signal<characterDataType>, id:string){
//   async function fetchData(){
//     try{
//       const data = await fetch('http://localhost:3000/character');
//       const processed = await data.json();
//       state.value = processed;

//     }catch{ return; }
//   } 
//   if (id === '') return;
//   useEffect(() => {fetchData()}, []);
// }

}

function getPlaceholderData():characterDataType{
  return{
    id: 'default',
    about: {DCs: [], abilities:[], generalInfo:[], traits:[]},
    rolls: [],
    name: '',
    windows: []

  }
}

export async function downloadCharacterData(id: string, state: Signal<characterDataType[]>){
  // console.log('siema?')
  try{
    // const data = await fetch(`http://localhost:3000/character/${id}`);
    const data = await fetch(`https://lro-2-alpha-backend-production.up.railway.app/character/${id}`);
    // console.log(data)
    console.log(`pobieram ${id}`)
    const jsoned = await data.json();
    const prev = state.value.map(val => { return {...val}});
    // console.log(jsoned)
    const newArray = prev.filter(val => val.id !== id);
    newArray.push(jsoned);
    state.value = newArray;
    console.log(state.value);

  }catch{return;}
}


type navigationProps = {
  state: string,
}

type characterMap = {[key: string]: string};

type changerProps = {
  currentID: Signal<string>,
  mainState: Signal<characterDataType[]>
}