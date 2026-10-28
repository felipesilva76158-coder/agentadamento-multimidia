import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck, FileText } from 'lucide-react';
import { Booking } from '../types/multimedia';
import { SCHOOL_INFO } from '../data/initialData';
import { formatDateBR, getWeekdayName } from '../utils/dateUtils';

interface BookingVoucherModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const BookingVoucherModal: React.FC<BookingVoucherModalProps> = ({
  booking,
  onClose,
}) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const is3401 = booking.classGroup === '34.01';
  const is3301 = booking.classGroup === '33.01';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-300">
        {/* Action bar (hidden in print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm">
              Ficha Oficial de Retirada e Termo de Responsabilidade
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-10 text-slate-800 space-y-6 bg-white font-sans text-sm print:p-0">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <div className="text-xs uppercase font-bold tracking-widest text-slate-600">
              GOVERNO DO ESTADO DO TOCANTINS • SECRETARIA DA EDUCAÇÃO (SEDUC-TO)
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
              {SCHOOL_INFO.name}
            </h1>
            <p className="text-xs font-semibold text-slate-700">
              SETOR DE TECNOLOGIA EDUCACIONAL E RECURSOS MULTIMÍDIA
            </p>
            <div className="inline-block mt-1 px-3 py-1 bg-slate-100 rounded-md text-xs font-mono font-bold text-slate-800">
              PROTOCOLO Nº: {booking.id.toUpperCase()} • DATA DE EMISSÃO: {formatDateBR(new Date().toISOString().slice(0, 10))}
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase underline tracking-wide">
              Ficha de Agendamento e Termo de Retirada de Recursos
            </h2>
          </div>

          {/* Grid of details */}
          <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded-xl p-4 bg-slate-50/50">
            <div>
              <span className="text-xs font-bold uppercase text-slate-500 block">
                Professor(a) Solicitante:
              </span>
              <span className="text-sm font-bold text-slate-900">
                {booking.teacherName}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-slate-500 block">
                Disciplina / Componente:
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {booking.subject}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-slate-500 block">
                Turma Atendida:
              </span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded text-xs font-black ${
                  is3401
                    ? 'bg-blue-600 text-white'
                    : is3301
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-white'
                }`}
              >
                Turma {booking.classGroup}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-slate-500 block">
                Local de Utilização:
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {booking.location} {booking.locationDetails ? `(${booking.locationDetails})` : ''}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-slate-500 block">
                Data do Agendamento:
              </span>
              <span className="text-sm font-bold text-slate-900">
                {formatDateBR(booking.date)} ({getWeekdayName(booking.date)})
              </span>
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-slate-500 block">
                Turno e Aulas Solicitadas:
              </span>
              <span className="text-sm font-bold text-slate-900">
                Turno {booking.shift} — {booking.periods.join(', ')}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-slate-500 block">
                Situação no Sistema:
              </span>
              <span className="text-xs font-bold text-slate-800">
                {booking.status === 'CONCLUIDO'
                  ? booking.completionReason === 'EXPIRADO_DATA'
                    ? '✓ Finalizado Automaticamente (Dia Expirado / Arquivado)'
                    : '✓ Concluído / Desmarcado'
                  : booking.status === 'EM_USO'
                  ? '⚡ Em Uso Ativo'
                  : '✓ Confirmado (Ativo)'}
              </span>
            </div>
          </div>

          {/* Equipments Checklist Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 font-bold text-xs uppercase text-slate-700 tracking-wider">
              Recursos Multimídia Solicitados e Checklist de Conferência
            </div>
            <table className="w-full text-xs">
              <thead className="border-b border-slate-300 bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="p-2.5 text-left">Item / Equipamento</th>
                  <th className="p-2.5 text-center w-28">Entrega (OK)</th>
                  <th className="p-2.5 text-center w-28">Devolução (OK)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {booking.equipments.map((eq, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{eq}</span>
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="w-4 h-4 border-2 border-slate-400 mx-auto rounded"></div>
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="w-4 h-4 border-2 border-slate-400 mx-auto rounded"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Purpose */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs">
            <span className="font-bold text-slate-700 block mb-0.5">
              Objetivo Pedagógico / Atividade:
            </span>
            <p className="text-slate-600 italic">{booking.purpose}</p>
          </div>

          {/* Responsibility Clause */}
          <div className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-200 pt-3 space-y-1">
            <p className="font-bold text-slate-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Termo de Responsabilidade e Guarda de Patrimônio Escolar:
            </p>
            <p>
              O(a) professor(a) declara que recebeu os equipamentos discriminados acima em perfeito estado de funcionamento e conservação, comprometendo-se a zelar pelo bom uso durante o período de aula na turma informada e devolvê-los devidamente conectados ao carregador / acondicionados na coordenação de mídias imediatamente ao término das aulas.
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
            <div>
              <div className="border-t border-slate-900 pt-1.5 font-bold text-slate-900">
                {booking.teacherName}
              </div>
              <div className="text-slate-500 text-[11px]">
                Professor(a) Responsável
              </div>
            </div>

            <div>
              <div className="border-t border-slate-900 pt-1.5 font-bold text-slate-900">
                Coordenação de Mídias e Tecnologia
              </div>
              <div className="text-slate-500 text-[11px]">
                {SCHOOL_INFO.name}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (hidden in print) */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end gap-2 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors cursor-pointer"
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ficha</span>
          </button>
        </div>
      </div>
    </div>
  );
};
