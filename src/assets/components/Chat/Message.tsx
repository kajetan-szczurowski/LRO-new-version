import { MessageType, MessageResultType } from "./Chat"
import NumericAndTextSpans from "../NumericAndTextSpans";

const damageIcons = new Map([
    ['S', '⚔️'],
    ['P', '🏹'],
    ['B', '🔨'],
    ['F', '🔥'],
    ['L', '⚡']
]);

export default function Message({data}:props) {
    const {messageTypeName, text, sender, rawOrder, result, comment, totalValue} = data;

  return(
    <div>
        <MessageContent />
    </div>
  )


  function MessageContent(){
    const naturalClass = isNatural(text, rawOrder)? 'critical-roll': '';
    switch(messageTypeName) {
        case 'system':return(<span className = 'system-message'>{text}</span>)
        case 'message': return(
            <>
                <span className = 'message-sender'>{sender}: </span>
                <span className = 'message-text'>{text}</span>
            </>

        )

        case 'roll': return(
            <>
                <span className = 'message-sender'>{sender}: </span>
                <span className = 'in-brackets message-raw-roll'>
                    <NumericAndTextSpans value = {rawOrder} digitsClass="message-raw-roll digit-font" nonDigitsClass="message-raw-roll"/>
                </span>
                <span className={'splited-result-wrapper ' + naturalClass}>
                    <NumericAndTextSpans value = {text} digitsClass="message-splited-result digit-font" nonDigitsClass="message-splited-result"/>
                </span>
                <> </>
                <NumericAndTextSpans value = {handleRollResultValue(result, totalValue)} digitsClass="message-roll-result digit-font" nonDigitsClass="message-roll-result"/>
                {comment && <> </>}
                {comment && <NumericAndTextSpans value = {comment} digitsClass="message-roll-comment digit-font" nonDigitsClass="message-roll-comment"/>}
            </>
        )
      }
  }

  function handleRollResultValue(resultText: MessageResultType | undefined, totalValue: number | string | undefined){
    if (!resultText) return undefined;
    if (!Array.isArray(resultText)) return resultText;
    if (!totalValue) return undefined;
    let handled = "";
    resultText.forEach(chunk => {handled = appendTextValue(handled, chunk)}); 
    return `${handled.slice(0, handled.length - 3)} = ${totalValue}`;

    function appendTextValue(text:string, current:[number, string]){
        return text + `${current[0]}${inputSign(current[1])} + `;
    }

    function inputSign(signText:string){
        const icon = damageIcons.get(signText);
        return icon? icon : `[${signText}]`;
    }
  }

  function isNatural(rollText: string, rollOrder: string | undefined){
    if (!rollOrder) return false;
    if (Array.isArray(rollText)) return false;
    const orderStart = rollOrder.slice(0,3);
    if (orderStart !== 'd20') return false;
    const textStart = rollText.slice(0,2);
    return textStart === '20' || textStart.trim() === '1';
  }
} 

type props = {
    data : MessageType
}
