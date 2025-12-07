import {useState, useRef} from 'react';
import { useSocket } from '../../../providers/SocketProvider';
import { usersDataState } from '../../../states/GlobalState';
import { characterType } from '../../Map/mapTypes';

export default function SavedGame({label, timestamp, id}: SavedGameBaseData) {
    const socket = useSocket();
    const [descriptionVisible, setDescriptionVisible] = useState(false);
    const [fullData, setFullData] = useState<SavedGameFullData>({label: label, id: id, timestamp: timestamp, mapURL: '', mapAssets: []});
    const deleteCheckboxRef = useRef<HTMLInputElement>(null);
    const userID = usersDataState.value.userID;
    socket.on('specific-state-data', (stateData => {if (stateData.id === id)  setFullData(stateData)}));

    return(
        <div>
            <h3>
                <strong>{label} {timestamp}</strong>
                <span onClick = {handleVisibilityToggle}>{'>'}</span>
                <span onClick = {handleLoading}>L</span>

            </h3>

            <div className = {descriptionVisible? '' : 'display-none'}><Description/></div>

        </div>
    )

    function Description(){
        if (fullData.mapURL === '') return <>No data to display.</>
        return(
            <>
            <h4> Map: <img style = {{width: '50px', height: '50px'}} src = {fullData.mapURL}/> </h4>
            <button onClick = {loadGame}>Load State</button>
            Assets ({fullData.mapAssets.length}) {fullData.mapAssets.map(ass => {return <span key = {ass.id}>{ass.name} </span>})}
            <form onSubmit = {handleDelete}>
                <label>Delete state:</label>
                <input ref = {deleteCheckboxRef} type = 'checkbox' />
                <input type = 'submit' value = 'Delete'/>
            </form>
            </>
        )
    }

    function handleVisibilityToggle(e: React.MouseEvent){
        e.stopPropagation();
        setDescriptionVisible(prev => !prev);
    }

    function handleLoading(e: React.MouseEvent){
        e.stopPropagation();
        socket.emit('get-specific-state-data', {userID: userID, saveID: id});
    }

    function loadGame(){
        socket.emit('load-game-state', {userID: userID, saveID: id});
    }

    function handleDelete(e: React.FormEvent){
        e.preventDefault();
        if (!deleteCheckboxRef.current) return;
        if (!deleteCheckboxRef.current.checked) return;
        socket.emit('delete-state-data', {userID: userID, saveID: id});
    }
}

export type SavedGameBaseData = {
    label: string,
    timestamp: string,
    id: string
}

type SavedGameFullData = SavedGameBaseData & {
    mapURL: string,
    mapAssets: characterType[]
}