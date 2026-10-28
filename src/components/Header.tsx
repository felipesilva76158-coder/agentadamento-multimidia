import React from 'react';
import {
  Calendar,
  PlusCircle,
  FileText,
  RotateCcw,
  Download,
  Upload,
  Laptop,
} from 'lucide-react';
import { SCHOOL_INFO } from '../data/initialData';
import { Booking } from '../types/multimedia';

interface HeaderProps {
  bookings: Booking[];
  onOpenNewBooking: () => void;
  onOpenRules: () => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeTab: 'semanal' | 'historico' | 'equipamentos';
  setActiveTab: (tab: 'semanal' | 'historico' | 'equipamentos') => void;
}

export const Header: React.FC<HeaderProps> = ({
  bookings,
  onOpenNewBooking,
  onOpenRules,
  onResetData,
  onExportData,
  onImportData,
  activeTab,
  setActiveTab,
}) => {
  const activeBookings = bookings.filter((b) => b.status !== 'CANCELADO');

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      {/* Top clean bar */}
      <div className="bg-slate-900 text-slate-200 px-4 py-2 text-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-wide">
              {SCHOOL_INFO.name}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">SEDUC-TO</span>
          </div>

          <button
            onClick={onOpenRules}
            className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer transition-colors"
          >
            Regras de Uso &amp; Horários
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-6xl mx-auto px-4 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Agenda Multimídia Escolar
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              TVs • Chromebooks • Caixa de Som • Projetor • Laboratório Multiuso • Biblioteca
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onResetData}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              title="Restaurar dados de exemplo"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Exemplos</span>
            </button>

            <button
              onClick={onExportData}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              title="Baixar backup"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Backup</span>
            </button>

            <button
              onClick={onOpenNewBooking}
              className="px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>
          </div>
        </div>

        {/* Clean Navigation Tabs */}
        <div className="mt-3 flex items-center gap-1 border-b border-slate-200 pt-1">
          <button
            onClick={() => setActiveTab('semanal')}
            className={`px-3 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'semanal'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Agenda Diária (Segunda a Sexta)</span>
          </button>

          <button
            onClick={() => setActiveTab('historico')}
            className={`px-3 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'historico'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Histórico de Uso ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('equipamentos')}
            className={`px-3 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'equipamentos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Equipamentos</span>
          </button>
        </div>
      </div>
    </header>
  );
};
