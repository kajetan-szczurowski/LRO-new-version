import { MessageType } from "./Chat"
import NumericAndTextSpans from "../NumericAndTextSpans";

export default function Message({data}:props) {
    const {messageTypeName, text, sender, rawOrder, result, comment} = data;

  return(
    <div>
        <MessageContent />
    </div>
  )


  function MessageContent(){
    switch(messageTypeName) {
        case 'system':return(<span className = 'system-message'>{text}</span>)
        case 'message': return(
            <>
                <span className = 'message-sender'>{sender}</span>
                <> : </>
                <span className = 'message-text'>{text}</span>
            </>

        )

        case 'roll': return(
            <>
                <span className = 'message-sender'>{sender}: </span>
                <span className = 'in-brackets message-raw-roll'>
                    <NumericAndTextSpans value = {rawOrder} digitsClass="message-raw-roll digit-font" nonDigitsClass="message-raw-roll"/>
                </span>
                <span className='splited-result-wrapper'>
                    <NumericAndTextSpans value = {text} digitsClass="message-splited-result digit-font" nonDigitsClass="message-splited-result"/>
                </span>
                <> </>
                <NumericAndTextSpans value = {result} digitsClass="message-roll-result digit-font" nonDigitsClass="message-roll-result"/>
                {comment && <> </>}
                {comment && <NumericAndTextSpans value = {comment} digitsClass="message-roll-comment digit-font" nonDigitsClass="message-roll-comment"/>}
            </>
        )
      }
  }
} 

type props = {
    data : MessageType
}
