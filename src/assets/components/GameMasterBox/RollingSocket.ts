import { Socket } from "socket.io-client";

export function sendPrivateRollingOrder(socket: Socket, order: string){
    socket.emit('gm-is-rolling', {value: order, sender: 'GM'});   
}