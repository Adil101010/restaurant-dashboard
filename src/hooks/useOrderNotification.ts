import { useCallback, useEffect, useRef } from 'react';

const useOrderNotification = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/new-order.mp3');
    audioRef.current.volume = 1.0;

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.warn('Sound error:', e));
    }
  }, []);

  const showBrowserNotification = useCallback((title: string, body: string, orderId: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const n = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: `order-${orderId}`,
        requireInteraction: true,
      });
      n.onclick = () => { window.focus(); n.close(); };
    }
  }, []);

  const notifyNewOrder = useCallback((orderData: any) => {
    const orderId = orderData?.orderId || 'N/A';
    const message = orderData?.message || '';
    playSound();
    showBrowserNotification('🛒 Naya Order Aaya!', `Order #${orderId} • ${message}`, String(orderId));
  }, [playSound, showBrowserNotification]);

  return { notifyNewOrder, playSound };
};

export default useOrderNotification;
