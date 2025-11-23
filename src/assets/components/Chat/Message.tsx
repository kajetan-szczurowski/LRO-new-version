import { MessageType } from "./Chat"
import { isNatural } from "./rolls";
import RollMessage from "./RollMessage";


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


       case 'roll': {
           const rollProps = {
               "sender": sender, "rawOrder": rawOrder, "naturalClass":naturalClass, "text": text,
               "result": result, "totalValue": totalValue, "comment": comment}
           return( <RollMessage {...rollProps} /> )
       }


     }
 }




}


type props = {
   data : MessageType
}





