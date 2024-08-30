import { characterElementType } from '../../types/characterTypes'
import { withInputFilter } from '../withInputFilter'
import RollsFamily from './RollsFamily'
import { characterData } from './CharacterBox';
import { useRef } from 'react';
import { useSocket } from '../../providers/SocketProvider';
import { usersDataState } from '../../states/GlobalState';


export default function Rolls() {
    const rollsData = characterData.value?.rolls;
    if (!rollsData) return;
    const Families = withInputFilter(RollsFamilies);
    const rolledUp = {};
  return (
    <div className = "character-info">
        <Families rolls = {rollsData} rolledDictionary = {rolledUp}/>
    </div>
  )


}

function RollsFamilies({rolls, filter, rolledDictionary}:familiesProps){
    const filteredRolls = rolls.filter(oneRoll => oneRoll.name.toLowerCase().includes(filter.toLowerCase()));
    const familyList = getFamiliesNames(rolls);
    const compiledFamilies = compileFamilies();
    const socket = useSocket();
    const newRollDialogRef = useRef<HTMLDialogElement>(null);
    return(
    <>
        <button onClick = {handleNewRoll} className='character-box-button main-text'>New roll</button>
        <NewRollDialog/>
        {compiledFamilies.map(fam => <RollsFamily key = {fam.name + fam.rolls[0].value} data = {fam.rolls} filtered = {filter.length > 0} rolledDictionary = {rolledDictionary}/>)}
    </>)

    function NewRollDialog(){
        const labelRef = useRef<HTMLInputElement>(null);
        const valueRef = useRef<HTMLInputElement>(null);
        const familyRef = useRef<HTMLSelectElement>(null);

        return(
            <dialog ref = {newRollDialogRef} id = 'new-roll-dialog' className='character-box-button edit-button'>
                <form onSubmit = {handleNewRollSumbit} id = 'new-roll-form'>
                    <h3>New roll</h3>
                    <div>
                        <label htmlFor='new-roll-label'>Label:</label>
                        <input maxLength={30} ref = {labelRef} name='new-roll-label' id = 'new-roll-label-input' type = 'text' />
                    </div>

                    <div>
                        <label htmlFor='new-roll-value'>Value:</label>
                        <input maxLength={30} ref = {valueRef} name='new-roll-value' id = 'new-roll-value-input' type = 'text' />
                    </div>

                    <div>
                        <label htmlFor='new-roll-family'>Group:</label>
                        <select ref = {familyRef} className='capitalized' name = 'new-roll-family'>{familyList.map(family => <option key = {family} className = 'capitalized'>{family}</option>)}</select>
                    </div>
                    <input type = 'submit' className = 'hidden'/>
                </form>
            </dialog>
        )

        function handleNewRollSumbit(e: React.FormEvent){
            e.preventDefault();
            const characterID = usersDataState.value.currentCharacterID;
            if (!familyRef.current || !valueRef.current || !labelRef.current || !newRollDialogRef.current) return;
            const payload = {
                label: labelRef.current.value,
                value: valueRef.current.value,
                family: familyRef.current.value,
                userID: usersDataState.value.userID,
                characterID: characterID

            }

            socket.emit('new-roll', payload);
            labelRef.current.value = '';
            valueRef.current.value = '';
            socket.emit('refresh-character');
            if (newRollDialogRef.current.open) newRollDialogRef.current.close();

        }
    
    }

    function handleNewRoll(){
        const newDialog = newRollDialogRef.current;
        if (!newDialog) return;
        if (newDialog.open) return;
        newDialog.showModal();
        
    }



    function compileFamilies(){
        // const families: characterElementType[][] = [];
        // let currentFamilyList: characterElementType[] = [];
        // let currentFamilyName = '';
        // const familiesName: string[] = [];
        // filteredRolls.forEach(roll => {
        //     if (!roll.family) return;
        //     if (roll.family !== currentFamilyName && familiesName.includes(roll.family)){
        //         if (!familiesName.includes(roll.family)) familiesName.push(roll.family)
        //         if (currentFamilyList.length > 0) families.push(currentFamilyList);
        //         currentFamilyList = [roll];
        //         if (roll.family) currentFamilyName = roll.family;
        //         return;
        //     }
        //     else if (roll.family !== currentFamilyName && familiesName.includes(roll.family)){
        //         const temporaryFamily = families.find(fam => fam.find(member => member.family === roll.family));
        //         if (!temporaryFamily) return;
        //         currentFamilyList = temporaryFamily;
        //     } 
        //     currentFamilyList.push(roll);

        // })
        const families : familyType[] = [];
        filteredRolls.forEach(roll => {
            if (!roll.family) return;
            const foundFamily = families.find(fam => fam.name === roll.family);
            if (!foundFamily) families.push({name: roll.family, rolls: [roll]});
            if (!foundFamily) return;
            foundFamily.rolls.push(roll);;

        });
        // console.log(families)
        // if (currentFamilyList.length > 0) families.push(currentFamilyList);
        return families;
    }
}

function getFamiliesNames(rolls: characterElementType[]){
    const names: string[] = [];
    rolls.forEach(r => {
        if (!r.family) return;
        if (names.includes(r.family)) return;
        names.push(r.family);
    })
    return names;
}


type familiesProps = {
    rolls: characterElementType[],
    filter: string,
    rolledDictionary: {[key: string]: boolean}
}

type familyType = {
    name: string,
    rolls: characterElementType[]
}
