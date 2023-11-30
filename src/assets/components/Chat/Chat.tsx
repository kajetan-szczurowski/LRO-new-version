import ChatInput from "./ChatInput";
import ChatAuxButton from "./ChatAuxButton";
import { signal } from "@preact/signals-react";
import Message from "./Message";


export const messages = signal<MessageType[]>([{id: '12345', messageTypeName: 'system', text:'Hello, feel free to type something and click enter.'}]);

export default function() {
  const toRender = messages.value;
  return (
    <div id = 'chat'>
        <div id = 'messages'>
            {toRender.map(msg => {return(<Message key = {msg.id} data = {msg}/>)})}
        </div>

        <ChatInput />
        <ChatAuxButton />

    </div>
  )


  }


  export type MessageType = {
    id: string | number,
    messageTypeName: string,
    text: string,
    result? :string,
    sender? :string,
    rawOrder? :string,
    comment? :string
  }
// }
