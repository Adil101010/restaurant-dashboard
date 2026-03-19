import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';


export interface WebSocketMessage {
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
  const onNewOrderRef = useRef(onNewOrder);
  const onOrderUpdateRef = useRef(onOrderUpdate);

  useEffect(() => { onNewOrderRef.current = onNewOrder; }, [onNewOrder]);
  useEffect(() => { onOrderUpdateRef.current = onOrderUpdate; }, [onOrderUpdate]);

  useEffect(() => {
    if (!restaurantId) return;

    console.log('🔌 Connecting WebSocket for restaurantId:', restaurantId);

    const client = new Client({
      brokerURL: 'ws://192.168.0.104:8085/ws',
      reconnectDelay: 5000,

      onConnect: () => {
        console.log(' WebSocket connected! restaurantId:', restaurantId);

        client.subscribe(`/topic/restaurant/${restaurantId}/new-order`, (message) => {
          const data: WebSocketMessage = JSON.parse(message.body);
          console.log(' New order:', data);
          onNewOrderRef.current(data);
        });

        client.subscribe(`/topic/restaurant/${restaurantId}/order-update`, (message) => {
          const data: WebSocketMessage = JSON.parse(message.body);
          console.log(' Order update:', data);
          onOrderUpdateRef.current(data);
        });
      },

      onDisconnect: () => console.log(' WebSocket disconnected'),
      onStompError: (frame) => console.error(' STOMP error:', frame),
      onWebSocketError: (e) => console.error(' WS error:', e),
      onWebSocketClose: (e) => console.error(' WS closed:', e.code, e.reason),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      console.log('🔄 WebSocket cleanup');
      client.deactivate();
    };
  }, [restaurantId]);
};
