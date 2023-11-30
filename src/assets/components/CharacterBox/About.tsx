import { characterDataType } from '../../types/characterTypes'
import ListWithHeader from './ListWithHeader'

export default function About({characterData}: props) {
  return (

    <div  className = "character-info">
      <div className = 'about-box'>
        <div className = 'about-text'>
          <h1>Tassarion</h1>
          <ListWithHeader data = {characterData.about.generalInfo}/>
          <strong>Traits</strong>
          <> </>
          {characterData.about.traits.map(tr => {return(<em key = {tr} className = 'trait-text'>{tr}</em>)})}
        </div>
        <img src='https://drive.google.com/uc?id=1nDT9hUjVmFPDmsCkwjCQSCTTt1rBkU7n'/>
      </div>
      <div className = 'about-auxilary'>
        <h2>Difficulty Classes</h2>
        <ListWithHeader  data = {characterData.about.DCs}/>
        <h2>Ability Scores</h2>
        <ListWithHeader  data = {characterData.about.abilities}/>
      </div>

    </div>
  )

}

type props = {
    characterData: characterDataType
}
