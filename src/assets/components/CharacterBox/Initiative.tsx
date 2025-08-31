import { mapCharacters } from '../Map/Map';
import { useState, useRef } from 'react';
import { useSocket } from '../../providers/SocketProvider';
import { usersDataState } from '../../states/GlobalState';

export default function Initiative() {
    const socket = useSocket();
    const [gameQueue, setGameQueue] = useState<initiativeCharacter[]>(() => {socket.emit('give-me-initiative'); return [];});
    const [currentAvatar, setCurrentAvatar] = useState('');
    const queueTable = useRef(new Map());
    const replaceInput1 = useRef<HTMLInputElement>(null);
    const replaceInput2 = useRef<HTMLInputElement>(null);
    socket.on('initiative-order', ([arrayData, activeElement]) => {
        arrayData.forEach((character: {id: string, name: string}) => queueTable.current.set(character.id, character.name));
        setGameQueue(arrayData); 
        setCurrentAvatar(activeElement);
    });

    return(
        <div className = 'initative-box'>
            <Avatars />
            <Queue />
            <ReplaceForm />
            <ControlBox />
        </div>
    )


    function Avatars(){
        return(
                <div>
                    {mapCharacters.value.map(character => {
                        return(<div key = {character.id} onClick = {() => handleAvatarClick(character.id, character.name)}>
                                <img className = 'initiative-image' src = {character.graphicUrl}/>
                                <div>{character.name}</div>
                            </div>)
                    })} 
                </div>
            )
        }


    function Queue(){
        return(
            <ol>
                {gameQueue.map(character => {
                    return(
                        <li  key = {character.id} onContextMenu = {(e) => handleContext(e, character.id)}>
                            {character.name}
                            <input type ='checkbox' onClick = {() => setCurrentAvatar(character.id)} />
                        </li>
                    )
                })}
            </ol>
        )
    }

    function ReplaceForm(){
        return(
            <div>
                <form onSubmit = {handleReplaceSubmit}>
                    <input type = 'number' ref = {replaceInput1} min = '1' max = {gameQueue.length}></input>
                    <br></br>
                    <input type = 'number' ref = {replaceInput2} min = '1'  max = {gameQueue.length}></input>
                    <br></br>
                    <input type = 'submit'></input>
                </form>
            </div>
        )
    }

    function ControlBox(){
        return(
            <div>
                <div> Active: {queueTable.current.get(currentAvatar)} </div>
                <div>
                    <button onClick = {handleServerSubmission}>To the server</button>
                    <br/>
                    <button onClick = {clearQueue}>Clear queue</button>
                    <br/>
                    <button onClick = {sendNewActive}>Update active</button>
                </div>

            </div>
        )
    }

    function handleAvatarClick(id: string, name: string){
        if (queueTable.current.has(id)) return;
        setGameQueue(current => [...current, {id: id, name: name}]);
        queueTable.current.set(id, name);
    }

    function handleReplaceSubmit(e: React.FormEvent){
        e.preventDefault();
        if (!replaceInput1.current || !replaceInput2.current) return;
        const [index1, index2] = [replaceInput1.current.value, replaceInput2.current.value].map(data => Number(data) - 1);
        if (index1 == index2 || index1 < 0 || index2 < 0 || index1 > gameQueue.length -1 || index2 > gameQueue.length - 1) return;
        setGameQueue(currentQueue => {
            const newQueue = [...currentQueue];
            newQueue[index1] = currentQueue[index2];
            newQueue[index2] = currentQueue[index1];
            return newQueue;
        });
    }

    function handleContext(e:React.MouseEvent, id: string){
        if (!queueTable.current.has(id)) return;
        e.preventDefault();
        queueTable.current.delete(id);
        setGameQueue(current => current.filter(character => character.id !== id));
    }

    function clearQueue(){
        queueTable.current.clear();
        setGameQueue([]);
        setCurrentAvatar('');
    }

    function handleServerSubmission(){
        socket.emit('set-initiative', {userID: usersDataState.value.userID, initiativeData: gameQueue, currentID: currentAvatar});
    }

    function sendNewActive(){
        socket.emit('initiative-update-current', {userID: usersDataState.value.userID, currentID: currentAvatar});
    }
}

type initiativeCharacter = {
    id: string,
    name: string
}