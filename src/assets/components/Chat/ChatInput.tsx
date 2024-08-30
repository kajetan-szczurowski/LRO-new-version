import {SyntheticEvent, useRef} from 'react'
import {signal, useComputed, useSignal} from '@preact/signals-react';
import { useSocket } from '../../providers/SocketProvider';
import { InputListWithLimit } from '../../dataTypes/chatHistory';
import { characterNameSignal } from '../CharacterBox/CharacterBox';

export const chatInputSignal = signal({modifier: '', description: ''});

export default function ChatInput() {
  const historyKey = 'lets-roll-one-chat-input-history';
  const SESSION_STORAGE_LOGIN_ID_KEY = 'LRO-logged-user-ID';
  const inputHistoryLimit = 20;
  const socket = useSocket();
  const textInput = useComputed(compileChatSignal);
  // const chatHistory = useLocalStorageSignal(historyKey, new InputListWithLimit<string>(inputHistoryLimit));
  const chatHistory = useSignal(new InputListWithLimit(inputHistoryLimit, historyKey));

  const inputRef = useRef<HTMLInputElement>(null);
  prepareInput(textInput.value);
  document.onkeydown = keyEvent;
  return (
    <form onSubmit={handleSubmit} >
      <input name = 'chatInput'  type= 'text' className = 'main-text' id = {'input-area'} ref = {inputRef} autoComplete="off" maxLength={150}/>
    </form>

  )

  function handleSubmit(e: SyntheticEvent){
    e.preventDefault();
    const target = e.target as typeof e.target & {chatInput: {value: string}};
    const chatValue = target.chatInput.value;
    if (chatValue == '') return;
    if (socket) socket.emit('chat-message', {value: chatValue, sender: characterNameSignal.value, userID : sessionStorage.getItem(SESSION_STORAGE_LOGIN_ID_KEY)}); 
    if (chatValue !== chatHistory.value.getIthFromEnd(0)) chatHistory.value.push(chatValue);
    // chatHistory.value.printList();
    //TODO: move To BackEnd
    // messages.value = [...messages.value, prepMessage(chatValue)];
    chatInputSignal.value = {description: '', modifier: ''};
    target.chatInput.value = '';
    // resetHistoryIndex();
  }

  function keyEvent(e: KeyboardEvent){
    if (!inputRef.current) return;
    if (inputRef.current !== document.activeElement) return;

    if (e.key === 'ArrowUp') chatHistory.value.moveCurrentBack();
    else if (e.key === 'ArrowDown') chatHistory.value.moveCurrentForward();
    else return;

    e.preventDefault();

    // const fromHistory = chatHistory.value.getIthFromEnd(chatHistoryIndex.current);
    const fromHistory = chatHistory.value.getCurrent();
    if (!fromHistory) return;
    inputRef.current.value = fromHistory;
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
