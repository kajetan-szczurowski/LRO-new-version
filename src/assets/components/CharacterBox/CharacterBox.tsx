import { useState } from 'react'
import About from './About';
import Rolls from './Rolls';
import {signal} from "@preact/signals-react";
import { characterDataType } from '../../types/characterTypes';


export default function CharacterBox() {
    const [openWindow, setOpenWindow] = useState('about');
    const characterData = signal<characterDataType>(getCharacterData());
  return (
    <section id = 'character-box' >
      <button className = "character-box-button choosing-button character-box-clickable" >Ercor</button>


        <div className = 'navigation-buttons'>
            <NavigationButton state = 'about'/>
            <NavigationButton state = 'rolls'/>
        </div>
    
        <div id = 'character-info'>
            {openWindow === 'rolls' && <Rolls characterData = {characterData.value} />}
            {openWindow === 'about' && <About characterData = {characterData.value}/>}
        </div>
    </section>

  )
  
  function NavigationButton({state} : navigationProps) {
    const clickedClass = 'character-box-button category-button character-box-clicked';
    const unClickedClass = 'character-box-button category-button character-box-clickable';
    const className = state === openWindow? clickedClass : unClickedClass;
    return( 
      <button className = {className} onClick = {() => setOpenWindow(state)}>{state}</button>
    )
}
}

//TODO: get From Backend
function getCharacterData(){
    const newBeginning = {"about":{"DCs":[{"name":"AC","value":22},{"name":"class DC","value":14},{"name":"speed","value":30},{"name":"perception","value":12},{"name":"arcane spellcasting DC","value":23},{"name":"occult spellcasting DC","value":25}],"abilities":[{"name":"Strength","value":10},{"name":"Dexterity","value":14},{"name":"Constitution","value":16},{"name":"Intelligence","value":19},{"name":"Wisdom","value":16},{"name":"Charisma","value":10}],"generalInfo":[{"name":"class","value":"Psychic"},{"name":"heritage","value":"Half-Elf Human"},{"name":"background","value":"Astrologer"},{"name":"size","value":"Medium"}],"traits":["Elf","Half-Elf","Human","Humanoid"]},"rolls":[{"name":"Fortitude","value":12,"family":"saving throws and perception"},{"name":"Reflex","value":13,"family":"saving throws and perception"},{"name":"Will","value":14,"family":"saving throws and perception"},{"name":"perception","value":12,"family":"saving throws and perception"},{"name":"Dagger","value":"+11","family":"attacks"},{"name":"Falchion","value":"+1","family":"attacks"},{"name":"Fist","value":"+11","family":"attacks"},{"name":"Improvised Weapon","value":"+7","family":"attacks"},{"name":"Mentalist's Staff","value":"+9","family":"attacks"},{"name":"arcane spell attack","value":13,"family":"attacks"},{"name":"occult spell attack","value":15,"family":"attacks"},{"name":"Dagger","value":"1d4 P","family":"damage"},{"name":"Falchion","value":"1d10 S","family":"damage"},{"name":"Fist","value":"1d4 B","family":"damage"},{"name":"Improvised Weapon","value":"1d6 B","family":"damage"},{"name":"Mentalist's Staff","value":"1d4 B","family":"damage"},{"name":"Acrobatics","value":2,"family":"skills"},{"name":"Arcana","value":16,"family":"skills"},{"name":"Athletics","value":0,"family":"skills"},{"name":"Crafting","value":13,"family":"skills"},{"name":"Deception","value":0,"family":"skills"},{"name":"Diplomacy","value":9,"family":"skills"},{"name":"Intimidation","value":0,"family":"skills"},{"name":"Medicine","value":12,"family":"skills"},{"name":"Nature","value":12,"family":"skills"},{"name":"Occultism","value":18,"family":"skills"},{"name":"Performance","value":0,"family":"skills"},{"name":"Religion","value":12,"family":"skills"},{"name":"Society","value":13,"family":"skills"},{"name":"Stealth","value":11,"family":"skills"},{"name":"Survival","value":3,"family":"skills"},{"name":"Thievery","value":2,"family":"skills"},{"name":"Astrology Lore","value":13,"family":"skills"},{"name":"Loremaster Lore","value":13,"family":"skills"},{"name":"Mercantile Lore","value":13,"family":"skills"}]}
    return newBeginning;
}




type navigationProps = {
  state: string,
}