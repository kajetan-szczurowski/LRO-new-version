import { characterDataType, characterElementType } from '../../types/characterTypes'
import { withInputFilter } from '../withInputFilter'
import RollsFamily from './RollsFamily'


export default function Rolls({characterData}: props) {
    const Families = withInputFilter(RollsFamilies);
    const rolledUp = {};
  return (
    <div className = "character-info">
        <Families rolls = {characterData.rolls} rolledDictionary = {rolledUp}/>
    </div>
  )


}

function RollsFamilies({rolls, filter, rolledDictionary}:familiesProps){
    const filteredRolls = rolls.filter(oneRoll => oneRoll.name.toLowerCase().includes(filter.toLowerCase()));
    const compiledFamilies = compileFamilies();
    return(<>
    {compiledFamilies.map(fam => <RollsFamily key = {fam[0].name + fam[0].value} data = {fam} filtered = {filter.length > 0} rolledDictionary = {rolledDictionary}/>)}
    </>)


    function compileFamilies(){
        const families: characterElementType[][] = [];
        let currentFamilyList: characterElementType[] = [];
        let currentFamilyName = '';
        filteredRolls.forEach(roll => {
            if (!roll.hasOwnProperty('family')) return;
            if (roll.family !== currentFamilyName){
                if (currentFamilyList.length > 0) families.push(currentFamilyList);
                currentFamilyList = [roll];
                if (roll.family) currentFamilyName = roll.family;
                return;
            } 
            currentFamilyList.push(roll);

        })
        if (currentFamilyList.length > 0) families.push(currentFamilyList);
        return families;
    }
}

type props = {
    characterData: characterDataType
}

type familiesProps = {
    rolls: characterElementType[],
    filter: string,
    rolledDictionary: {[key: string]: boolean}
}
