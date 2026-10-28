import React from 'react';
import {
  X,
  Printer,
  Calendar,
  Clock,
  User,
  BookOpen,
  MapPin,
  CheckCircle2,
  Trash2,
  Monitor,
  Laptop,
  Speaker,
  Projector,
  School,
  FlaskConical,
} from 'lucide-react';
import { Booking } from '../types/multimedia';
import { formatDateBR, formatDayAgendaLabel, getPeriodTimeSummary } from '../utils/dateUtils';
import { MATUTINO_CLASSES } from '../data/initialData';

interface BookingDetailsModalProps {
  booking: Booking | null;
  onClose: () => void;
  onUnmark: (id: string) => void;
  onOpenVoucher: (booking: Booking) => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  onClose,
  onUnmark,
  onOpenVoucher,
}) => {
  if (!booking) return null;

  const isMatutino = MATUTINO_CLASSES.includes(booking.classGroup);
  const isActive = booking.status === 'CONFIRMADO' || booking.status === 'EM_USO';

  const getEquipmentIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('tv')) return <Monitor className="w-4 h-4 text-sky-600" />;
    if (n.includes('chromebook')) return <Laptop className="w-4 h-4 text-emerald-600" />;
    if (n.includes('som')) return <Speaker className="w-4 h-4 text-amber-600" />;
    if (n.includes('projetor')) return <Projector className="w-4 h-4 text-violet-600" />;
    return <Monitor className="w-4 h-4 text-slate-500" />;
  };

  const getLocationIcon = (loc: string) => {
    if (loc === 'Biblioteca') return <BookOpen className="w-4 h-4 text-amber-600" />;
    if (loc === 'Laboratório') return <FlaskConical className="w-4 h-4 text-emerald-600" />;
    return <School className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-black shadow-xs ${
                isMatutino ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white'
              }`}
            >
              Turma {booking.classGroup}
            </span>
            <span className="font-bold text-sm sm:text-base">
              Detalhes do Agendamento
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-sm text-slate-700">
          {/* Status banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Situação:
            </span>
            <div>
              {isActive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  Agendado / Em Aberto
                </span>
              ) : booking.completionReason === 'EXPIRADO_DATA' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Desmarcado (Dia Expirado)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Desmarcado / Liberado
                </span>
              )}
            </div>
          </div>

          {/* Grid Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-blue-600" />
                Professor(a):
              </span>
              <p className="font-bold text-slate-900 mt-0.5">
                {booking.teacherName}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-blue-600" />
                Disciplina:
              </span>
              <p className="font-bold text-slate-900 mt-0.5">
                {booking.subject}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-600" />
                Data / Dia da Semana:
              </span>
              <p className="font-bold text-slate-900 mt-0.5">
                {formatDayAgendaLabel(booking.date)}
              </p>
              <span className="text-[11px] text-slate-500 font-mono">
                {formatDateBR(booking.date)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-600" />
                Horário &amp; Aulas:
              </span>
              <p className="font-bold text-slate-900 mt-0.5">
                {booking.periods.join(', ')}
              </p>
              <span className="text-[11px] text-slate-500">
                {getPeriodTimeSummary(booking.shift, booking.periods)}
              </span>
            </div>
          </div>

          {/* Local */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-600" />
              Local de Utilização:
            </span>
            <div className="flex items-center gap-2 mt-1">
              {getLocationIcon(booking.location)}
              <span className="font-bold text-slate-900">
                {booking.location}
              </span>
              {booking.locationDetails && (
                <span className="text-xs text-slate-500">
                  — {booking.locationDetails}
                </span>
              )}
            </div>
          </div>

          {/* Equipments */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold uppercase text-slate-400 block">
              Recursos Multimídia Solicitados:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {booking.equipments.map((eq, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs bg-white text-slate-800 font-semibold px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs"
                >
                  {getEquipmentIcon(eq)}
                  <span>{eq}</span>
                </span>
              ))}
            </div>
          </div>

          {booking.purpose && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-0.5">
                Objetivo da Aula:
              </span>
              <p className="text-xs text-slate-600 italic">
                "{booking.purpose}"
              </p>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Desmarcar button (if active) */}
          {isActive ? (
            <button
              onClick={() => {
                onUnmark(booking.id);
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Desmarcar / Liberar Uso</span>
            </button>
          ) : (
            <span className="text-xs text-slate-500 italic">
              Este uso já foi desmarcado / finalizado.
            </span>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                onOpenVoucher(booking);
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-slate-300 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Ficha Oficial</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
