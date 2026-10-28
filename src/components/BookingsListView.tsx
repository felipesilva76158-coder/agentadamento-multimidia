import React, { useState } from 'react';
import {
  Search,
  Filter,
  Printer,
  Trash2,
  CheckCircle,
  Clock,
  Ban,
  Calendar,
  Monitor,
  Laptop,
  Speaker,
  Projector,
  BookOpen,
  FlaskConical,
  School,
  Play,
  Check,
} from 'lucide-react';
import { Booking, BookingStatus, Shift } from '../types/multimedia';
import { formatDateBR, getWeekdayName } from '../utils/dateUtils';

interface BookingsListViewProps {
  bookings: Booking[];
  onUpdateStatus: (id: string, newStatus: BookingStatus) => void;
  onDeleteBooking: (id: string) => void;
  onSelectBookingForVoucher: (booking: Booking) => void;
}

export const BookingsListView: React.FC<BookingsListViewProps> = ({
  bookings,
  onUpdateStatus,
  onDeleteBooking,
  onSelectBookingForVoucher,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('TODAS');
  const [shiftFilter, setShiftFilter] = useState<string>('TODOS');
  const [equipmentFilter, setEquipmentFilter] = useState('TODOS');
  const [locationFilter, setLocationFilter] = useState('TODOS');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  // Filter logic
  const filtered = bookings.filter((b) => {
    // Text search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTeacher = b.teacherName.toLowerCase().includes(term);
      const matchSubject = b.subject.toLowerCase().includes(term);
      const matchClass = b.classGroup.toLowerCase().includes(term);
      const matchPurpose = b.purpose.toLowerCase().includes(term);
      const matchEquip = b.equipments.some((e) => e.toLowerCase().includes(term));
      const matchLoc = b.location.toLowerCase().includes(term);
      if (
        !matchTeacher &&
        !matchSubject &&
        !matchClass &&
        !matchPurpose &&
        !matchEquip &&
        !matchLoc
      ) {
        return false;
      }
    }

    if (classFilter !== 'TODAS' && b.classGroup !== classFilter) return false;
    if (shiftFilter !== 'TODOS' && b.shift !== shiftFilter) return false;
    if (statusFilter !== 'TODOS' && b.status !== statusFilter) return false;
    if (locationFilter !== 'TODOS' && b.location !== locationFilter) return false;

    if (equipmentFilter !== 'TODOS') {
      const matchEq = b.equipments.some((e) =>
        e.toLowerCase().includes(equipmentFilter.toLowerCase())
      );
      if (!matchEq) return false;
    }

    return true;
  });

  // Sort by date (descending) and shift
  const sorted = [...filtered].sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return a.shift === 'Matutino' ? -1 : 1;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMADO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle className="w-3 h-3 text-blue-600" />
            Confirmado
          </span>
        );
      case 'EM_USO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" />
            Em Uso
          </span>
        );
      case 'CONCLUIDO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" />
            Concluído
          </span>
        );
      case 'CANCELADO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <Ban className="w-3 h-3 text-rose-600" />
            Cancelado
          </span>
        );
    }
  };

  const getEquipmentIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('tv')) return <Monitor className="w-3.5 h-3.5 text-sky-600" />;
    if (n.includes('chromebook')) return <Laptop className="w-3.5 h-3.5 text-emerald-600" />;
    if (n.includes('som')) return <Speaker className="w-3.5 h-3.5 text-amber-600" />;
    if (n.includes('projetor')) return <Projector className="w-3.5 h-3.5 text-violet-600" />;
    return <Monitor className="w-3.5 h-3.5 text-slate-500" />;
  };

  const getLocationIcon = (loc: string) => {
    if (loc === 'Biblioteca') return <BookOpen className="w-3.5 h-3.5 text-amber-600" />;
    if (loc === 'Laboratório') return <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />;
    return <School className="w-3.5 h-3.5 text-blue-600" />;
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por professor, turma (ex: 34.01), disciplina, equipamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick Clear filters */}
          {(searchTerm ||
            classFilter !== 'TODAS' ||
            shiftFilter !== 'TODOS' ||
            equipmentFilter !== 'TODOS' ||
            locationFilter !== 'TODOS' ||
            statusFilter !== 'TODOS') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setClassFilter('TODAS');
                setShiftFilter('TODOS');
                setEquipmentFilter('TODOS');
                setLocationFilter('TODOS');
                setStatusFilter('TODOS');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
          {/* Turma Filter (All 12 official classes) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Turma
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="TODAS">Todas as Turmas (12 turmas)</option>
              <optgroup label="☀️ Ensino Médio (Matutino)">
                <option value="34.01">Turma 34.01</option>
                <option value="33.01">Turma 33.01</option>
                <option value="24.01">Turma 24.01</option>
                <option value="23.01">Turma 23.01</option>
                <option value="14.01">Turma 14.01</option>
                <option value="13.01">Turma 13.01</option>
              </optgroup>
              <optgroup label="🌤️ Ensino Fundamental (Vespertino)">
                <option value="91.01">Turma 91.01</option>
                <option value="81.01">Turma 81.01</option>
                <option value="82.01">Turma 82.01</option>
                <option value="71.01">Turma 71.01</option>
                <option value="61.01">Turma 61.01</option>
                <option value="62.01">Turma 62.01</option>
              </optgroup>
            </select>
          </div>

          {/* Turno */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Turno
            </label>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="TODOS">Todos os Turnos</option>
              <option value="Matutino">Matutino</option>
              <option value="Vespertino">Vespertino</option>
            </select>
          </div>

          {/* Equipamento */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Equipamento
            </label>
            <select
              value={equipmentFilter}
              onChange={(e) => setEquipmentFilter(e.target.value)}
              className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="TODOS">Todos</option>
              <option value="TV">TV</option>
              <option value="Chromebook">Chromebook</option>
              <option value="Som">Caixa de Som</option>
              <option value="Projetor">Projetor</option>
            </select>
          </div>

          {/* Local */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Local
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="TODOS">Todos os Locais</option>
              <option value="Biblioteca">Biblioteca</option>
              <option value="Laboratório">Laboratório</option>
              <option value="Sala de Aula">Sala de Aula</option>
              <option value="Auditório/Pátio">Auditório/Pátio</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="TODOS">Todos</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="EM_USO">Em Uso</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800">
              Registros Encontrados:
            </span>
            <span className="px-2 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-full">
              {sorted.length}
            </span>
          </div>

          <span className="text-xs text-slate-500">
            Segunda a Sexta • Colégio Estadual José Carneiro de Brito
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700 text-sm">
              Nenhum agendamento encontrado com os filtros selecionados.
            </p>
            <p className="text-xs text-slate-400">
              Tente redefinir os filtros ou criar um novo agendamento.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sorted.map((b) => {
              const is3401 = b.classGroup === '34.01';
              const is3301 = b.classGroup === '33.01';

              return (
                <div
                  key={b.id}
                  className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left Column: Date & Time Info */}
                  <div className="flex items-start gap-3.5 min-w-[220px]">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[10px] uppercase font-bold text-blue-600">
                        {getWeekdayName(b.date).slice(0, 3)}
                      </span>
                      <span className="text-sm font-extrabold leading-none mt-0.5">
                        {b.date.slice(8, 10)}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">
                          {formatDateBR(b.date)}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          • {getWeekdayName(b.date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                        <span
                          className={`font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                            b.shift === 'Matutino'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-indigo-100 text-indigo-900'
                          }`}
                        >
                          {b.shift}
                        </span>
                        <span>•</span>
                        <span className="font-medium">
                          {b.periods.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Turma, Professor, Disciplina, Local */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Turma Badge */}
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-md ${
                          is3401
                            ? 'bg-blue-600 text-white shadow-xs'
                            : is3301
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-700 text-white'
                        }`}
                      >
                        Turma {b.classGroup}
                      </span>

                      <span className="font-bold text-sm text-slate-900">
                        {b.teacherName}
                      </span>

                      <span className="text-xs text-slate-500 font-medium">
                        ({b.subject})
                      </span>

                      {/* Location Badge */}
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                        {getLocationIcon(b.location)}
                        {b.location}
                        {b.locationDetails ? ` - ${b.locationDetails}` : ''}
                      </span>

                      {getStatusBadge(b.status)}
                    </div>

                    {/* Equipments used */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Equipamentos:
                      </span>
                      {b.equipments.map((eq, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                        >
                          {getEquipmentIcon(eq)}
                          <span>{eq}</span>
                        </span>
                      ))}
                    </div>

                    {/* Purpose / Obs */}
                    {b.purpose && (
                      <p className="text-xs text-slate-500 italic line-clamp-1">
                        "{b.purpose}"
                      </p>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {/* Status quick toggle buttons */}
                    {b.status === 'CONFIRMADO' && (
                      <button
                        onClick={() => onUpdateStatus(b.id, 'EM_USO')}
                        className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 flex items-center gap-1 cursor-pointer"
                        title="Marcar que o equipamento foi entregue ao professor"
                      >
                        <Play className="w-3 h-3" />
                        <span>Entregar / Em Uso</span>
                      </button>
                    )}

                    {b.status === 'EM_USO' && (
                      <button
                        onClick={() => onUpdateStatus(b.id, 'CONCLUIDO')}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer"
                        title="Marcar que o equipamento foi devolvido e conferido"
                      >
                        <Check className="w-3 h-3" />
                        <span>Devolvido</span>
                      </button>
                    )}

                    {b.status !== 'CANCELADO' && b.status !== 'CONCLUIDO' && (
                      <button
                        onClick={() => {
                          if (confirm('Deseja realmente cancelar este agendamento?')) {
                            onUpdateStatus(b.id, 'CANCELADO');
                          }
                        }}
                        className="p-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Cancelar reserva"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}

                    {/* Print Voucher Button */}
                    <button
                      onClick={() => onSelectBookingForVoucher(b)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-blue-900 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
                      title="Gerar Ficha Oficial de Retirada e Termo de Responsabilidade"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Ficha / Imprimir</span>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        if (confirm('Deseja excluir permanentemente este registro?')) {
                          onDeleteBooking(b.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir agendamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
