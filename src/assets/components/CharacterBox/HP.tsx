import CharacterNumberBar from './CharacterNumberBar';
import { characterMapSignal } from './CharacterBox';
import {useState, ChangeEvent} from 'react'
import { useSocket } from '../../providers/SocketProvider'
import { usersDataState } from '../../states/GlobalState';
import DropDownList from '../DropDownList';


export default function HP() {
    const SOCKET_EDIT_KEY = 'change-hp';
    const userID = usersDataState.value.userID;
    const userIsGM = usersDataState.value.isGM;
    const characters = characterMapSignal.value;
    const socket = useSocket();
    const [HPs, setHPs] = useState<hpType[]>(() => {socket.emit('get-hps'); return []});

    socket.on('update-hps', (hps: hpType[]) => setHPs(hps));

    return(
        <HPList/>
    )


    function HPList(){
        return(
            <>
                <h2>Party:</h2>
                <section className = 'hp-list'>
                {HPs.map(hp => {return(
                    <CharacterNumberBar key = {hp.id} graphicURL = {hp.graphicUrl} currentValue={hp.currentHP} maxValue={hp.maxHP} label = {hp.name} barForegroundClassName='hp-bar' socketEditKey={SOCKET_EDIT_KEY} id = {hp.id}/>
                )})}
                </section>
                {userIsGM && <DropDownList options={Object.keys(characters)} changeHandler = {handleSelectChange}/>}
            </>
        )

        function handleSelectChange(e: ChangeEvent<HTMLSelectElement>){
            const choosenID = getChosenID(e.target.value);
            socket.emit('toogle-hp-bar', {userID: userID, characterID: choosenID})
        }

        function getChosenID(chosenName: string){
            let name: string
            for (name of Object.keys(characters)){
                if (name === chosenName) return characters[name];
            } 
        }
    }

}

type hpType = {
    graphicUrl : string,
    currentHP : number,
    maxHP : number,
    name: string,
    id: string
}