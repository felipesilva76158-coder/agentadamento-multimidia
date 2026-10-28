export type Shift = 'Matutino' | 'Vespertino';

export type BookingStatus = 'CONFIRMADO' | 'EM_USO' | 'CONCLUIDO' | 'CANCELADO';

export type EquipmentCategory = 'TV' | 'Chromebook' | 'Caixa de Som' | 'Projetor' | 'Outro';

export type LocationType = 'Biblioteca' | 'Laboratório' | 'Sala de Aula' | 'Auditório/Pátio';

export interface EquipmentItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  code: string; // Ex: TV-01, CHR-K01, SOM-01, PROJ-01
  description: string;
  availableCount: number;
  totalCount: number;
}

export interface Booking {
  id: string;
  teacherName: string;
  subject: string; // Disciplina (ex: Língua Portuguesa, Matemática, História...)
  classGroup: string; // Turma (ex: 34.01, 33.01, etc.)
  date: string; // YYYY-MM-DD (apenas segunda a sexta)
  shift: Shift;
  periods: string[]; // Ex: ["1ª Aula", "2ª Aula"] ou ["Turno Completo"]
  equipments: string[]; // Nomes dos equipamentos selecionados
  location: LocationType;
  locationDetails?: string; // Ex: "Sala 08 - Bloco B" ou "Laboratório Multiuso"
  purpose: string; // Objetivo pedagógico / Conteúdo
  status: BookingStatus;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  completionReason?: 'EXPIRADO_DATA' | 'MANUAL_DESMARCADO' | 'CONCLUIDO_USO';
}

export interface ConflictInfo {
  hasConflict: boolean;
  conflictingBookings: Booking[];
  reason?: string;
}
