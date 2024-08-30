import { createContext, useContext } from "react";
import  {io, Socket}  from 'socket.io-client';
import {getSocketServerUrl} from "../../../secret/constants";

const socket: Socket = io(getSocketServerUrl());
const SocketContext = createContext(socket);

export function useSocket(){
    return useContext(SocketContext);
}


export function SocketProvider({children}: any){
    return(
        <SocketContext.Provider value = {socket}>
            {children}
        </SocketContext.Provider>
    )
}


