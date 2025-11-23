import { characterType } from '../../Map/mapTypes';
import ProgressBar from '../ProgressBar';
import { usersDataState } from '../../../states/GlobalState';
import { selectedCharacterToEdit } from '../CharacterBox';
import { initativeValuesState } from './Initiative';
import { useRef, useState } from 'react';
import { useSocket } from '../../../providers/SocketProvider';

const DEFENCES_KEYS = ['AC', 'DC', 'Perception', 'Fortitude', 'Reflex', 'Will'];

export default function Avatar({character, imageClickCallback}: props) {
    const socket = useSocket();
    const initiativeInputRef = useRef<HTMLInputElement>(null);
    const [editDefences, setEditDefences] = useState(false);
    const barData = {authorization: usersDataState.value.isGM, id: character.id, value: character.currentHP ?? 0, maxValue: character.maxHP ?? 0};
    const isSelected = selectedCharacterToEdit.value === character.id;
    const divStyle = isSelected? {'border': '1px solid red'} : {};
    const initiativeValue = initativeValuesState.value[character.id]; 
    const defaultInputValue = initiativeValue? initiativeValue.value : '';
    return(
        <div style = {divStyle}>
            <img className = 'initiative-image' src = {character.graphicUrl}  onClick = {() => imageClickCallback(character.id, character.name)}/>
            <div onClick = {() => !isSelected? selectedCharacterToEdit.value = character.id : selectedCharacterToEdit.value = ''} >{character.name}</div>
            <ProgressBar  {...barData} widthRem={5} foregroundClassName = 'hp-bar' socketEditKey = 'npc-hp-entry' label = {'HP'}/>
            <input type = 'number' placeholder = 'initiative value' defaultValue = {defaultInputValue} onChange = {handleInitativePointChange} ref = {initiativeInputRef}/>
            <button onClick = {() => setEditDefences(prev => !prev)}>{editDefences? 'Hide defences': 'Show defences'}</button>
            {editDefences && <Defences/>}
        </div>
    )

    function handleInitativePointChange(){
        if (!initiativeInputRef.current) return;
        initativeValuesState.value[character.id] = {name: character.name, value: Number(initiativeInputRef.current.value)};
    }

    function Defences(){
        return(
            <>
                <DefencesEditForm/>
            </>
        )
    }

    function DefencesEditForm(){
        return(
            <form onSubmit = {handleDefencesSubmit}>
                <>
                    {DEFENCES_KEYS.map(defenceKey => {
                        return(
                        <DefenceEditInput labelText = {defenceKey} characterKey = {defenceKey}/>
                        )
                    })}
                </>
                <input type = 'submit'/>
            </form>
        )
    }

    function DefenceEditInput({labelText, characterKey}: {labelText: string, characterKey: string}){
        return(
            <>
                <label>{labelText}</label>
                <input type = 'number' defaultValue = {Number(character[characterKey as keyof characterType]?? 0)} name = {characterKey} />
                <br/>
            </>
        )
    }

    function handleDefencesSubmit(e: React.FormEvent){
        e.preventDefault();
        const inputs: any = e.target;
        const keys = Object.keys(e.target);
        const newValues: {[key: string]: Number} = {};
        for( let k of keys){
            if (!/[0-9]/.test(k.charAt(0))) continue;
            console.log(k)
            newValues[inputs[k].name] = inputs[k].value; 
        }
        delete newValues[''];
        const payload = {
            userID: usersDataState.value.userID,
            characterID: character.id,
            values: newValues
        }
        socket.emit('edit-defences', payload);
    }
}


type props = {
    character: characterType
    imageClickCallback: Function,
}  