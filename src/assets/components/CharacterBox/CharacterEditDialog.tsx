import { useRef} from 'react'
import { signal, useSignalEffect } from '@preact/signals-react'
import { useSocket } from '../../providers/SocketProvider';
import { characterData } from './CharacterBox';

export const characterEditSignal = signal<characterEditType>({currentValue: '', name: '', family: ''});


export default function CharacterEditDialog() {
    const socket = useSocket();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const SESSION_STORAGE_LOGIN_KEY = 'LRO-logged-user-ID';
    const LOCAL_STORAGE_CURRENT_CHARACTER_ID_KEY = 'lets-roll-one-chosenID';
    const primaryDivRef = useRef<HTMLDivElement>(null);
    const secondaryDivRef = useRef<HTMLDivElement>(null);
    hideDeleteQuestion();
    handleDialog();

    return(
        <dialog ref = {dialogRef} className = 'character-box-button edit-dialog'>
            <div className='edit-dialog-inside' ref = {primaryDivRef}>
                <form id = 'character-edit-form' onSubmit={handleSubmit}>
                    <label htmlFor='edit-input'>{characterEditSignal.value.name}:</label>
                    <input maxLength={60} ref = {inputRef} type = 'text' name = 'edit-input' id = 'character-edit-input' className='input-filter'></input>
                </form>
                <button className='delete-button' onClick = {showDeleteQuestion}>Delete</button>
            </div>

            <div className = 'spacer' ref = {secondaryDivRef} style = {{display: 'none'}}>
                <span className='are-you-sure-question'>Are you sure? This action is irreversible.</span>
                
                <div className = 'spacer'>
                    <button className='character-box-button main-text' onClick = {hideDeleteQuestion}>No</button>
                    <button className='delete-button' onClick = {handleDelete}>Yes, delete <span>{characterEditSignal.value.name}</span>.</button>
                </div>
            </div>
        </dialog>
    )

    function showDeleteQuestion(){
        if (!primaryDivRef.current) return;
        if (!secondaryDivRef.current) return;
        primaryDivRef.current.style.display = 'none';
        secondaryDivRef.current.style.display = 'block';
    }

    function hideDeleteQuestion(){
        if (!primaryDivRef.current) return;
        if (!secondaryDivRef.current) return;
        primaryDivRef.current.style.display = 'flex';
        secondaryDivRef.current.style.display = 'none';
    }

    function handleDialog(){
        useSignalEffect(() => {
            if (!inputRef.current) return;
            if (!dialogRef.current) return;
            inputRef.current.value = String(characterEditSignal.value.currentValue);
            if (characterEditSignal.value.name === '') return;
            if (dialogRef.current.open) return;
            dialogRef.current.showModal();
            inputRef.current.select(); 
            });
    }

    function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        if (!dialogRef.current) return;
        if (!inputRef.current) return;
        dialogRef.current.close();
        const payload = getEmitPayload();
        if (payload.value.length > 20) return;        
        socket.emit('edit-character', payload);
        saveCharacter();
    }

    function handleDelete(){
        if (!dialogRef.current) return;
        dialogRef.current.close();
        const payload = getEmitPayload();
        socket.emit('delete-character-attribute', payload);
    }

    function getEmitPayload(){
        return {
            userID: sessionStorage.getItem(SESSION_STORAGE_LOGIN_KEY),
            characterID: localStorage.getItem(LOCAL_STORAGE_CURRENT_CHARACTER_ID_KEY),
            attribute: characterEditSignal.value.name,
            family: characterEditSignal.value.family || '',
            value: inputRef?.current?.value || ""
        };
    }

    function saveCharacter(){
        if (!characterData.value) return;
        if (!characterEditSignal.value) return;
        if (!inputRef.current) return;
        const newCharacterState = {...characterData.value};
        const index = newCharacterState.rolls.findIndex(element => element.name === characterEditSignal.value.name && element.family === characterEditSignal.value.family)
        newCharacterState.rolls[index].value = inputRef.current.value; 
        characterData.value = newCharacterState;
    }
}

type characterEditType = {
    currentValue: string | number,
    name: string,
    family?: string
}