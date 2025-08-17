import ProgressBar from './ProgressBar'
import { usersDataState } from '../../states/GlobalState'
import { Condition } from './HP';

export default function CharacterNumberBar({graphicURL, maxValue, currentValue, barForegroundClassName, label, socketEditKey, id} : props) {
const authorized = checkAuthorization(id, label);


return(
    <div className='hp-list-item'>
        <img src = {graphicURL} className = 'hp-list-img'/>
        <div className = 'hp-description-wrapper'>
            <div className = 'hp-list-label'>{label}</div>
            <div>
                <ProgressBar authorization = {authorized} id = {id} widthRem={5} value = {currentValue} maxValue={maxValue} foregroundClassName={barForegroundClassName} socketEditKey = {socketEditKey} label = {label}/>
            </div>
        </div>
    </div>
)



}

function checkAuthorization(characterID: string, characterName:string):boolean{
    if (usersDataState.value.isGM) return true;

    const authorizedCharacters = usersDataState.value.charactersMap;
    for (let key of Object.keys(authorizedCharacters)){
        if (authorizedCharacters[key] === characterID && key === characterName) return true;
    }
    return false;
}

type props = {
    graphicURL: string,
    maxValue: number,
    currentValue: number
    barForegroundClassName: string,
    label: string,
    socketEditKey: string,
    id: string,
    conditions?: Condition[]
}
