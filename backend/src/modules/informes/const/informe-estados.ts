export const ESTADO = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En Proceso',
  EN_REVISION: 'En Revisión',
  FINALIZADO: 'Finalizado',
  DEVUELTO: 'Devuelto',
  ANULADO: 'Anulado',
} as const;

export type EstadoInforme = (typeof ESTADO)[keyof typeof ESTADO];

export const ESTADOS_VALIDOS: EstadoInforme[] = Object.values(ESTADO);

/** Transiciones válidas: [desde, hasta][] */
export const TRANSICIONES: ReadonlyMap<EstadoInforme, EstadoInforme[]> =
  new Map([
    [ESTADO.PENDIENTE, [ESTADO.EN_PROCESO, ESTADO.ANULADO]],
    [ESTADO.EN_PROCESO, [ESTADO.EN_REVISION, ESTADO.ANULADO]],
    [ESTADO.EN_REVISION, [ESTADO.FINALIZADO, ESTADO.DEVUELTO, ESTADO.ANULADO]],
    [ESTADO.DEVUELTO, [ESTADO.EN_PROCESO, ESTADO.ANULADO]],
    [ESTADO.FINALIZADO, []],
    [ESTADO.ANULADO, []],
  ]);
