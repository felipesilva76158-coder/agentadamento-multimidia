import { Booking, Shift } from '../types/multimedia';

export const PERIODS_LIST = [
  '1ª Aula',
  '2ª Aula',
  '3ª Aula',
  '4ª Aula',
  '5ª Aula',
];

export const PERIOD_TIMES: Record<Shift, Record<string, string>> = {
  Matutino: {
    '1ª Aula': '07:15 - 08:05',
    '2ª Aula': '08:05 - 08:55',
    '3ª Aula': '08:55 - 09:45',
    '4ª Aula': '10:00 - 10:50',
    '5ª Aula': '10:50 - 11:40',
  },
  Vespertino: {
    '1ª Aula': '13:00 - 13:50',
    '2ª Aula': '13:50 - 14:40',
    '3ª Aula': '14:40 - 15:30',
    '4ª Aula': '15:45 - 16:40',
    '5ª Aula': '16:40 - 17:25',
  },
};

export const WEEKDAYS = [
  { dayIndex: 1, name: 'Segunda-feira', shortName: 'Seg' },
  { dayIndex: 2, name: 'Terça-feira', shortName: 'Ter' },
  { dayIndex: 3, name: 'Quarta-feira', shortName: 'Qua' },
  { dayIndex: 4, name: 'Quinta-feira', shortName: 'Qui' },
  { dayIndex: 5, name: 'Sexta-feira', shortName: 'Sex' },
];

/**
 * Format YYYY-MM-DD to DD/MM/YYYY
 */
export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Format date string to Agenda style: "Segunda 26/10"
 */
export function formatDayAgendaLabel(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const weekday = getWeekdayName(dateStr).split('-')[0];
  return `${weekday} ${parts[2]}/${parts[1]}`;
}

/**
 * Returns true if dateStr (YYYY-MM-DD) is strictly prior to today's date
 */
export function isDateInPast(dateStr: string): boolean {
  if (!dateStr) return false;
  const todayStr = toISODate(new Date());
  return dateStr < todayStr;
}

/**
 * Returns formatted time range for periods (e.g. "1ª e 2ª Aula (07:15 às 08:55)")
 */
export function getPeriodTimeSummary(shift: Shift, periods: string[]): string {
  if (!periods || periods.length === 0) return '';
  if (periods.includes('Turno Completo')) {
    return shift === 'Matutino' ? 'Turno Completo (07:15 às 11:40)' : 'Turno Completo (13:00 às 17:25)';
  }
  const timesMap = PERIOD_TIMES[shift];
  if (periods.length === 1) {
    const t = timesMap[periods[0]];
    return `${periods[0]} (${t || ''})`;
  }
  const first = periods[0];
  const last = periods[periods.length - 1];
  const startTime = timesMap[first]?.split(' - ')[0] || '';
  const endTime = timesMap[last]?.split(' - ')[1] || '';
  return `${periods.join(', ')} (${startTime} às ${endTime})`;
}

/**
 * Auto-unmark bookings that belong to past days, moving them into history
 */
export function autoUnmarkPastBookings(bookings: Booking[]): {
  updatedBookings: Booking[];
  unmarkedCount: number;
} {
  const todayStr = toISODate(new Date());
  let count = 0;

  const updatedBookings = bookings.map((b) => {
    // If the booking date has passed and it was still CONFIRMADO or EM_USO,
    // automatically unmark / conclude the usage and log the reason.
    if (b.date < todayStr && (b.status === 'CONFIRMADO' || b.status === 'EM_USO')) {
      count++;
      return {
        ...b,
        status: 'CONCLUIDO' as const,
        completedAt: b.completedAt || new Date().toISOString(),
        completionReason: 'EXPIRADO_DATA' as const,
        updatedAt: new Date().toISOString(),
      };
    }
    return b;
  });

  return { updatedBookings, unmarkedCount: count };
}

/**
 * Returns whether a date string (YYYY-MM-DD) falls on Monday through Friday
 */
export function isSchoolDay(dateStr: string): boolean {
  if (!dateStr) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
  return dayOfWeek >= 1 && dayOfWeek <= 5;
}

/**
 * Get weekday name from date string YYYY-MM-DD
 */
export function getWeekdayName(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  const map: Record<number, string> = {
    0: 'Domingo',
    1: 'Segunda-feira',
    2: 'Terça-feira',
    3: 'Quarta-feira',
    4: 'Quinta-feira',
    5: 'Sexta-feira',
    6: 'Sábado',
  };
  return map[dayOfWeek] || '';
}

/**
 * Given any reference date, returns the Monday to Friday dates for that week
 */
export function getMondayToFriday(refDate: Date): {
  date: string;
  dayName: string;
  shortName: string;
  dayNumber: number;
  agendaLabel: string;
}[] {
  const current = new Date(refDate);
  const currentDay = current.getDay(); // 0 Sun, 1 Mon, ... 6 Sat
  
  // Calculate difference to Monday (1)
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);

  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const shortDayName = WEEKDAYS[i].name.split('-')[0]; // "Segunda", "Terça", etc.
    days.push({
      date: `${yyyy}-${mm}-${dd}`,
      dayName: WEEKDAYS[i].name,
      shortName: WEEKDAYS[i].shortName,
      dayNumber: d.getDate(),
      agendaLabel: `${shortDayName} ${dd}/${mm}`, // Exemplo: "Segunda 02/09"
    });
  }
  return days;
}

/**
 * Format date to YYYY-MM-DD
 */
export function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Detect conflicts:
 * 1. NUNCA dois professores na mesma turma no mesmo horário
 * 2. NUNCA dois professores na mesma sala física ou mesmo ambiente exclusivo
 * 3. NUNCA o mesmo equipamento em duas aulas simultaneamente
 * 4. NUNCA o mesmo professor em duas turmas simultaneamente
 */
export function checkBookingConflict(
  tentative: {
    id?: string;
    teacherName?: string;
    classGroup: string;
    date: string;
    shift: Shift;
    periods: string[];
    equipments: string[];
    location: string;
    locationDetails?: string;
  },
  existingBookings: Booking[]
): { hasConflict: boolean; reasons: string[]; conflictingBookings: Booking[] } {
  const activeBookings = existingBookings.filter(
    (b) => b.status !== 'CANCELADO' && b.status !== 'CONCLUIDO' && b.id !== tentative.id
  );

  const conflictingBookings: Booking[] = [];
  const reasons: string[] = [];

  const tentativePeriods = tentative.periods.includes('Turno Completo')
    ? PERIODS_LIST
    : tentative.periods;

  for (const b of activeBookings) {
    if (b.date !== tentative.date || b.shift !== tentative.shift) {
      continue;
    }

    const bPeriods = b.periods.includes('Turno Completo') ? PERIODS_LIST : b.periods;
    const hasPeriodOverlap = tentativePeriods.some((p) => bPeriods.includes(p));

    if (!hasPeriodOverlap) {
      continue;
    }

    // REGRA 1: Proibido dois professores na mesma turma!
    if (b.classGroup === tentative.classGroup) {
      if (!conflictingBookings.includes(b)) {
        conflictingBookings.push(b);
      }
      reasons.push(
        `CONFLITO DE TURMA: A Turma ${b.classGroup} já está com o(a) Prof. ${b.teacherName} (${b.subject}) nas aulas: ${b.periods.join(', ')}. Não é permitido haver 2 professores na mesma turma!`
      );
    }

    // REGRA 2: Proibido dois professores na mesma sala física!
    const sameRoomDetails =
      tentative.locationDetails &&
      b.locationDetails &&
      tentative.locationDetails.trim().toLowerCase() === b.locationDetails.trim().toLowerCase();

    if (tentative.location === 'Sala de Aula' && b.location === 'Sala de Aula' && sameRoomDetails) {
      if (!conflictingBookings.includes(b)) {
        conflictingBookings.push(b);
      }
      reasons.push(
        `CONFLITO DE SALA: O espaço "${tentative.locationDetails}" já está ocupado pelo(a) Prof. ${b.teacherName} (Turma ${b.classGroup}) nas aulas: ${b.periods.join(', ')}. Não é possível 2 professores na mesma sala!`
      );
    }

    // REGRA 3: Ambientes exclusivos (Biblioteca, Laboratório, Auditório)
    if (
      (tentative.location === 'Biblioteca' && b.location === 'Biblioteca') ||
      (tentative.location === 'Laboratório' && b.location === 'Laboratório') ||
      (tentative.location === 'Auditório/Pátio' && b.location === 'Auditório/Pátio')
    ) {
      if (!conflictingBookings.includes(b)) {
        conflictingBookings.push(b);
      }
      reasons.push(
        `CONFLITO DE AMBIENTE: O local "${tentative.location}" já está reservado pelo(a) Prof. ${b.teacherName} (Turma ${b.classGroup}) para as aulas: ${b.periods.join(', ')}. Não é permitido compartilhar o espaço no mesmo horário!`
      );
    }

    // REGRA 4: Mesmo equipamento multimídia
    const sharedEquipments = tentative.equipments.filter((eq) =>
      b.equipments.includes(eq)
    );

    if (sharedEquipments.length > 0) {
      if (!conflictingBookings.includes(b)) {
        conflictingBookings.push(b);
      }
      reasons.push(
        `CONFLITO DE EQUIPAMENTO: O item "${sharedEquipments.join(', ')}" já está em uso pelo(a) Prof. ${b.teacherName} (Turma ${b.classGroup}) nas aulas: ${b.periods.join(', ')}.`
      );
    }

    // REGRA 5: Mesmo professor não pode estar em duas turmas ao mesmo tempo
    if (
      tentative.teacherName &&
      b.teacherName &&
      tentative.teacherName.trim().toLowerCase() === b.teacherName.trim().toLowerCase()
    ) {
      if (!conflictingBookings.includes(b)) {
        conflictingBookings.push(b);
      }
      reasons.push(
        `CONFLITO DE PROFESSOR: O(A) Prof. ${b.teacherName} já possui aula agendada com a Turma ${b.classGroup} neste mesmo horário.`
      );
    }
  }

  return {
    hasConflict: conflictingBookings.length > 0,
    reasons,
    conflictingBookings,
  };
}

