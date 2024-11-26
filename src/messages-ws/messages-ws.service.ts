import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
    //actualizamos la interfaz para que guarde el socket(client), y el user si existe
    [id: string] : {
        socket: Socket,
        user: User
    }
}

@Injectable()
export class MessagesWsService {

    private connectedCLients : ConnectedClients = {};

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){}

    async registerClient( client: Socket, userId: string){
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });
        if (!user) throw new Error('User not found');
        if (!user.isActive) throw new Error('User not active');
        
        //llamamos el metodo que revisa conexiones y las cierra
        this.checkUserConnection(user);

        //almacenamos cliente
        this.connectedCLients[client.id] = {
            socket: client,
            user: user
        };
    }

    removeClient(clientId: string){
        delete  this.connectedCLients[clientId];
    }
 
    //este metodo retornara las keys de los clientes
    get clientsConnected() : string[]{
        return Object.keys(this.connectedCLients);
    }

    getUserFullName( socketId : string){
        return this.connectedCLients[socketId].user.fullName;
    }

    private checkUserConnection(user: User){
        
        //Esta parte del codigo crea un array con las llaves de los objetos
        for (const clientId of Object.keys(this.connectedCLients)) {
            //Aqui accedemos a el objeto porque accedemos a su posicion on el id obtenido en el of
            const connectedClient = this.connectedCLients[clientId];
            //Aqui tenemos ya a el objeto con users y socket
            if (connectedClient.user.id === user.id) {
                //si existe una conexion anterior la desconectamos
                connectedClient.socket.disconnect();
                break;
            }
        }    
    }
}
