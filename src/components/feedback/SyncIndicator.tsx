import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useCommandQueue } from '../../store/useCommandQueue';

export function SyncIndicator() {
  const { queue, lastAck, clearLastAck } = useCommandQueue();

  useEffect(() => {
    if (lastAck) {
      const timer = setTimeout(() => {
        clearLastAck();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastAck, clearLastAck]);

  const syncingCount = queue.filter(c => c.status === 'SINCRONIZANDO').length;
  
  const offlineCount = queue.filter(
    c => c.status === 'PENDENTE' || c.status === 'FALHOU'
  ).length;

  if (syncingCount === 0 && offlineCount === 0 && !lastAck) {
    return null;
  }

  const baseClasses = "absolute top-10 self-center px-5 py-3 rounded-full flex-row items-center shadow-lg z-50";

  if (syncingCount > 0) {
    return (
      <View className={`${baseClasses} bg-primary`}>
        <ActivityIndicator size="small" color="#000000" className="mr-2" />
        <Text className="text-base-pure font-body font-bold text-sm">
          {syncingCount > 1 
            ? `☁️ Sincronizando ${syncingCount} comandos...` 
            : '☁️ Sincronizando...'}
        </Text>
      </View>
    );
  }

  if (offlineCount > 0) {
    return (
      <View className={`${baseClasses} bg-semantic-warning`}>
        <Text className="text-base-pure font-body font-bold text-sm">
          ⚠️ {offlineCount > 1 
               ? `${offlineCount} salvos no dispositivo` 
               : 'Salvo no dispositivo'}
        </Text>
      </View>
    );
  }

  if (lastAck) {
    return (
      <View className={`${baseClasses} bg-semantic-success`}>
        <Text className="text-base-pure font-body font-bold text-sm">
          ✅ Registrado
        </Text>
      </View>
    );
  }

  return null;
}