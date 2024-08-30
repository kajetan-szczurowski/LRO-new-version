import { useRef } from 'react';
import {  signal } from '@preact/signals-react';

const APP_SETTINGS_STEPS_SOUND = 'LRO-application-settings-steps';
export const stepSounds = signal(defaultStepsSound());


export default function Settings() {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const buttonText = stepSounds.value? 'Steps sound active' : 'Steps sound muted';
    return(
        <dialog className='settings-dialog' ref = {dialogRef}>
          <h2>Application's Settings</h2>
          <button onClick = {handleClick} className= {'character-box-button character-box-clickable'}> {buttonText} </button>
        </dialog>
    )

    function handleClick(){
      stepSounds.value = stepSounds.value? 0: 1;
      localStorage.setItem(APP_SETTINGS_STEPS_SOUND, stepSounds.value? '1' : '0');
      if (dialogRef.current) dialogRef.current.close();
    }
}


export function triggerSettingsWindow(){
  const dialogObject: HTMLDialogElement | null = document.querySelector('.settings-dialog');
  if (!dialogObject) return;
  if (!dialogObject.open) dialogObject.showModal();
}


  function defaultStepsSound(){
    const fromStorage = localStorage.getItem(APP_SETTINGS_STEPS_SOUND);
    if (!fromStorage) return 0;
    return Number(fromStorage);
  }
