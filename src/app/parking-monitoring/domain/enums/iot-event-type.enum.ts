export enum IoTEventType {
  ALPR_MATCH = 'ALPR_MATCH',     // Lectura de placa
  SENSOR_PULL = 'SENSOR_PULL',   // Cambio de estado de celda
  PAY_SUCCESS = 'PAY_SUCCESS',   // Pago realizado
  SYS_ALERT = 'SYS_ALERT'        // Error de hardware/red
}
