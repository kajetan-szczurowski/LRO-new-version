import { useLocalStorage } from '../../hooks/useStorage'
import { useRef } from 'react';
import RollingBoxForGM from './RollingBoxForGM';
import { sendPrivateRollingOrder } from './RollingSocket';
import { useSocket } from '../../providers/SocketProvider';

const STORAGE_KEY = 'LRO_GM_ROLLS';

export default function GameMasterRolls() {
    const socket = useSocket();
    const [rolls, setRolls] = useLocalStorage<RollType[]>(STORAGE_KEY, []);
    return(
        <>
            <br/>
            <RollingBoxForGM />
            <br/>
            <ol>
                {rolls.map(r => {return(
                    <li key = {r.id}>
                        <button onClick = {() => sendPrivateRollingOrder(socket, r.value)}>
                            <strong>{r.label}</strong>
                            <em>{r.value}</em>
                        </button>
                        <button onClick = {() => removeRoll(r.id)}>X</button>
                    </li>
                )})}
            </ol>
            <NewRollForm />
        </>
    )

    function removeRoll(id: string){
        setRolls(soFar => soFar.filter(r => r.id !== id));
    }

    function NewRollForm(){
        const labelRef = useRef<HTMLInputElement>(null);
        const valueRef = useRef<HTMLInputElement>(null);
        return(
            <form onSubmit = {handleSubmit}>
                <h2>New roll:</h2>
                <div>
                    <label>Label</label>
                    <input type = 'text' ref = {labelRef} />
                </div>
                <div>
                    <label>Value</label>
                    <input type = 'text' ref = {valueRef}/>
                </div>
                <br/>
                <input type = 'submit'  />
            </form>
        )

        function handleSubmit(e: React.FormEvent){
            e.preventDefault();
            if (!labelRef.current?.value || !valueRef.current?.value) return;
            const rollValue =  valueRef.current.value.charAt(0) === '#'? valueRef.current.value : '#' + valueRef.current.value;
            setRolls(soFar => [...soFar, {label: labelRef.current?.value ?? '', value: rollValue, id: crypto.randomUUID()}])
        }
    }

}

type RollType = {label: string, value: string, id: string}