// Tipos e enums para KYC

export enum KycStatusCode {
  NOT_STARTED = 100,
  IN_PROGRESS = 200,
  APPROVED = 300,
  DECLINED = 400,
  REVIEW = 500,
  EXPIRED = 600,
  ABANDONED = 700,
  KYC_EXPIRED = 800,
}

export interface KycStatus {
  code: KycStatusCode;
  label: string;
  color: string;
}

export const getKycStatusInfo = (statusCode: number): KycStatus => {
  switch (statusCode) {
    case KycStatusCode.APPROVED:
      return {
        code: KycStatusCode.APPROVED,
        label: 'KYC Aprovado',
        color: '#10B981'
      };
    case KycStatusCode.IN_PROGRESS:
      return {
        code: KycStatusCode.IN_PROGRESS,
        label: 'KYC Em Progresso',
        color: '#3B82F6'
      };
    case KycStatusCode.REVIEW:
      return {
        code: KycStatusCode.REVIEW,
        label: 'KYC Em Revisão',
        color: '#F59E0B'
      };
    case KycStatusCode.DECLINED:
      return {
        code: KycStatusCode.DECLINED,
        label: 'KYC Recusado',
        color: '#EF4444'
      };
    case KycStatusCode.EXPIRED:
    case KycStatusCode.KYC_EXPIRED:
      return {
        code: statusCode,
        label: 'KYC Expirado',
        color: '#EF4444'
      };
    case KycStatusCode.ABANDONED:
      return {
        code: KycStatusCode.ABANDONED,
        label: 'KYC Abandonado',
        color: '#6B7280'
      };
    case KycStatusCode.NOT_STARTED:
    default:
      return {
        code: KycStatusCode.NOT_STARTED,
        label: 'KYC Não Iniciado',
        color: '#6B7280'
      };
  }
};

export const shouldShowKycPrompt = (statusCode: number): boolean => {
  // Mostrar prompt de KYC apenas se não estiver aprovado
  return statusCode !== KycStatusCode.APPROVED;
};
