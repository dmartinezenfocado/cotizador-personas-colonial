export type DocType = 'cedula' | 'rnc';

export interface GeneralDataConfig {
  showCliente?: boolean;
  requireCliente?: boolean;
  showIntermediario?: boolean;
  requireIntermediario?: boolean;
  showMoneda?: boolean;
  requireMoneda?: boolean;
  showFormaPago?: boolean;
  requireFormaPago?: boolean;
  showFecha?: boolean;
  requireFecha?: boolean;
  showDocumento?: boolean;
  requireDocumento?: boolean;
  docType?: DocType;
  showFechaNacimiento?: boolean;
  requireFechaNacimiento?: boolean;
  autoEdad?: boolean;
}
