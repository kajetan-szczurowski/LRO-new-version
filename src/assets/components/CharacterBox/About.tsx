import { characterElementType, aboutCharacterType } from '../../types/characterTypes'
import ListWithHeader from './ListWithHeader'
import { characterData } from './CharacterBox';

export default function About() {
  const aboutData = characterData.value?.about;
  if (!aboutData) return (<></>)
  if (nothingToShow({...aboutData})) return;
  return (

    <div  className = "character-info">
      <div className = 'about-box'>
        <div className = 'about-text'>
          <h1>{characterData.value?.name}</h1>
          <ListWithHeader data = {aboutData.generalInfo}/>
          <strong>Traits</strong>
          <> </>
          {aboutData.traits.map(tr => {return(<em key = {tr} className = 'trait-text'>{tr}</em>)})}
        </div>
        <img src= {aboutData.graphic ?? 'https://s13.gifyu.com/images/S0Ird.png'} className = 'about-portrait'/>
      </div>
      <div className = 'about-auxilary'>
        <h2>Difficulty Classes</h2>
        <ListWithHeader  data = {aboutData.DCs}/>
        <h2>Ability Scores</h2>
        <ListWithHeader  data = {aboutData.abilities}/>
      </div>

    </div>
  )

  function nothingToShow({DCs, traits, abilities, generalInfo}:aboutCharacterType){
    return isEmpty(DCs) && isEmpty(traits) && isEmpty(abilities) && isEmpty(generalInfo);
  }

  function isEmpty(input: characterElementType[] | string[]){
    return input.length === 0;
  }

}



// type props = {
//     characterData?: characterDataType
// }
