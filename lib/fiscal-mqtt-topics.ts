/** Sufijos de tópico fiscal (12 hex de MAC sin separadores van antes). */
export const FISCAL_MQTT_TOPIC_SUFFIX = {
  CMD_SERVER: '/AEG_Fiscal/Integracion/CmdServer',
  COMANDO: '/AEG_Fiscal/Integracion/Comando',
  RESPUESTA: '/AEG_Fiscal/Integracion/Respuesta',
} as const;

export function compactMac(mac: string): string {
  return mac.replace(/[^0-9A-Fa-f]/gi, '').toUpperCase();
}

export function fiscalComandoTopic(compactMac: string): string {
  return `/${compactMac}${FISCAL_MQTT_TOPIC_SUFFIX.COMANDO}`;
}

export function fiscalRespuestaTopic(compactMac: string): string {
  return `/${compactMac}${FISCAL_MQTT_TOPIC_SUFFIX.RESPUESTA}`;
}

export const FISCAL_MQTT_COMANDO_RESPUESTA_GUIDE =
  'AEG Core publica en Comando; la impresora responde en Respuesta. CmdServer solo lo usa la impresora al arrancar con ptrEnajenar (enajenación).';

export function fiscalMqttTopicExamples(macAddress: string) {
  const normalized = compactMac(macAddress);
  return {
    comando: fiscalComandoTopic(normalized),
    respuesta: fiscalRespuestaTopic(normalized),
  };
}
