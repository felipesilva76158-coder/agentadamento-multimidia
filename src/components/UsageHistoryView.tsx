import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileText,
  School,
  Monitor,
  Laptop,
  Speaker,
  Projector,
  BookOpen,
  FlaskConical,
  RotateCcw,
  History,
  ShieldCheck,
} from 'lucide-react';
import { Booking, BookingStatus, Shift } from '../types/multimedia';
import {
  formatDateBR,
  getWeekdayName,
  getPeriodTimeSummary,
  formatDayAgendaLabel,
} from '../utils/dateUtils';
import { MATUTINO_CLASSES, VESPERTINO_CLASSES, SCHOOL_CLASSES } from '../data/initialData';

interface UsageHistoryViewProps {
  bookings: Booking[];
  onSelectBookingForVoucher: (booking: Booking) => void;
  onUpdateStatus: (id: string, newStatus: BookingStatus) => void;
  onRunAutoUnmark: () => void;
  onUnmarkBooking: (id: string) => void;
}

export const UsageHistoryView: React.FC<UsageHistoryViewProps> = ({
  bookings,
  onSelectBookingForVoucher,
  onUpdateStatus,
  onRunAutoUnmark,
  onUnmarkBooking,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('TODAS');
  const [shiftFilter, setShiftFilter] = useState<string>('TODOS');
  const [reasonFilter, setReasonFilter] = useState<string>('TODOS');

  // Filter the list
  const filtered = bookings.filter((b) => {
    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTeacher = b.teacherName.toLowerCase().includes(q);
      const matchSubject = b.subject.toLowerCase().includes(q);
      const matchClass = b.classGroup.toLowerCase().includes(q);
      const matchEquip = b.equipments.some((e) => e.toLowerCase().includes(q));
      const matchLocation = b.location.toLowerCase().includes(q);
      const matchDetails = b.locationDetails?.toLowerCase().includes(q) || false;
      if (!matchTeacher && !matchSubject && !matchClass && !matchEquip && !matchLocation && !matchDetails) {
        return false;
      }
    }

    // Class filter
    if (classFilter !== 'TODAS' && b.classGroup !== classFilter) {
      return false;
    }

    // Shift filter
    if (shiftFilter !== 'TODOS' && b.shift !== shiftFilter) {
      return false;
    }

    // Reason / Status filter
    if (reasonFilter === 'EXPIRADO_DATA' && b.completionReason !== 'EXPIRADO_DATA') {
      return false;
    }
    if (reasonFilter === 'MANUAL' && b.completionReason !== 'MANUAL_DESMARCADO') {
      return false;
    }
    if (reasonFilter === 'CONCLUIDO' && b.status !== 'CONCLUIDO') {
      return false;
    }
    if (reasonFilter === 'EM_USO' && b.status !== 'EM_USO') {
      return false;
    }

    return true;
  });

  // Sort by date descending (most recent first)
  const sorted = [...filtered].sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return a.shift === 'Matutino' ? -1 : 1;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Protocolo',
      'Data',
      'Dia da Semana',
      'Turno',
      'Horario_Aulas',
      'Turma',
      'Professor',
      'Disciplina',
      'Local',
      'Equipamentos',
      'Status',
      'Motivo_Finalizacao',
    ];

    const rows = sorted.map((b) => [
      `"${b.id}"`,
      `"${formatDateBR(b.date)}"`,
      `"${getWeekdayName(b.date)}"`,
      `"${b.shift}"`,
      `"${b.periods.join('; ')}"`,
      `"${b.classGroup}"`,
      `"${b.teacherName}"`,
      `"${b.subject}"`,
      `"${b.location} ${b.locationDetails || ''}"`,
      `"${b.equipments.join('; ')}"`,
      `"${b.status}"`,
      `"${b.completionReason || 'NORMAL'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `historico_uso_multimidia_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
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

  const getStatusBadge = (b: Booking) => {
    if (b.status === 'CANCELADO') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          Cancelado
        </span>
      );
    }

    if (b.status === 'EM_USO') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
          <Clock className="w-3 h-3 text-amber-600" />
          Em Uso Agora
        </span>
      );
    }

    if (b.completionReason === 'EXPIRADO_DATA') {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300"
          title="O dia passou e o agendamento foi finalizado automaticamente, liberando a sala e os recursos"
        >
          <Clock className="w-3 h-3 text-slate-500" />
          Desmarcado (Dia Expirado)
        </span>
      );
    }

    if (b.completionReason === 'MANUAL_DESMARCADO') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Desmarcado / Liberado
        </span>
      );
    }

    if (b.status === 'CONCLUIDO') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Uso Concluído
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
        Confirmado
      </span>
    );
  };

  // Metrics
  const totalCount = bookings.length;
  const expiredCount = bookings.filter((b) => b.completionReason === 'EXPIRADO_DATA').length;
  const manualCount = bookings.filter((b) => b.completionReason === 'MANUAL_DESMARCADO').length;
  const inUseCount = bookings.filter((b) => b.status === 'EM_USO').length;

  return (
    <div className="space-y-4">
      {/* 1. Header with Stats & Mechanism Status */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <History className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Histórico de Uso das Mídias &amp; Multiuso
                </h2>
                <p className="text-xs text-slate-500">
                  Registro completo de dia, hora, turma, professor e recursos utilizados
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onRunAutoUnmark}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              title="Executa a verificação para desmarcar agendamentos de dias que já passaram"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
              <span>Verificar Dias Passados</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              title="Baixar planilha CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Relatório</span>
            </button>
          </div>
        </div>

        {/* Mechanism notice & quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block font-medium">Total de Registros:</span>
            <span className="text-base font-extrabold text-slate-900">{totalCount} usos</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block font-medium">
              Desmarcados ao Passar o Dia:
            </span>
            <span className="text-base font-extrabold text-blue-700">{expiredCount} finalizados</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block font-medium">
              Desmarcados / Devolvidos:
            </span>
            <span className="text-base font-extrabold text-emerald-700">{manualCount} liberados</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block font-medium">
              Em Uso Ativo Hoje:
            </span>
            <span className="text-base font-extrabold text-amber-600">{inUseCount} turmas</span>
          </div>
        </div>

        {/* Explanation Banner */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              <strong>Mecanismo Automático Ativo:</strong> Quando o dia letivo passa, o sistema desmarca automaticamente o uso do laboratório multiuso e dos equipamentos, liberando-os para os próximos agendamentos e arquivando o registro no histórico.
            </span>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
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

          {/* Reset button */}
          {(searchTerm || classFilter !== 'TODAS' || shiftFilter !== 'TODOS' || reasonFilter !== 'TODOS') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setClassFilter('TODAS');
                setShiftFilter('TODOS');
                setReasonFilter('TODOS');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Turma Filter (All 12 requested classes) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Filtrar por Turma:
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="TODAS">Todas as Turmas ({SCHOOL_CLASSES.length} turmas)</option>
              <optgroup label="☀️ Ensino Médio (Matutino)">
                {MATUTINO_CLASSES.map((tg) => (
                  <option key={tg} value={tg}>
                    Turma {tg}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🌤️ Ensino Fundamental (Vespertino)">
                {VESPERTINO_CLASSES.map((tg) => (
                  <option key={tg} value={tg}>
                    Turma {tg}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Shift */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Filtrar por Turno:
            </label>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="TODOS">Todos os Turnos</option>
              <option value="Matutino">☀️ Matutino (07h15 às 11h40)</option>
              <option value="Vespertino">🌤️ Vespertino (13h00 às 17h25)</option>
            </select>
          </div>

          {/* Reason / Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Status do Uso:
            </label>
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="EXPIRADO_DATA">🕒 Desmarcados ao passar o dia</option>
              <option value="MANUAL">✓ Desmarcados / Liberados manualmente</option>
              <option value="CONCLUIDO">Concluídos</option>
              <option value="EM_USO">Em Uso</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between text-xs">
          <span className="font-bold">
            Registros Encontrados: {sorted.length} de {totalCount}
          </span>
          <span className="text-slate-400">
            Ordenado por data mais recente
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <History className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">
              Nenhum registro de uso encontrado com os filtros selecionados.
            </p>
            <p className="text-xs text-slate-400">
              Tente redefinir os filtros para exibir todo o histórico.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[850px] text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3 w-40">Dia / Data</th>
                  <th className="p-3 w-48">Hora &amp; Aulas</th>
                  <th className="p-3 w-28 text-center">Turma</th>
                  <th className="p-3">Professor &amp; Disciplina</th>
                  <th className="p-3">Local &amp; Recursos</th>
                  <th className="p-3 w-40 text-center">Status do Uso</th>
                  <th className="p-3 w-24 text-right">Ação</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sorted.map((b) => {
                  const isMatutinoClass = MATUTINO_CLASSES.includes(b.classGroup);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. Dia / Data */}
                      <td className="p-3 font-semibold text-slate-800 align-top">
                        <div className="font-bold text-slate-900">
                          {formatDayAgendaLabel(b.date)}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {formatDateBR(b.date)}
                        </div>
                      </td>

                      {/* 2. Hora & Aulas */}
                      <td className="p-3 align-top text-slate-700">
                        <div className="font-bold text-slate-900">
                          {b.periods.join(', ')}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                          {getPeriodTimeSummary(b.shift, b.periods)}
                        </div>
                        <div className="text-[10px] text-blue-700 font-semibold mt-0.5">
                          Turno {b.shift}
                        </div>
                      </td>

                      {/* 3. Turma */}
                      <td className="p-3 align-top text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black shadow-xs ${
                            isMatutinoClass
                              ? 'bg-blue-600 text-white'
                              : 'bg-indigo-600 text-white'
                          }`}
                        >
                          {b.classGroup}
                        </span>
                      </td>

                      {/* 4. Professor & Disciplina */}
                      <td className="p-3 align-top">
                        <div className="font-bold text-slate-900 text-xs">
                          {b.teacherName}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
                          {b.subject}
                        </div>
                        {b.purpose && (
                          <div className="text-[10px] text-slate-400 italic line-clamp-1 mt-0.5">
                            "{b.purpose}"
                          </div>
                        )}
                      </td>

                      {/* 5. Local & Recursos Multimídia */}
                      <td className="p-3 align-top space-y-1">
                        <div className="flex items-center gap-1 font-semibold text-slate-800 text-[11px]">
                          {getLocationIcon(b.location)}
                          <span>
                            {b.location} {b.locationDetails ? `(${b.locationDetails})` : ''}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1">
                          {b.equipments.map((eq, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                            >
                              {getEquipmentIcon(eq)}
                              <span className="truncate max-w-[100px]">{eq}</span>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 6. Status do Uso */}
                      <td className="p-3 align-top text-center">
                        {getStatusBadge(b)}
                        {b.completedAt && (
                          <div className="text-[9px] text-slate-400 mt-1">
                            {formatDateBR(b.completedAt.slice(0, 10))}
                          </div>
                        )}
                      </td>

                      {/* 7. Ação */}
                      <td className="p-3 align-top text-right space-y-1">
                        <button
                          onClick={() => onSelectBookingForVoucher(b)}
                          className="px-2 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Ver Ficha e Termo de Retirada"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Ficha</span>
                        </button>

                        {/* Botão para desmarcar uso manualmente se ainda ativo */}
                        {(b.status === 'CONFIRMADO' || b.status === 'EM_USO') && (
                          <button
                            onClick={() => onUnmarkBooking(b.id)}
                            className="px-2 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer block w-full text-center"
                            title="Desmarcar o uso e liberar a sala imediatamente"
                          >
                            Desmarcar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
