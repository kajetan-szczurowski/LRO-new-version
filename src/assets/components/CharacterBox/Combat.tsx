import {useState, useRef} from 'react'
import { useSocket } from '../../providers/SocketProvider'
import { usersDataState } from '../../states/GlobalState';
import HP from './HP';


export default function Combat() {
    const socket = useSocket();
    const userID = usersDataState.value.userID;
    const userIsGM = usersDataState.value.isGM;

    const [initiativeList, setInitiativeList] = useState<iniType[]>(() => {socket.emit('give-me-initiative'); return []});
    const [activeElement, setActiveElement] = useState(() => {socket.emit('give-me-active-ini'); return '0'});
    const inputRef = useRef<HTMLInputElement>(null);
    const npcHpTerminalRef = useRef<HTMLInputElement>(null);

    socket.on('initiative-order', order => {setInitiativeList(order)});
    socket.on('active-initiative-element', value => setActiveElement(value));


    return(
        <>
            {userIsGM && <NPC_HP_Form />}
            <HP />
            {userIsGM && <InitiativeForm />}
            {userIsGM && <button onClick = {()=> socket.emit('initiative-command', {userID: userID, command: 'previous'})} >Ini prev</button>}
            {userIsGM && <button onClick = {()=> socket.emit('initiative-command', {userID: userID, command: 'next'})} >Ini next</button>}
            <ol>
                {initiativeList.map(ini => {
                    const elementClass = activeElement == ini.id? 'initative-active-element' : '';
                    return(
                        <li className = {elementClass} key = {ini.id}>{ini.value}</li>
                    )
                })}
            </ol>
            {initiativeList.length === 0 && <div>No combat so far. Please make something stupid to trigger a combat.</div>}
       </>

    )

    function NPC_HP_Form(){
        return(
            <form onSubmit = {handleNpcHpFormSubmit}>
                <label>NPC HP terminal:</label>
                <input type = 'text' ref = {npcHpTerminalRef}/>
                <input type = 'submit' />
            </form>
        )
    }

    function InitiativeForm(){
            return(
                <form id = 'initiative-form' onSubmit = {handleInitiativeFormSubmit}>
                    <label htmlFor='new-initiative'>New entry</label>
                    <input ref = {inputRef} id = 'initiative-input' />
                </form>
            )
    }

    function handleInitiativeFormSubmit(e: React.FormEvent){
        e.preventDefault();
        if (!inputRef.current) return;
        socket.emit('initiative-entry', inputRef.current.value);
    }

    function handleNpcHpFormSubmit(e: React.FormEvent){
        e.preventDefault();
        if (!npcHpTerminalRef.current) return;
        socket.emit('npc-hp-entry', {command: npcHpTerminalRef.current.value, userID: userID});
        npcHpTerminalRef.current.value = '';
    }


}

type iniType = {
    value: string,
    id: string
}
