import React from 'react';
import {
  Monitor,
  Laptop,
  Speaker,
  Projector,
  Calendar,
  CheckCircle2,
  Clock,
  PlusCircle,
  BookOpen,
  FlaskConical,
} from 'lucide-react';
import { EquipmentItem, Booking, Shift } from '../types/multimedia';
import { INITIAL_EQUIPMENTS, LOCATIONS_LIST } from '../data/initialData';
import { formatDateBR, toISODate, getWeekdayName } from '../utils/dateUtils';

interface EquipmentStatusViewProps {
  bookings: Booking[];
  onBookEquipment: (equipmentName: string) => void;
}

export const EquipmentStatusView: React.FC<EquipmentStatusViewProps> = ({
  bookings,
  onBookEquipment,
}) => {
  const todayStr = toISODate(new Date());

  // Filter today's active bookings
  const todaysBookings = bookings.filter(
    (b) => b.date === todayStr && b.status !== 'CANCELADO'
  );

  const getEquipmentBookings = (eqName: string) => {
    return bookings
      .filter((b) => b.equipments.includes(eqName) && b.status !== 'CANCELADO')
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getEquipmentIcon = (category: string) => {
    switch (category) {
      case 'TV':
        return <Monitor className="w-6 h-6 text-sky-600" />;
      case 'Chromebook':
        return <Laptop className="w-6 h-6 text-emerald-600" />;
      case 'Caixa de Som':
        return <Speaker className="w-6 h-6 text-amber-600" />;
      case 'Projetor':
        return <Projector className="w-6 h-6 text-violet-600" />;
      default:
        return <Monitor className="w-6 h-6 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro info box */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-700/50 text-blue-200 border border-blue-500/30">
              Patrimônio e Mídias Escolares
            </span>
            <h2 className="text-xl sm:text-2xl font-bold mt-2">
              Inventário Multimídia &amp; Ambientes do Colégio
            </h2>
            <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-2xl">
              Consulte a disponibilidade de cada recurso (TVs, Chromebooks, Projetores e Caixas de Som) e dos espaços como Biblioteca e Laboratório de Informática.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center min-w-[160px]">
            <span className="block text-[11px] uppercase tracking-wider text-blue-200">
              Data de Referência
            </span>
            <span className="block text-base font-bold text-white mt-0.5">
              {formatDateBR(todayStr)}
            </span>
            <span className="block text-xs text-blue-300">
              {getWeekdayName(todayStr)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Equipments */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span>Equipamentos Multimídia</span>
          <span className="text-xs font-normal text-slate-500">
            ({INITIAL_EQUIPMENTS.length} itens cadastrados)
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INITIAL_EQUIPMENTS.map((eq) => {
            const eqBookings = getEquipmentBookings(eq.name);
            const isBookedToday = todaysBookings.some((b) =>
              b.equipments.includes(eq.name)
            );
            const nextBooking = eqBookings.find((b) => b.date >= todayStr);

            return (
              <div
                key={eq.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top line: Icon, Code, Status badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-100 flex-shrink-0">
                      {getEquipmentIcon(eq.category)}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        {eq.code}
                      </span>

                      {isBookedToday ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Reservado Hoje
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Livre Hoje
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title and details */}
                  <div className="mt-3">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {eq.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {eq.description}
                    </p>
                  </div>
                </div>

                {/* Upcoming booking info */}
                <div className="pt-3 border-t border-slate-100 text-xs">
                  {nextBooking ? (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-600" />
                        Próxima Reserva:
                      </span>
                      <p className="font-bold text-slate-800">
                        {formatDateBR(nextBooking.date)} ({getWeekdayName(nextBooking.date).slice(0, 3)}) • {nextBooking.shift}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Prof. {nextBooking.teacherName} • Turma{' '}
                        <strong className="text-blue-700">{nextBooking.classGroup}</strong> ({nextBooking.periods.join(', ')})
                      </p>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-[11px] py-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Sem reservas futuras registradas
                    </div>
                  )}

                  {/* Quick Action Button */}
                  <button
                    onClick={() => onBookEquipment(eq.name)}
                    className="mt-3 w-full py-2 px-3 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Agendar Este Recurso</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Environments / Pedagogy Spaces Section */}
      <div className="pt-4">
        <h3 className="text-base font-bold text-slate-900 mb-3">
          Ambientes Pedagógicos Exclusivos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LOCATIONS_LIST.filter((l) => l.id !== 'Sala de Aula').map((loc) => {
            const locBookings = bookings.filter(
              (b) => b.location === loc.id && b.status !== 'CANCELADO'
            );

            return (
              <div
                key={loc.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
                      {loc.id === 'Biblioteca' ? (
                        <BookOpen className="w-6 h-6 text-amber-600" />
                      ) : (
                        <FlaskConical className="w-6 h-6 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {loc.name}
                      </h4>
                      <p className="text-xs text-slate-500">{loc.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase">
                      Agendamentos Cadastrados ({locBookings.length}):
                    </span>
                    {locBookings.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        className="text-xs p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <strong className="text-slate-800">
                            {formatDateBR(b.date)} ({b.shift})
                          </strong>
                          <span className="text-slate-500 ml-1.5">
                            Prof. {b.teacherName} (Turma {b.classGroup})
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                          {b.periods.join(', ')}
                        </span>
                      </div>
                    ))}
                    {locBookings.length === 0 && (
                      <p className="text-xs text-slate-400 italic">
                        Nenhum agendamento ativo para este ambiente.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
