import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  BookOpen,
  Laptop,
  Monitor,
  Speaker,
  Projector,
  School,
  FlaskConical,
  CheckCircle2,
  ShieldAlert,
  Plus,
} from 'lucide-react';
import {
  Booking,
  Shift,
  LocationType,
  EquipmentCategory,
} from '../types/multimedia';
import {
  INITIAL_EQUIPMENTS,
  MATUTINO_CLASSES,
  VESPERTINO_CLASSES,
  SCHOOL_SUBJECTS,
  TEACHERS_LIST,
  LOCATIONS_LIST,
} from '../data/initialData';
import {
  PERIODS_LIST,
  PERIOD_TIMES,
  formatDateBR,
  isSchoolDay,
  getWeekdayName,
  checkBookingConflict,
  toISODate,
} from '../utils/dateUtils';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  existingBookings: Booking[];
  initialDate?: string;
  initialShift?: Shift;
  initialPeriod?: string;
  initialClassGroup?: string;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingBookings,
  initialDate,
  initialShift,
  initialPeriod,
  initialClassGroup,
}) => {
  // Determine default date (must be Mon-Fri)
  const defaultDate = useMemo(() => {
    if (initialDate && isSchoolDay(initialDate)) {
      return initialDate;
    }
    const today = new Date();
    const iso = toISODate(today);
    if (isSchoolDay(iso)) return iso;
    // Next Monday
    const day = today.getDay();
    const daysToAdd = day === 6 ? 2 : 1;
    const nextMon = new Date(today);
    nextMon.setDate(today.getDate() + daysToAdd);
    return toISODate(nextMon);
  }, [initialDate]);

  const [date, setDate] = useState(defaultDate);
  const [shift, setShift] = useState<Shift>(initialShift || 'Matutino');
  const [classGroup, setClassGroup] = useState<string>(
    initialClassGroup || (initialShift === 'Vespertino' ? '91.01' : '34.01')
  );
  const [teacherName, setTeacherName] = useState('');
  const [subject, setSubject] = useState(SCHOOL_SUBJECTS[0]);
  const [periods, setPeriods] = useState<string[]>(
    initialPeriod ? [initialPeriod] : ['1ª Aula']
  );
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([
    'Smart TV 55" (Carrinho Móvel 01)',
  ]);
  const [location, setLocation] = useState<LocationType>('Sala de Aula');
  const [locationDetails, setLocationDetails] = useState('Sala da Turma');
  const [purpose, setPurpose] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Synchronize when modal opens with prefilled values
  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      if (initialDate && isSchoolDay(initialDate)) {
        setDate(initialDate);
      }
      if (initialShift) {
        setShift(initialShift);
      }
      if (initialClassGroup) {
        setClassGroup(initialClassGroup);
      } else if (initialShift === 'Vespertino') {
        setClassGroup('91.01');
      } else {
        setClassGroup('34.01');
      }
      if (initialPeriod) {
        setPeriods([initialPeriod]);
      } else {
        setPeriods(['1ª Aula']);
      }
    }
  }, [isOpen, initialDate, initialShift, initialPeriod, initialClassGroup]);

  if (!isOpen) return null;

  // Handle Date change
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setFormError(null);
  };

  // Switch shift
  const handleShiftChange = (newShift: Shift) => {
    setShift(newShift);
    setFormError(null);
    if (newShift === 'Vespertino' && MATUTINO_CLASSES.includes(classGroup)) {
      setClassGroup('91.01');
    } else if (newShift === 'Matutino' && VESPERTINO_CLASSES.includes(classGroup)) {
      setClassGroup('34.01');
    }
  };

  // Toggle period
  const togglePeriod = (p: string) => {
    setFormError(null);
    if (periods.includes(p)) {
      if (periods.length > 1) {
        setPeriods(periods.filter((item) => item !== p));
      }
    } else {
      setPeriods([...periods, p]);
    }
  };

  const selectAllPeriods = () => {
    setFormError(null);
    setPeriods([...PERIODS_LIST]);
  };

  // Toggle equipment
  const toggleEquipment = (eqName: string) => {
    setFormError(null);
    if (selectedEquipments.includes(eqName)) {
      if (selectedEquipments.length > 1) {
        setSelectedEquipments(selectedEquipments.filter((item) => item !== eqName));
      }
    } else {
      setSelectedEquipments([...selectedEquipments, eqName]);
    }
  };

  // Real-time conflict checking
  const conflict = checkBookingConflict(
    {
      date,
      shift,
      periods,
      equipments: selectedEquipments,
      location,
      locationDetails,
      classGroup,
      teacherName,
    },
    existingBookings
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!teacherName.trim()) {
      setFormError('Por favor, informe ou selecione o nome do(a) Professor(a).');
      return;
    }

    if (!isSchoolDay(date)) {
      setFormError('Data inválida: agendamentos devem ser de Segunda a Sexta-feira.');
      return;
    }

    if (selectedEquipments.length === 0) {
      setFormError('Selecione ao menos um equipamento multimídia.');
      return;
    }

    if (periods.length === 0) {
      setFormError('Selecione ao menos uma aula para o agendamento.');
      return;
    }

    // Regra estrita: 1 professor por turma/sala no mesmo horário
    if (conflict.hasConflict) {
      setFormError(
        conflict.reasons[0] ||
          'Conflito detectado: este horário ou recurso já está agendado por outro professor.'
      );
      return;
    }

    onSave({
      teacherName: teacherName.trim(),
      subject,
      classGroup,
      date,
      shift,
      periods,
      equipments: selectedEquipments,
      location,
      locationDetails: locationDetails.trim() || undefined,
      purpose: purpose.trim() || 'Aula pedagógica com recursos multimídia.',
      status: 'CONFIRMADO',
    });

    onClose();
  };

  const getEquipmentIcon = (category: EquipmentCategory) => {
    switch (category) {
      case 'TV':
        return <Monitor className="w-4 h-4 text-sky-600" />;
      case 'Chromebook':
        return <Laptop className="w-4 h-4 text-emerald-600" />;
      case 'Caixa de Som':
        return <Speaker className="w-4 h-4 text-amber-600" />;
      case 'Projetor':
        return <Projector className="w-4 h-4 text-violet-600" />;
      default:
        return <Monitor className="w-4 h-4 text-slate-500" />;
    }
  };

  const currentShiftClasses = shift === 'Matutino' ? MATUTINO_CLASSES : VESPERTINO_CLASSES;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Colégio Estadual José Carneiro de Brito
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold mt-1">
              Marcar Agendamento de Multimídia
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 max-h-[82vh] overflow-y-auto space-y-4 text-slate-800">
          {/* Error Banner */}
          {formError && (
            <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs text-rose-900 flex items-start gap-2.5 animate-in shake duration-150">
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-950">Atenção ao agendar:</p>
                <p className="mt-0.5 font-medium">{formError}</p>
              </div>
            </div>
          )}

          {/* Conflict Live Warning */}
          {!formError && conflict.hasConflict && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Horário / Recurso Ocupado:</p>
                <p className="mt-0.5">{conflict.reasons[0]}</p>
              </div>
            </div>
          )}

          {/* 1. Turno e Turma */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                1. Turno &amp; Turma
              </span>

              {/* Turno toggle */}
              <div className="inline-flex bg-slate-200 p-0.5 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleShiftChange('Matutino')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    shift === 'Matutino'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ☀️ Matutino (07:15 - 11:40)
                </button>
                <button
                  type="button"
                  onClick={() => handleShiftChange('Vespertino')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    shift === 'Vespertino'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🌤️ Vespertino (13:00 - 17:25)
                </button>
              </div>
            </div>

            {/* Turma selection */}
            <div>
              <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
                Escolha a turma ({shift === 'Matutino' ? 'Ensino Médio' : 'Ensino Fundamental'}):
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {currentShiftClasses.map((tg) => {
                  const isSelected = classGroup === tg;
                  return (
                    <button
                      key={tg}
                      type="button"
                      onClick={() => {
                        setClassGroup(tg);
                        setFormError(null);
                      }}
                      className={`py-2 px-2 rounded-xl text-center font-bold text-xs transition-all cursor-pointer border ${
                        isSelected
                          ? shift === 'Matutino'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-[10px] text-opacity-80">Turma</div>
                      <div className="text-sm font-black">{tg}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Professor & Disciplina */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Professor(a) Responsável *
              </label>
              <input
                type="text"
                list="teachers-list-options"
                placeholder="Ex: Prof. Carlos Mendes"
                value={teacherName}
                onChange={(e) => {
                  setTeacherName(e.target.value);
                  setFormError(null);
                }}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <datalist id="teachers-list-options">
                {TEACHERS_LIST.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>

              {/* Quick chips for teachers */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {TEACHERS_LIST.slice(0, 4).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTeacherName(t);
                      setFormError(null);
                    }}
                    className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 rounded font-medium cursor-pointer transition-colors"
                  >
                    {t.replace('Prof. ', '').replace('Profa. ', '')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Componente Curricular / Disciplina
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {SCHOOL_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Data e Aulas (5 aulas separadas) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Data (Segunda a Sexta) *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full sm:w-56 px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-bold text-blue-700 block">
                  📅 {getWeekdayName(date).split('-')[0]} {date.slice(8, 10)}/{date.slice(5, 7)}
                </span>
                <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded inline-block mt-0.5 border border-amber-200">
                  {shift === 'Matutino' ? 'Recreio: 09:45 - 10:00' : 'Recreio: 15:30 - 15:45'}
                </span>
              </div>
            </div>

            {/* 5 Aulas selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Selecione as Aulas (50 min cada):
                </span>
                <button
                  type="button"
                  onClick={selectAllPeriods}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                >
                  Marcar todas
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {PERIODS_LIST.map((p, idx) => {
                  const isSelected = periods.includes(p);
                  const time = PERIOD_TIMES[shift][p];
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePeriod(p)}
                      className={`p-2 rounded-xl text-center transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <div className="text-xs">{p}</div>
                      <div
                        className={`text-[10px] font-mono mt-0.5 ${
                          isSelected ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        {time}
                      </div>
                      {idx === 2 && (
                        <div
                          className={`text-[9px] mt-0.5 font-bold ${
                            isSelected ? 'text-amber-200' : 'text-amber-600'
                          }`}
                        >
                          + recreio
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Equipamentos Multimídia */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              4. Recursos Multimídia (Clique para marcar/desmarcar)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INITIAL_EQUIPMENTS.map((eq) => {
                const isSelected = selectedEquipments.includes(eq.name);
                return (
                  <div
                    key={eq.id}
                    onClick={() => toggleEquipment(eq.name)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-400'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-slate-100 flex-shrink-0">
                        {getEquipmentIcon(eq.category)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {eq.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {eq.code}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Local de Utilização */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              5. Local de Utilização
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LOCATIONS_LIST.map((loc) => {
                const isSelected = location === loc.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      setLocation(loc.id as LocationType);
                      if (loc.id === 'Sala de Aula') {
                        setLocationDetails(`Sala da Turma ${classGroup}`);
                      } else if (loc.id === 'Laboratório') {
                        setLocationDetails('Laboratório de Informática / Multiuso');
                      } else if (loc.id === 'Biblioteca') {
                        setLocationDetails('Biblioteca Escolar');
                      } else {
                        setLocationDetails('Auditório');
                      }
                    }}
                    className={`p-2 rounded-lg text-center transition-all cursor-pointer border text-xs font-bold ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>{loc.name}</div>
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={locationDetails}
              onChange={(e) => setLocationDetails(e.target.value)}
              placeholder="Ex: Sala da Turma, Sala 06 ou Bancada Multiuso"
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Marcar Agendamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
