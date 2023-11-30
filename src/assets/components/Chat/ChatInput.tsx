import {SyntheticEvent} from 'react'
import {signal, useComputed} from '@preact/signals-react';
import { messages } from './Chat';

export const chatInputSignal = signal({modifier: '', description: ''});


export default function ChatInput() {
  const textInput = useComputed(compileChatSignal);
  prepareInput(textInput.value);
  return (
    <form onSubmit={handleSubmit}>
      <input name = 'chatInput'  type= 'text' className = 'main-text' id = {'input-area'} />
    </form>

  )

  function handleSubmit(e: SyntheticEvent){
    e.preventDefault();
    const target = e.target as typeof e.target & {chatInput: {value: string}};
    const chatValue = target.chatInput.value;
    if (chatValue == '') return; 
    //TODO: move To BackEnd
    messages.value = [...messages.value, prepMessage(chatValue)];
    chatInputSignal.value = {description: '', modifier: ''};
  }

  function prepMessage(message: string){
    //Placeholder - this will be on back end
    const id = Date.now() + Math.random();
    if (!message.includes('#')) return{id: id, messageTypeName : "message", text: message, sender: 'Awesome Person'};
    const trimmed = message.trim();
    if (trimmed.charAt(0) !== '#') return {id: id, messageTypeName : "system", text: 'Something is off with your input'}
    const rollOrders = trimmed.substring(1, trimmed.length).split('#');
    const sender = 'Awesome Person'
    const rawOrder = rollOrders[0].trim();
    const result = String(Math.ceil(Math.random() * 42));
    const text = `d20 + ${Math.floor(Math.random()*10)}`;
    if (rollOrders.length > 1) return {id:id, messageTypeName: 'roll', sender:sender, rawOrder: rawOrder, result:result, text: text, comment: rollOrders[1].trim()}
    return {id:id, messageTypeName: 'roll', sender:sender, rawOrder: rawOrder, result:result, text: text}

  }


  function prepareInput(newInputText: string){
    const inputArea: any = document.getElementById('input-area');
    const focusIndex = newInputText.indexOf(' #');
    if (inputArea) inputArea.value = newInputText;
    if (inputArea) inputArea.setSelectionRange(focusIndex, focusIndex);
    if (inputArea) inputArea.focus();

  }

  function compileChatSignal(){
    const {modifier, description} = chatInputSignal.value;
    if (!modifier && !description) return('');
    if (description === '') return('');

    if (description === 'singular-dice'){
      return useDiceSignal(modifier);
    }

    if (description === 'secret') {
      return useSecretRoll();
    }

    const lettersInside = /[a-zA-Z]/g.test(modifier);
    if (!lettersInside){
       return `#d20 + ${modifier.replace('+', '').replace('-','')} #${description}`;
    }
    
    if (lettersInside){
      const type = modifier.slice(-1)
      const roll = modifier.substring(0, modifier.length - 1).trim();
      return `#${roll} #${description} Damage [${type}]`;
    }

    return('');
}

  function useSecretRoll(){
    const inputArea: any = document.getElementById('input-area');
    if (!inputArea) return'';
    const secretValue = '%S';
    const value = inputArea.value;
    if (!value.includes(secretValue)) return `${value.trim()} ${secretValue}`;
    return value.substring(0, value.indexOf(secretValue));

  }

  function useDiceSignal(modifier : string){
    const inputArea: any = document.getElementById('input-area');
    if (!inputArea) return'';
    const value = inputArea.value;
    let returned : string;
    const percentValue = (/%[a-zA-Z]/.test(value))? value.substring(value.indexOf('%') + 1) : '';
    const newValue = value.replaceAll(`%${percentValue}`, '');

    if (!value.includes('#')) returned = compileDiceSignal(modifier, newValue);
    else {
      const sections = newValue.substring(1, newValue.length).split('#');
      const rollsSection = compileDiceSignal(modifier, '#' + sections[0]);
      if (newValue.trim().lastIndexOf('#') !== 0) {
      returned = `${rollsSection} #${sections[1]}`;
      }
      else returned = rollsSection;
    }
    
    returned = returned.trim();
    if (percentValue !== '') return `${returned} %${percentValue}`;
    return returned;
  }

  function compileDiceSignal(modifier : string, value : string){

    const index = value.indexOf(modifier);
    const diceIncluded = /([0-9]*d[0-9]+)+/g.test(value);
    
    if (!value.includes('#')) return `#${modifier}`;
    if (index === 1) return `#2${modifier}${value.substring(('#2'+ modifier).length - 1, value.length)}`;
    if (index < 0 && diceIncluded) return value.trim() + ` + ${modifier}`;

    if (index > 1){
      const numberToChangeString = findNumberOfDicesInRoll(value, index);
      const numberToChange = Number(numberToChangeString);
      const diceNumberIndex = value.indexOf(numberToChangeString + modifier);
      const changedNumber = numberToChange?  numberToChange + 1 : 2;
      const returned = `${value.substring(0, diceNumberIndex)}${changedNumber}${modifier}${value.substring(index + modifier.length, value.length)}`
      return returned.trim();
    }

    return ''
  }

  function findNumberOfDicesInRoll(roll: string, index : number){
    let currentIndex = index - 1;
    let textValue = '';

    while (currentIndex >= 0) {
      const currentChar = roll.charAt(currentIndex);
      if ( /^\d+$/.test(currentChar)){
        textValue += currentChar;
        currentIndex --;
      }
      else{
        return reverseString(textValue);
      }
    }
    return '';
  }

  function reverseString(input : string){
    if (input.length === 0) return '';
    const stack = new Array(input.length - 1);
    let reversed = '';
    for (let i = 0; i < input.length; i++){
      stack[i] = input.charAt(i);
    }
    for (let j = input.length - 1; j >= 0; j--){
      reversed += stack.pop();
    }
    return reversed;
  }
}
