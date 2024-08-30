import { useEffect, useState, useRef } from "react";
import ChatInput from "./ChatInput";
import ChatAuxButton from "./ChatAuxButton";
import Message from "./Message";
import { useSocket } from "../../providers/SocketProvider";



// export const messages = signal<MessageType[]>([{id: '12345', messageTypeName: 'system', text:'Hello, feel free to type something and click enter.'}]);

export default function() {
  // socket.on('messages', (msgFromServer) => messagesRef.current = msgFromServer);
  return (
    <div id = 'chat'>

        <ChatDisplayer />
        <ChatInput />
        <ChatAuxButton />

    </div>
  )

  function ChatDisplayer(){
    const divRef = useRef<HTMLDivElement>(null);
    const socket = useSocket();
    const [messages, setMessages] = useState<MessageType[]>([]);
    useEffect(() => scrollChatBox(), [messages])
    socket.on('messages', (msgFromServer) => setMessages(msgFromServer))
    return(
      <div id = 'messages' ref = {divRef}>
        {messages.map(msg => {return(<Message key = {msg.id} data = {msg}/>)})}
      </div>
    )
 
    function scrollChatBox(){
      if (!divRef.current) return;
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  }


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
