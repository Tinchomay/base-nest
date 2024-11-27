import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

//Este es el decorador para ws
@WebSocketGateway({ cors: true})
//Para reaccionar a las conexiones y desconexiones tenemos que implementar estos metodos
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  //El server es de socket.io
  //este server es donde estan conectados todos los clientes
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    //inyectamos el jwt service
    private readonly jwtService : JwtService,
  ) {}

  //importamos el socket de socket.io
  //estos dos metodos tienen el cliente ya automaticamente
  async handleConnection(client: Socket) {
    //Aqui despues de los headers es la propiedad que nos manda el cliente
    const token = client.handshake.headers.authentication as string;
    let payload : JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      //el metodo disconnect cierra la conexion
      client.disconnect();
      return;
    }
    this.wss.emit('clients-updated', this.messagesWsService.clientsConnected)

  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    this.wss.emit('clients-updated', this.messagesWsService.clientsConnected)
  }

  //mensaje del cliente
  //Utilizamos el decorador @SubscribeMessage que solo necesitamos poner el nombre del evento que queremos escuchar
  @SubscribeMessage('messageFromClient')
  //con ese decorador ya tenemos acceso al client y al payload que se envia en el evento
  handleMessageFromClient( client: Socket, payload: NewMessageDto){
    //emitir mensajes

    //enviar mensaje solo al cliente
    // client.emit('messageFromServer', {
    //   fullName: 'Agustin',
    //   message: payload.message || ''
    // })

    //emitir a todos menos al cliente que emitio el mensaje
    // client.broadcast.emit('messageFromServer', {
    //   fullName: 'Agustin',
    //   message: payload.message || ''
    // });

    //emitir a todos los clientes
    this.wss.emit('messageFromServer', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || ''
    })

  }
}
