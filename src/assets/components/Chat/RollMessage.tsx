import { handleRollResultValue } from "./rolls.ts";
import NumericAndTextSpans from "../NumericAndTextSpans";
import { MessageResultType } from "./Chat";


export default function RollMessage({sender, rawOrder, naturalClass, text, result, totalValue, comment}: RollMessageProps) {


   return(
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


export type RollMessageProps = {
   sender?: string,
   rawOrder?: string,
   naturalClass?: string,
   text?: string,
   result?: MessageResultType,
   totalValue?: string|number,
   comment?: string
}

