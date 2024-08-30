import {useState} from 'react'
import { characterElementType } from '../../types/characterTypes';
import { chatInputSignal } from '../Chat/ChatInput';
import NumericAndTextSpans from '../NumericAndTextSpans';
import { characterEditSignal } from './CharacterEditDialog';

export default function RollsFamily({data, filtered, rolledDictionary}: props) {
  const fromDictionary = data[0].family? rolledDictionary[data[0].family] : true;
  const [visible, setVisible] = useState(fromDictionary ?? true);
  return (
    <div className="rolls">
        <h2>
            {data[0].family}
            {!filtered && <span className = {`rolls-family-visibility-${visible}`} onClick={handleSpanClick} >{'>'} </span>}

        </h2>
        {(visible || filtered) && data.map(chunk => {
            return(< RollChunk key = {chunk.name + chunk.value} rollData={chunk}/>)
        })}
    </div>
  )

  function handleSpanClick(){
    const previousState = visible;
    setVisible(previous => !previous);
    if (data[0].family) rolledDictionary[data[0].family] = !previousState;
  }



  function RollChunk({rollData}: chunkType){
    return(
        <div className='character-box-clickable' onClick={handleChunkClick} onContextMenu = {handleChunkRightMouseClick}>
            <strong>{rollData.name}</strong>
            <> </>
            <NumericAndTextSpans value={rollData.value} digitsClass='numeric-value' nonDigitsClass='non-numeric-value'/>
        </div>
    )

      function handleChunkClick(){
        chatInputSignal.value = {modifier: String(rollData.value), description: String(rollData.name)};
      }

      function handleChunkRightMouseClick(e: React.MouseEvent){
        e.preventDefault();
        characterEditSignal.value = {currentValue: rollData.value, name: rollData.name, family: rollData.family};
      }
    }

  }


type props = {
    data: characterElementType[],
    filtered: boolean,
    rolledDictionary: {[key:string]: boolean}
}

type chunkType = {
    rollData: characterElementType
}