// backend/src/ramen/ramen.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

// cors設定をして、Next.jsからの接続を許可
@WebSocketGateway({
  cors: { origin: '*' }, 
})
export class RamenGateway {
  @WebSocketServer()
  server: Server;

  // 全員にタイムラインが更新旨を通知する関数
  notifyTimelineUpdate() {
    this.server.emit('timelineUpdated');
  }
}