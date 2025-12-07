import React, { useRef, useState, useEffect } from 'react';
import { usersDataState } from '../../../states/GlobalState';
import { useSocket } from '../../../providers/SocketProvider';
import SavedGame, {SavedGameBaseData} from './SavedGame';




export default function GameStatesWindow() {
    const [savedStates, setSavedStates] = useState<SavedGameBaseData[]>([]);
    const labelRef = useRef<HTMLInputElement>(null);
    const socket = useSocket();
    const userID = usersDataState.value.userID;
    useEffect(() => {socket.emit('give-me-saved-states', userID)}, []);

    socket.on('saved-states-list', newStates => setSavedStates(newStates));

    return(
        // <dialog className='game-states-dialog' ref = {dialogRef}>
        <dialog className='game-states-dialog'>
          <h2>Saved states</h2>
          <button onClick = {() => socket.emit('give-me-saved-states', userID)}>Load saves</button>

          <form onSubmit = {handleNewSave}>
            <label>Label:</label>
            <input type = 'text' ref = {labelRef}></input>
            <input type = 'submit' value = 'Save game state'></input>
          </form>

          {savedStates.map(savedGame => {return(
            <SavedGame {...savedGame} key = {savedGame.id} />
          )})}

        </dialog>
    )

    function handleNewSave(e: React.FormEvent){
        e.preventDefault();
        const newLabel = labelRef.current?.value ?? 'unspecified';
        socket.emit('save-game-state', {userID: userID, label: newLabel, timestamp: getTimestamp()});
    }

}



export function triggerGameStatesWindow(){
  const dialogObject: HTMLDialogElement | null = document.querySelector('.game-states-dialog');
  if (!dialogObject) return;
  if (!dialogObject.open) dialogObject.showModal();
}



function getTimestamp(){
    const now = new Date();
    return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    return 'now';
}