import {useState, useRef} from 'react'
import { useSocket } from '../../providers/SocketProvider'
import RollMessage from '../Chat/RollMessage';
import { RollMessageProps } from '../Chat/RollMessage';
import { sendPrivateRollingOrder } from './RollingSocket';


export default function RollingBoxForGM() {
   const socket = useSocket();
   const [result, setResult] = useState<RollMessageProps>({});
   const inputRef = useRef<HTMLInputElement>(null);


   socket.on('gm-rolled', payload => {setResult(payload)});


   return(
       <section>
           <form onSubmit = {handleSubmit}>
               <label>GM's rolling input:</label>
               <input type = 'text' ref = {inputRef} />
               <input type = 'submit'/>
           </form>
           {result.rawOrder && <ResultDisplayer />}
       </section>
   )


   function handleSubmit(e: React.FormEvent){
       if (!inputRef.current) return;
       e.preventDefault();
       sendPrivateRollingOrder(socket, inputRef.current.value);   
   }


   function ResultDisplayer(){
       return(
           <div>
               <RollMessage {...result}/>
           </div>
       )
   }


}





