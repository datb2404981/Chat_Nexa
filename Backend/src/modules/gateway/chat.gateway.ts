import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";


@WebSocketGateway({
  cors: {
    origin: '*', // Trong thực tế nên để domain cụ thể của frontend
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  // Biến server giúp bạn emit message tới toàn bộ client
  @WebSocketServer() server: Server;
  
  private logger: Logger
    = new Logger('ChatGateway');

  // Map<UserId, SocketId[]>
  private onlineUsers = new Map<string, string[]>();

  // 1. Chạy khi server khởi động
  afterInit(server: Server) {
    this.logger.log('Socket Server Initilized');
  }

  // 2. Chạy khi có Client kết nối (Quan trọng: Check Auth ở đây)
  async handleConnection(client: Socket) {
    try {
      // Lấy token từ header: Authorization: Bearer <token>
      const authHeader = client.handshake.headers.authorization;
      
      if (!authHeader) {
          console.log('Không có token -> Ngắt kết nối');
          client.disconnect();
          return;
      }

      const token = authHeader.split(' ')[1];
      
      // Verify token
      const decoded = await this.jwtService.verify(token, {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET') // Nhớ lấy đúng secret key
      });

      // Gắn thông tin user vào client để dùng ở các bước sau
      client.data.user = decoded; 
      const userId = decoded.sub || decoded._id;

      // Handle Online Logic
      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, []);
      }
      
      // Join Room userId to receive notifications
      client.join(userId);
      
      // Send initialized online list to the connected client
      const onlineUserIds = Array.from(this.onlineUsers.keys());
      client.emit('initial_online_users', onlineUserIds);

      const userSockets = this.onlineUsers.get(userId)!;
      userSockets.push(client.id);

      // Nếu đây là thiết bị đầu tiên kết nối -> User Online
      if (userSockets.length === 1) {
        this.server.emit('user_status_change', { userId, isOnline: true });
      }
      
      this.logger.log(`Client Connected: ${client.id} - User: ${decoded.email}`);

    } catch (error) {
      console.log('Lỗi xác thực socket:', error.message);
      client.disconnect();
    }
  }

  // 3. Chạy khi Client mất kết nối (Tắt tab, rớt mạng)
  handleDisconnect(client: Socket) {
    if (!client.data.user) return;
    
    const userId = client.data.user.sub || client.data.user._id;
    if (this.onlineUsers.has(userId)) {
      const userSockets = this.onlineUsers.get(userId)!;
      const index = userSockets.indexOf(client.id);
      
      if (index !== -1) {
        userSockets.splice(index, 1);
      }

      // Nếu không còn socket nào -> User Offline
      if (userSockets.length === 0) {
        this.onlineUsers.delete(userId);
        this.server.emit('user_status_change', { userId, isOnline: false });
        console.log(`User ${client.data.user.email} is Offline`);
      }
    }

    this.logger.log(`Client Disconnected: ${client.id}`);
  }

  // --- CÁC SỰ KIỆN CHAT ---

  // User tham gia vào phòng chat cụ thể
  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if(conversationId) {
        client.join(conversationId);
        // console.log(`User ${client.data.user.email} joined room ${conversationId}`);
        // Gửi thông báo cho user biết đã join thành công
        client.emit('joined_room', `Bạn đã vào phòng ${conversationId}`);
    }
  }

  // User đang gõ phím...
  @SubscribeMessage('typing')
  handleTyping(
      @MessageBody() conversationId: string,
      @ConnectedSocket() client: Socket
  ) {
      // Báo cho những người khác trong phòng (trừ bản thân mình)
      client.to(conversationId).emit('on_typing', { userId: client.data.user._id });
  }
}