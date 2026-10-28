import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Plus,
  Monitor,
  Laptop,
  Speaker,
  Projector,
  BookOpen,
  FlaskConical,
  School,
  Printer,
  ShieldCheck,
  Trash2,
  Info,
} from 'lucide-react';
import { Booking, Shift } from '../types/multimedia';
import {
  MATUTINO_CLASSES,
  VESPERTINO_CLASSES,
} from '../data/initialData';
import {
  getMondayToFriday,
  PERIODS_LIST,
  PERIOD_TIMES,
  formatDateBR,
  toISODate,
} from '../utils/dateUtils';
import { BookingDetailsModal } from './BookingDetailsModal';

interface WeeklyScheduleViewProps {
  bookings: Booking[];
  onOpenNewBookingWithPrefill: (
    date: string,
    shift: Shift,
    period: string,
    classGroup?: string
  ) => void;
  onSelectBookingForVoucher: (booking: Booking) => void;
  onUnmarkBooking: (id: string) => void;
}

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  bookings,
  onOpenNewBookingWithPrefill,
  onSelectBookingForVoucher,
  onUnmarkBooking,
}) => {
  const [currentWeekRef, setCurrentWeekRef] = useState<Date>(new Date());
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);

  // Days for the week: Monday to Friday
  const weekDays = getMondayToFriday(currentWeekRef);
  const todayIso = toISODate(new Date());

  // Default to today if in this week, otherwise Monday
  const defaultSelectedDay = weekDays.some((w) => w.date === todayIso)
    ? todayIso
    : weekDays[0]?.date || todayIso;

  const [selectedDayDate, setSelectedDayDate] = useState<string>(defaultSelectedDay);
  const [selectedShift, setSelectedShift] = useState<Shift>('Matutino');

  const handlePrevWeek = () => {
    const d = new Date(currentWeekRef);
    d.setDate(d.getDate() - 7);
    setCurrentWeekRef(d);
    const newDays = getMondayToFriday(d);
    setSelectedDayDate(newDays[0].date);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekRef);
    d.setDate(d.getDate() + 7);
    setCurrentWeekRef(d);
    const newDays = getMondayToFriday(d);
    setSelectedDayDate(newDays[0].date);
  };

  const handleTodayWeek = () => {
    const today = new Date();
    setCurrentWeekRef(today);
    const newDays = getMondayToFriday(today);
    const match = newDays.find((w) => w.date === toISODate(today));
    setSelectedDayDate(match ? match.date : newDays[0].date);
  };

  const activeClasses = selectedShift === 'Matutino' ? MATUTINO_CLASSES : VESPERTINO_CLASSES;

  const getEquipmentIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('tv')) return <Monitor className="w-3.5 h-3.5 text-sky-600" />;
    if (n.includes('chromebook')) return <Laptop className="w-3.5 h-3.5 text-emerald-600" />;
    if (n.includes('som')) return <Speaker className="w-3.5 h-3.5 text-amber-600" />;
    if (n.includes('projetor')) return <Projector className="w-3.5 h-3.5 text-violet-600" />;
    return <Monitor className="w-3.5 h-3.5 text-slate-500" />;
  };

  const getLocationIcon = (loc: string) => {
    if (loc === 'Biblioteca') return <BookOpen className="w-3 h-3 text-amber-600" />;
    if (loc === 'Laboratório') return <FlaskConical className="w-3 h-3 text-emerald-600" />;
    return <School className="w-3 h-3 text-blue-600" />;
  };

  // Find booking for specific class and period
  const getBooking = (classGroupName: string, period: string) => {
    // 1. Prioritize active booking (CONFIRMADO or EM_USO)
    const active = bookings.find(
      (b) =>
        (b.status === 'CONFIRMADO' || b.status === 'EM_USO') &&
        b.classGroup === classGroupName &&
        b.date === selectedDayDate &&
        b.shift === selectedShift &&
        (b.periods.includes('Turno Completo') || b.periods.includes(period))
    );
    if (active) return active;

    // 2. For past days, show concluded booking from history if present
    if (selectedDayDate < todayIso) {
      return bookings.find(
        (b) =>
          b.status === 'CONCLUIDO' &&
          b.classGroup === classGroupName &&
          b.date === selectedDayDate &&
          b.shift === selectedShift &&
          (b.periods.includes('Turno Completo') || b.periods.includes(period))
      );
    }

    return undefined;
  };

  const currentDayObj = weekDays.find((w) => w.date === selectedDayDate) || weekDays[0];

  return (
    <div className="space-y-4">
      {/* 1. Week Navigation & Agenda Day Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Week navigation */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleTodayWeek}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Hoje / Semana Atual
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Próxima semana"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Semana de {formatDateBR(weekDays[0]?.date)} a {formatDateBR(weekDays[4]?.date)}</span>
          </div>
        </div>

        {/* Agenda Day Selector: "Segunda 26/10", "Terça 27/10", etc. */}
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {weekDays.map((day) => {
              const isSelected = day.date === selectedDayDate;
              const isToday = day.date === todayIso;

              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDayDate(day.date)}
                  className={`py-3 px-2 rounded-xl text-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-400 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
                  }`}
                >
                  <div className="text-sm font-extrabold tracking-tight">
                    {day.agendaLabel}
                  </div>
                  {isToday && (
                    <span
                      className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                        isSelected ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Hoje
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Shift Selector (Matutino / Vespertino) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Turno:</span>
          <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setSelectedShift('Matutino')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedShift === 'Matutino'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ☀️ Matutino (07h15 às 11h40)
            </button>
            <button
              onClick={() => setSelectedShift('Vespertino')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedShift === 'Vespertino'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌤️ Vespertino (13h00 às 17h25)
            </button>
          </div>
        </div>

        {/* Rule badge */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">
            {selectedShift === 'Matutino' ? 'Recreio: 09:45 às 10:00' : 'Recreio: 15:30 às 15:45'}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            1 Professor por Turma
          </span>
        </div>
      </div>

      {/* 3. Simple Agenda Table for the Selected Day */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Banner */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="font-extrabold text-sm sm:text-base tracking-wide">
              Agenda de {currentDayObj.agendaLabel} • Turno {selectedShift}
            </span>
          </div>

          <span className="text-xs text-slate-300">
            Clique em "+ Marcar" para agendar ou no cartão para gerenciar
          </span>
        </div>

        {/* Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[880px]">
            <thead>
              <tr className="bg-slate-50 text-slate-700 text-xs uppercase font-bold divide-x divide-slate-200 border-b border-slate-200">
                <th className="p-3 w-28 text-center bg-slate-100">Turma</th>
                <th className="p-3 text-center">
                  1ª Aula
                  <span className="block text-[10px] text-slate-500 font-mono font-normal">
                    {PERIOD_TIMES[selectedShift]['1ª Aula']}
                  </span>
                </th>
                <th className="p-3 text-center">
                  2ª Aula
                  <span className="block text-[10px] text-slate-500 font-mono font-normal">
                    {PERIOD_TIMES[selectedShift]['2ª Aula']}
                  </span>
                </th>
                <th className="p-3 text-center">
                  3ª Aula
                  <span className="block text-[10px] text-slate-500 font-mono font-normal">
                    {PERIOD_TIMES[selectedShift]['3ª Aula']}
                  </span>
                </th>
                <th className="p-2 text-center w-24 bg-amber-50/70 text-amber-800 text-[10px]">
                  ☕ Recreio
                  <span className="block font-mono font-normal">
                    {selectedShift === 'Matutino' ? '09:45-10:00' : '15:30-15:45'}
                  </span>
                </th>
                <th className="p-3 text-center">
                  4ª Aula
                  <span className="block text-[10px] text-slate-500 font-mono font-normal">
                    {PERIOD_TIMES[selectedShift]['4ª Aula']}
                  </span>
                </th>
                <th className="p-3 text-center">
                  5ª Aula
                  <span className="block text-[10px] text-slate-500 font-mono font-normal">
                    {PERIOD_TIMES[selectedShift]['5ª Aula']}
                  </span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {activeClasses.map((tg) => (
                <tr key={tg} className="divide-x divide-slate-100 hover:bg-slate-50/40 transition-colors">
                  {/* Turma cell */}
                  <td className="p-3 bg-slate-50 text-center align-middle font-bold">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black shadow-2xs ${
                        selectedShift === 'Matutino'
                          ? 'bg-blue-600 text-white'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {tg}
                    </span>
                  </td>

                  {/* 1ª Aula */}
                  {renderCell(tg, '1ª Aula')}

                  {/* 2ª Aula */}
                  {renderCell(tg, '2ª Aula')}

                  {/* 3ª Aula */}
                  {renderCell(tg, '3ª Aula')}

                  {/* Recreio cell */}
                  <td className="p-2 bg-amber-50/30 text-center align-middle text-xs text-amber-700 font-bold">
                    ☕
                  </td>

                  {/* 4ª Aula */}
                  {renderCell(tg, '4ª Aula')}

                  {/* 5ª Aula */}
                  {renderCell(tg, '5ª Aula')}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBookingForDetails}
        onClose={() => setSelectedBookingForDetails(null)}
        onUnmark={(id) => {
          onUnmarkBooking(id);
          setSelectedBookingForDetails(null);
        }}
        onOpenVoucher={(b) => {
          onSelectBookingForVoucher(b);
          setSelectedBookingForDetails(null);
        }}
      />
    </div>
  );

  function renderCell(classGroupName: string, period: string) {
    const booking = getBooking(classGroupName, period);

    if (booking) {
      const isPastConcluded = booking.status === 'CONCLUIDO';

      return (
        <td className="p-2 align-top min-w-[155px] bg-blue-50/25">
          <div
            onClick={() => setSelectedBookingForDetails(booking)}
            className={`p-2 rounded-xl border transition-all cursor-pointer space-y-1 ${
              isPastConcluded
                ? 'border-slate-300 bg-slate-50 opacity-80'
                : 'border-blue-300 bg-white shadow-2xs hover:shadow-xs'
            }`}
          >
            {/* Teacher & Location */}
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-bold text-slate-900 truncate">
                {booking.teacherName}
              </span>
              <span className="text-[9px] text-slate-500 truncate flex items-center gap-0.5">
                {getLocationIcon(booking.location)}
                <span>{booking.location.split(' ')[0]}</span>
              </span>
            </div>

            {/* Subject */}
            <div className="text-[10px] text-slate-600 truncate font-medium">
              {booking.subject}
            </div>

            {/* Equipments */}
            <div className="flex flex-wrap items-center gap-1 pt-0.5 border-t border-slate-100">
              {booking.equipments.map((eq, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-0.5 text-[9px] bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-medium"
                  title={eq}
                >
                  {getEquipmentIcon(eq)}
                  <span className="truncate max-w-[65px]">{eq.split(' ')[0]}</span>
                </span>
              ))}
            </div>

            {/* Action Bar: Desmarcar (1-clique) + Detalhes */}
            <div className="flex items-center justify-between text-[9px] pt-1 border-t border-slate-100">
              {!isPastConcluded ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Immediate unmark with undo toast! Zero blocking window.confirm!
                    onUnmarkBooking(booking.id);
                  }}
                  className="text-rose-700 hover:text-rose-900 font-bold bg-rose-50 hover:bg-rose-100 border border-rose-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1"
                  title="Desmarcar o uso e liberar este horário imediatamente"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  <span>Desmarcar</span>
                </button>
              ) : (
                <span className="text-slate-400 font-medium text-[9px]">
                  Concluído
                </span>
              )}

              <div className="flex items-center text-blue-700 font-bold gap-0.5">
                <Info className="w-2.5 h-2.5" />
                <span>Ver</span>
              </div>
            </div>
          </div>
        </td>
      );
    }

    return (
      <td className="p-2 align-middle text-center min-w-[125px]">
        <button
          onClick={() =>
            onOpenNewBookingWithPrefill(
              selectedDayDate,
              selectedShift,
              period,
              classGroupName
            )
          }
          className="w-full py-2.5 px-2 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 text-slate-400 text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
          title={`Marcar uso para a Turma ${classGroupName} na ${period}`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Marcar</span>
        </button>
      </td>
    );
  }
};
