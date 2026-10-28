/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus, Shift } from './types/multimedia';
import { SCHOOL_INFO, getInitialBookings } from './data/initialData';
import { Header } from './components/Header';
import { WeeklyScheduleView } from './components/WeeklyScheduleView';
import { UsageHistoryView } from './components/UsageHistoryView';
import { EquipmentStatusView } from './components/EquipmentStatusView';
import { NewBookingModal } from './components/NewBookingModal';
import { BookingVoucherModal } from './components/BookingVoucherModal';
import { SchoolRulesModal } from './components/SchoolRulesModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { autoUnmarkPastBookings } from './utils/dateUtils';
import {
  testConnection,
  subscribeToBookings,
  saveBookingToFirestore,
  resetBookingsInFirestore,
} from './lib/firebase';
import { CheckCircle2, AlertCircle, Info, Undo2 } from 'lucide-react';

const STORAGE_KEY = 'colegio_jose_carneiro_multimedia_bookings_v5';

interface ToastState {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  undoAction?: () => void;
}

export default function App() {
  // Load initial state from LocalStorage or seed fallback
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem('colegio_jose_carneiro_multimedia_bookings_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((b) => b.classGroup !== '82.01');
        }
      }
    } catch (e) {
      console.error('Erro ao carregar dados do LocalStorage:', e);
    }
    return getInitialBookings();
  });

  const [activeTab, setActiveTab] = useState<'semanal' | 'historico' | 'equipamentos'>('semanal');
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [selectedBookingForVoucher, setSelectedBookingForVoucher] = useState<Booking | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Prefill state when clicking an empty slot on the timetable
  const [prefillDate, setPrefillDate] = useState<string | undefined>(undefined);
  const [prefillShift, setPrefillShift] = useState<Shift | undefined>(undefined);
  const [prefillPeriod, setPrefillPeriod] = useState<string | undefined>(undefined);
  const [prefillClassGroup, setPrefillClassGroup] = useState<string | undefined>(undefined);

  // Toast notification state
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'success',
    undoAction?: () => void
  ) => {
    const id = Date.now().toString();
    setToast({ id, message, type, undoAction });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 5500);
  };

  // Real-time Database Synchronization with Firestore
  useEffect(() => {
    testConnection();

    const unsubscribe = subscribeToBookings(
      (firestoreBookings) => {
        if (Array.isArray(firestoreBookings) && firestoreBookings.length > 0) {
          setBookings(firestoreBookings);
        }
      },
      (err) => {
        console.warn('Operando com sincronização local e em nuvem:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Auto-desmarcação quando passar o dia: executada na inicialização do sistema
  useEffect(() => {
    const { updatedBookings, unmarkedCount } = autoUnmarkPastBookings(bookings);
    if (unmarkedCount > 0) {
      setBookings(updatedBookings);
      // Persist any auto-unmarked expired bookings to database
      for (const b of updatedBookings) {
        if (b.status === 'CONCLUIDO' && b.completionReason === 'EXPIRADO_DATA') {
          saveBookingToFirestore(b).catch(console.error);
        }
      }
      showToast(
        `Mecanismo Ativo: ${unmarkedCount} agendamento(s) de dias anteriores foram desmarcados e arquivados no Histórico.`,
        'info'
      );
    }
  }, [bookings.length]);

  // Sync to local storage for instant offline fallback
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch (e) {
      console.error('Erro ao salvar no LocalStorage:', e);
    }
  }, [bookings]);

  // Handle new booking creation
  const handleSaveBooking = async (newBookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...newBookingData,
      id: `jc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setBookings((prev) => [newBooking, ...prev]);
    showToast(
      `✓ Turma ${newBooking.classGroup} (${newBooking.teacherName}) agendada com sucesso!`,
      'success'
    );

    // Persist to Cloud Database
    try {
      await saveBookingToFirestore(newBooking);
    } catch (e) {
      console.error('Erro ao salvar no banco:', e);
    }
  };

  // Update status (e.g. CONFIRMADO -> EM_USO -> CONCLUIDO)
  const handleUpdateStatus = async (id: string, newStatus: BookingStatus) => {
    const target = bookings.find((b) => b.id === id);
    if (!target) return;

    const updated: Booking = {
      ...target,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      completedAt: newStatus === 'CONCLUIDO' ? new Date().toISOString() : target.completedAt,
      completionReason:
        newStatus === 'CONCLUIDO' ? target.completionReason || 'MANUAL_DESMARCADO' : undefined,
    };

    setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    showToast(`Status atualizado para: ${newStatus}`, 'info');

    try {
      await saveBookingToFirestore(updated);
    } catch (e) {
      console.error('Erro ao sincronizar status no banco:', e);
    }
  };

  // Desmarcar uso: libera a sala e equipamentos imediatamente e arquiva no histórico
  const handleUnmarkBooking = async (id: string) => {
    const target = bookings.find((b) => b.id === id);
    if (!target) return;

    const previousStatus = target.status;
    const previousReason = target.completionReason;
    const previousCompletedAt = target.completedAt;

    const updatedTarget: Booking = {
      ...target,
      status: 'CONCLUIDO',
      completionReason: 'MANUAL_DESMARCADO',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBookings((prev) => prev.map((b) => (b.id === id ? updatedTarget : b)));

    try {
      await saveBookingToFirestore(updatedTarget);
    } catch (e) {
      console.error('Erro ao atualizar desmarcação no banco:', e);
    }

    // Provide immediate undo action in toast
    showToast(
      `✓ Uso da Turma ${target.classGroup} (${target.teacherName}) desmarcado. Sala e multimídia liberadas!`,
      'success',
      async () => {
        const restored: Booking = {
          ...target,
          status: previousStatus,
          completionReason: previousReason,
          completedAt: previousCompletedAt,
          updatedAt: new Date().toISOString(),
        };

        setBookings((prev) => prev.map((b) => (b.id === id ? restored : b)));

        try {
          await saveBookingToFirestore(restored);
          showToast(`Agendamento da Turma ${target.classGroup} restaurado.`, 'info');
        } catch (e) {
          console.error('Erro ao restaurar agendamento no banco:', e);
        }
      }
    );
  };

  // Executar verificação e desmarcação automática de dias passados
  const handleRunAutoUnmark = async () => {
    const { updatedBookings, unmarkedCount } = autoUnmarkPastBookings(bookings);
    setBookings(updatedBookings);
    if (unmarkedCount > 0) {
      for (const b of updatedBookings) {
        if (b.status === 'CONCLUIDO' && b.completionReason === 'EXPIRADO_DATA') {
          saveBookingToFirestore(b).catch(console.error);
        }
      }
      showToast(
        `${unmarkedCount} agendamento(s) de dias anteriores foram desmarcados e liberados com sucesso!`,
        'success'
      );
    } else {
      showToast('Todos os agendamentos anteriores já estão desmarcados e no histórico.', 'info');
    }
  };

  // Open new booking modal from timetable slot
  const handleOpenWithPrefill = (
    date: string,
    shift: Shift,
    period: string,
    classGroup?: string
  ) => {
    setPrefillDate(date);
    setPrefillShift(shift);
    setPrefillPeriod(period);
    setPrefillClassGroup(classGroup);
    setIsNewBookingOpen(true);
  };

  // Open new booking modal with clean prefill
  const handleOpenCleanNewBooking = () => {
    setPrefillDate(undefined);
    setPrefillShift(undefined);
    setPrefillPeriod(undefined);
    setPrefillClassGroup(undefined);
    setIsNewBookingOpen(true);
  };

  // Quick book equipment from inventory
  const handleBookEquipment = (equipmentName: string) => {
    setPrefillDate(undefined);
    setPrefillShift(undefined);
    setPrefillPeriod(undefined);
    setPrefillClassGroup(undefined);
    setIsNewBookingOpen(true);
  };

  // Reset to initial seed demo data using in-app ConfirmDialog
  const handleConfirmResetData = async () => {
    setIsResetConfirmOpen(false);
    try {
      await resetBookingsInFirestore();
      showToast('Dados restaurados no banco de dados para os exemplos do Colégio José Carneiro.', 'info');
    } catch (e) {
      const initial = getInitialBookings();
      setBookings(initial);
      showToast('Dados restaurados para os exemplos do Colégio José Carneiro de Brito.', 'info');
    }
  };

  // Export JSON backup
  const handleExportData = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bookings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `agendamento_multimidia_colegio_jose_carneiro_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup dos agendamentos exportado com sucesso!', 'success');
  };

  // Import JSON backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          const filtered = imported.filter((b) => b.classGroup !== '82.01');
          setBookings(filtered);
          for (const b of filtered) {
            saveBookingToFirestore(b).catch(console.error);
          }
          showToast(`${filtered.length} agendamentos importados e sincronizados!`, 'success');
        } else {
          showToast('Arquivo inválido: formato de lista esperado.', 'error');
        }
      } catch (err) {
        showToast('Erro ao processar arquivo JSON.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Toast notification banner with Undo */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-3 duration-200 no-print max-w-md">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          ) : toast.type === 'info' ? (
            <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}

          <span className="flex-1 leading-tight">{toast.message}</span>

          {toast.undoAction && (
            <button
              onClick={() => {
                toast.undoAction?.();
                setToast(null);
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-slate-600 flex-shrink-0"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Desfazer</span>
            </button>
          )}
        </div>
      )}

      {/* Main Header */}
      <Header
        bookings={bookings}
        onOpenNewBooking={handleOpenCleanNewBooking}
        onOpenRules={() => setIsRulesModalOpen(true)}
        onResetData={() => setIsResetConfirmOpen(true)}
        onExportData={handleExportData}
        onImportData={handleImportData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6">
        {activeTab === 'semanal' && (
          <WeeklyScheduleView
            bookings={bookings}
            onOpenNewBookingWithPrefill={handleOpenWithPrefill}
            onSelectBookingForVoucher={(b) => setSelectedBookingForVoucher(b)}
            onUnmarkBooking={handleUnmarkBooking}
          />
        )}

        {activeTab === 'historico' && (
          <UsageHistoryView
            bookings={bookings}
            onSelectBookingForVoucher={(b) => setSelectedBookingForVoucher(b)}
            onUpdateStatus={handleUpdateStatus}
            onRunAutoUnmark={handleRunAutoUnmark}
            onUnmarkBooking={handleUnmarkBooking}
          />
        )}

        {activeTab === 'equipamentos' && (
          <EquipmentStatusView
            bookings={bookings}
            onBookEquipment={handleBookEquipment}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 px-4 text-center text-xs text-slate-500 space-y-2 no-print">
        <div className="flex items-center justify-center gap-2 font-bold text-slate-800">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          <span>{SCHOOL_INFO.name}</span>
          <span className="text-slate-300">•</span>
          <span>{SCHOOL_INFO.network}</span>
        </div>
        <p className="max-w-2xl mx-auto text-slate-400">
          Agendamento de Multimídia: TV, Chromebooks, Caixa de Som, Projetor | Ambientes: Biblioteca, Laboratório Multiuso e Sala de Aula | Matutino (34.01, 33.01, 24.01, 23.01, 14.01, 13.01) • Vespertino (91.01, 81.01, 71.01, 61.01, 62.01).
        </p>
        <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <span>Sistema Escolar de Agendamento Multimídia</span>
          <span>•</span>
          <span>Tocantins</span>
        </div>
      </footer>

      {/* Modals */}
      <NewBookingModal
        isOpen={isNewBookingOpen}
        onClose={() => setIsNewBookingOpen(false)}
        onSave={handleSaveBooking}
        existingBookings={bookings}
        initialDate={prefillDate}
        initialShift={prefillShift}
        initialPeriod={prefillPeriod}
        initialClassGroup={prefillClassGroup}
      />

      <BookingVoucherModal
        booking={selectedBookingForVoucher}
        onClose={() => setSelectedBookingForVoucher(null)}
      />

      <SchoolRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* In-app Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Restaurar Agendamentos de Demonstração?"
        message="Deseja recarregar a lista padrão de agendamentos no banco de dados para o Colégio Estadual José Carneiro de Brito? Os exemplos originais serão atualizados na nuvem."
        confirmLabel="Sim, Restaurar Exemplos"
        cancelLabel="Cancelar"
        isDestructive={false}
        onConfirm={handleConfirmResetData}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
}
