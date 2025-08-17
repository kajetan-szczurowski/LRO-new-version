import { useRef, useState, useEffect } from 'react';
import {  signal, Signal } from '@preact/signals-react';
import NumericAndTextSpans from '../NumericAndTextSpans';

const APP_SETTINGS_STEPS_SOUND = 'LRO-application-settings-steps';
const MIRON_AURA_KEY = 'LRO-application-Miron-aura';
const AURA_COLOR_KEY = 'LRO-application-aura-color';
const DRAWING_COLOR_KEY = 'LRO-application-drawing-color';
const SHOW_COORDINATES_KEY = 'LRO-application-show-coordinates';
const HIDE_CONDITIONS_KEY = 'LRO-application-hide-conditions';
export const stepSounds = signal(numericDefaultFromStorage(APP_SETTINGS_STEPS_SOUND));
export const showCoordinates = signal(numericDefaultFromStorage(SHOW_COORDINATES_KEY));
export const hideConditions = signal(numericDefaultFromStorage(HIDE_CONDITIONS_KEY));


export default function Settings() {
    const [mironsAuraState, setMironsAuraState] = useState<number>(Number(sessionStorage.getItem(MIRON_AURA_KEY) ?? '0'));
    useEffect(() => {sessionStorage.setItem(MIRON_AURA_KEY, String(mironsAuraState))}, [mironsAuraState]);
    const drawingColorRef = useRef<HTMLInputElement>(null);
    const colorRef = useRef<HTMLInputElement>(null);
    const defaultAuraColor = localStorage.getItem(AURA_COLOR_KEY) ?? '#000000';
    const defaultDrawingColor = localStorage.getItem(DRAWING_COLOR_KEY) ?? '#000000';
    const dialogRef = useRef<HTMLDialogElement>(null);
    const stepButtonText = stepSounds.value? 'Steps sound active' : 'Steps sound muted';
    const showCoordinatesButtonText = showCoordinates.value? 'Coordinates visible' : 'Coordinates hidden';
    const HideConditionsButtonText = hideConditions.value? 'Conditions hidden' : 'Conditions visible';

    return(
        <dialog className='settings-dialog' ref = {dialogRef}>
          <h2>Application's Settings</h2>
          <div className = 'settings-buttons'>
            <button onClick = {() => handleClick(stepSounds, APP_SETTINGS_STEPS_SOUND)} className= {'character-box-button character-box-clickable'}> {stepButtonText} </button>
            <button onClick = {() => handleClick(showCoordinates, SHOW_COORDINATES_KEY)} className= {'character-box-button character-box-clickable'}> {showCoordinatesButtonText} </button>
            <button onClick = {() => handleClick(hideConditions, HIDE_CONDITIONS_KEY)} className= {'character-box-button character-box-clickable'}> {HideConditionsButtonText} </button>
          </div>
          <MironsAura/>
          <br/>
          <DrawingSettings/>
        </dialog>
    )

    function handleClick(processingSignal: Signal<number>, storageKey: string){
      processingSignal.value = processingSignal.value? 0: 1;
      localStorage.setItem(storageKey, processingSignal.value? '1' : '0');
      if (dialogRef.current) dialogRef.current.close();
    }

    function MironsAura(){
      const buttonClass = (numericValue: number) => `character-box-button ${mironButtonClassName(numericValue)} settings-button`;
      const buttonTextProperties = (numericValue: number) => {return {value: numericValue, digitsClass: 'numeric-value', nonDigitsClass: 'non-numeric-value'}};
      return(
        <div>
          <br/>
          <span>Miron's aura [feets]: </span>
          <button className = {buttonClass(30)} onClick = {() => handleMironButton(30)}><NumericAndTextSpans {...buttonTextProperties(30)} /></button>
          <button className = {buttonClass(15)} onClick = {() => handleMironButton(15)}><NumericAndTextSpans {...buttonTextProperties(15)} /></button>
          <button className = {buttonClass(0)} onClick = {() => handleMironButton(0)}><NumericAndTextSpans {...buttonTextProperties(0)} /></button>
          <br/>
          <div>
            <span>Aura's color: </span>
            <input className = 'settings-color-picker' onChange= {() => handleColorChange(AURA_COLOR_KEY, colorRef)} ref = {colorRef} type = 'color' defaultValue = {defaultAuraColor}/>
          </div>
        </div>
      )
    }

    function mironButtonClassName(value: number){
      return `character-box-${mironsAuraState !== value? 'clickable' : 'clicked'}`;
    }
    function handleMironButton(value: number){
      setMironsAuraState(value);
    }

    function handleColorChange(key: string, colorInputRef: React.RefObject<HTMLInputElement>){
      if (!colorInputRef.current) return;
      localStorage.setItem(key, colorInputRef.current.value.substring(0,7));
    }

    function DrawingSettings(){
      return(
        <div>

          <div>
            <span>Drawing's color: </span>
            <input className = 'settings-color-picker' onChange= {() => handleColorChange(DRAWING_COLOR_KEY, drawingColorRef)} type = 'color' ref = {drawingColorRef} defaultValue = {defaultDrawingColor}/>
          </div>

        </div>
      )
    }
}



export function triggerSettingsWindow(){
  const dialogObject: HTMLDialogElement | null = document.querySelector('.settings-dialog');
  if (!dialogObject) return;
  if (!dialogObject.open) dialogObject.showModal();
}


  function numericDefaultFromStorage(key: string){
    const fromStorage = localStorage.getItem(key);
    if (!fromStorage) return 0;
    return Number(fromStorage);
  }
