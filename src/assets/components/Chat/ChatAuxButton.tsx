import {useRef} from 'react'
import DiceButton from './DiceButton';
import { chatInputSignal } from './ChatInput';


export default function ChatAuxButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonsInsideList = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100', 'secret'];
  return (
    <>
    <div onClick = {handleButtonClick}  className = 'chat-aux-button'><DiceButton/></div>

    <dialog ref = {dialogRef} ><DialogInside/></dialog>
    </>
  )

  function closeDialogOnEvent(e: KeyboardEvent) {
    if (e.key === 'Escape' && dialogRef.current) dialogRef.current.close();
  }

  function dialogEventHandler(){
    if (!dialogRef.current) return;
    if(dialogRef.current.open)
      document.addEventListener('keydown', closeDialogOnEvent);
    else
      document.removeEventListener('keydown', closeDialogOnEvent);

  }

  function handleButtonClick(){
    if (!dialogRef.current) return;
    if (dialogRef.current.open) dialogRef.current.close();
    else dialogRef.current.show();
    dialogEventHandler();
  }

  function handleCloseClick(){
    if (dialogRef.current) dialogRef.current.close();
    dialogEventHandler();
  }

  function DialogInside(){
    const buttonClass = 'main-text character-box-button character-box-clickable';
    return (
    <>
    <div className = 'closing-button-box'>
        <button onClick = {handleCloseClick}>&times;</button>
    </div>
    <div className = 'chat-dialog-box'>
      {buttonsInsideList.map(but => {return(<ButtonInAuxMenu key = {but} className= {buttonClass} textValue={but}/>)})}
    </div>
    </>
    )
  }

  function handleButtonInAuxClick(value : string){
    const description = value.toLowerCase() === 'secret'? 'secret' : 'singular-dice';
    chatInputSignal.value = {modifier: value, description: description};
  }

  function ButtonInAuxMenu({className, textValue}: buttonInAuxProps){
    return (
      <button className = {className} onClick = {() => handleButtonInAuxClick(textValue)}>{textValue}</button>
    )
  }
}

type buttonInAuxProps = {
  className : string,
  textValue : string,
}
