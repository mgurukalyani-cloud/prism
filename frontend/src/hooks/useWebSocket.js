import { useState, useEffect, useCallback } from 'react';
import { wsClient } from '../services/websocket';
import { api } from '../services/api';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [latestAlert, setLatestAlert] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    wsClient.connect();

    const unsubscribe = wsClient.subscribe((msg) => {
      if (msg.type === 'connection_status') {
        setIsConnected(msg.connected);
      } else if (msg.type === 'alert') {
        setLatestAlert(msg);
        setAlerts((prev) => [msg, ...prev.slice(0, 49)]);
      } else if (msg.type === 'simulation_status') {
        setIsSimulating(msg.is_running);
      }
    });

    // Check initial simulation status
    api.getSimulationStatus().then((res) => {
      if (res && res.is_running !== undefined) {
        setIsSimulating(res.is_running);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const dismissLatestAlert = useCallback(() => {
    setLatestAlert(null);
  }, []);

  const toggleSimulation = useCallback(async () => {
    if (isSimulating) {
      await api.stopSimulation();
      setIsSimulating(false);
    } else {
      await api.startSimulation();
      setIsSimulating(true);
    }
  }, [isSimulating]);

  return {
    isConnected,
    latestAlert,
    alerts,
    isSimulating,
    dismissLatestAlert,
    toggleSimulation,
    triggerScenario: api.triggerScenario
  };
}
