import { characterElementType, aboutCharacterType } from '../../types/characterTypes'
import ListWithHeader from './ListWithHeader'
import { characterData } from './CharacterBox';
import EditableAttribute from './Editables/EditableAttribute';

export default function About() {
  const aboutData = characterData.value?.about;
  // if (!aboutData) return (<></>)
  // if (nothingToShow({...aboutData})) return;
  // const currentData = aboutData ?? [];
  console.log(aboutData?.generalInfo.length)
  return (

    <div  className = "character-info">
      <div className = 'about-box'>
        <div className = 'about-text'>
          <h1>{characterData.value?.name}</h1>
            {/* <ListWithHeader data = {aboutData?.generalInfo.length? aboutData.generalInfo : []} attributeGroup = 'generalInfo'/> */}
            {aboutData?.generalInfo.length && <ListDisplayer data = {aboutData?.generalInfo} group = 'generalInfo'/>}

          <strong>Traits</strong>
          <> </>
          {aboutData && aboutData?.traits.map(tr => {return(<em key = {tr} className = 'trait-text'>{tr}</em>)})}

        </div>
        <img src= {aboutData?.graphic ?? 'https://s13.gifyu.com/images/S0Ird.png'} className = 'about-portrait'/>
      </div>
      <div className = 'about-auxilary'>
        <h2>Difficulty Classes</h2>
        {/* <ListWithHeader  data = {aboutData.DCs} attributeGroup = 'DCs'/> */}
        {aboutData?.DCs.length && <ListDisplayer data = {aboutData.DCs} group = 'DCs'/>}
        <h2>Ability Scores</h2>
        {/* <ListWithHeader  data = {aboutData.abilities} attributeGroup = 'abilities'/> */}
        {aboutData?.abilities.length && <ListDisplayer data = {aboutData.abilities} group = 'abilities' />}
      </div>

    </div>
  )

  function nothingToShow({DCs, traits, abilities, generalInfo}:aboutCharacterType){
    return isEmpty(DCs) && isEmpty(traits) && isEmpty(abilities) && isEmpty(generalInfo);
  }

  function isEmpty(input: characterElementType[] | string[]){
    return input.length === 0;
  }

  function ListDisplayer({data, group}: listDisplayerProps){
    let index = -1;
    return(
      <ul>
        {data.map(input => {
          const containLetters = /[a-zA-Z]+/g.test(String(input.value));
          index++;
          const payload = {attributeID: String(index), attributesGroup: group};
          // return(<>{String(input)}</>)})}
          return(
            <li>
              <strong><EditableAttribute title = {input.name} text = {input.name} maxLength={100} {...payload} attributeSection='name'/></strong> 
              {!containLetters && <em className = 'numeric-value'><EditableAttribute title = {input.name} text = {String(input.value)} maxLength={100} attributeSection='value' {...payload} /></em>}
              {containLetters && <em><EditableAttribute title = {input.name} text = {String(input.value)} maxLength={100} {...payload} attributeSection='value' /></em>}
            </li>
          )})}

      </ul>
    )
  }

}

type listDisplayerProps = {
  data : characterElementType[],
  group : string,
}



// type props = {
//     characterData?: characterDataType
// }
