import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface WebSocketMessage {
  type: string;
  orderId: number;
  subject: string;
  message: string;
  timestamp: string;
}

interface UseWebSocketProps {
  restaurantId: number | null;
  onNewOrder: (data: WebSocketMessage) => void;
  onOrderUpdate: (data: WebSocketMessage) => void;
}

export const useWebSocket = ({ restaurantId, onNewOrder, onOrderUpdate }: UseWebSocketProps) => {
  const clientRef = useRef<Client | null>(null);

  const connect = useCallback(() => {
    if (!restaurantId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://192.168.0.116:8085/ws'),
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('WebSocket connected');

        
        client.subscribe(
          `/topic/restaurant/${restaurantId}/new-order`,
          (message) => {
            const data: WebSocketMessage = JSON.parse(message.body);
            onNewOrder(data);
          }
        );

      
        client.subscribe(
          `/topic/restaurant/${restaurantId}/order-update`,
          (message) => {
            const data: WebSocketMessage = JSON.parse(message.body);
            onOrderUpdate(data);
          }
        );
      },

      onDisconnect: () => {
        console.log('WebSocket disconnected');
      },

      onStompError: (frame) => {
        console.error('WebSocket error:', frame);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [restaurantId, onNewOrder, onOrderUpdate]);

  useEffect(() => {
    connect();
    return () => {
      clientRef.current?.deactivate();
    };
  }, [connect]);
};
