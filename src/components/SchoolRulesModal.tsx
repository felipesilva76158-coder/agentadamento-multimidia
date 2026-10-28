import React from 'react';
import {
  X,
  BookOpen,
  Laptop,
  Monitor,
  Speaker,
  Projector,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
} from 'lucide-react';
import { SCHOOL_INFO } from '../data/initialData';

interface SchoolRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolRulesModal: React.FC<SchoolRulesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10">
              <Shield className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Normas e Diretrizes do Multimídia
              </h2>
              <p className="text-xs text-blue-200">
                {SCHOOL_INFO.name} • SEDUC-TO
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs sm:text-sm text-slate-700">
          {/* Section 1: Agendamentos */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-blue-900 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-blue-700" />
              1. Prazos e Dias de Agendamento (Segunda a Sexta)
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 text-xs">
              <li>
                Os agendamentos são permitidos <strong>exclusivamente de Segunda a Sexta-feira (5 aulas por dia)</strong>, nos turnos <strong>Matutino (07h15 às 11h40 • 5ª aula: 10h50-11h40)</strong> e <strong>Vespertino (13h00 às 17h25 • 5ª aula: 16h40-17h25)</strong>.
              </li>
              <li>
                Recomenda-se realizar a solicitação com pelo menos <strong>24 horas de antecedência</strong> para garantir a liberação e preparação dos aparelhos.
              </li>
              <li>
                <strong>Desmarcação Automática &amp; Histórico:</strong> Ao passar a data do agendamento, o sistema desmarca automaticamente o uso do espaço multiuso e dos aparelhos, liberando a sala para novas solicitações e gravando o registro completo no <strong>Histórico de Uso</strong> (com dia, hora, turma e professor).
              </li>
              <li>
                O professor ou coordenador também pode utilizar o botão <strong>"Desmarcar Uso"</strong> a qualquer momento para liberar antecipadamente o espaço e o equipamento.
              </li>
            </ul>
          </div>

          {/* Section 2: Chromebooks */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Laptop className="w-4 h-4 text-emerald-600" />
              2. Gabinetes e Kits de Chromebooks
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
              <li>
                Conferir a quantidade de aparelhos antes de liberar a turma (ex: Turma 34.01 ou 33.01) e ao final da aula.
              </li>
              <li>
                Garantir que todos os Chromebooks sejam guardados nas gavetas correspondentes e plugados aos cabos USB-C de carregamento.
              </li>
              <li>
                É expressamente proibido o consumo de alimentos ou bebidas próximo aos computadores.
              </li>
            </ul>
          </div>

          {/* Section 3: TVs e Projetores */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Monitor className="w-4 h-4 text-sky-600" />
              3. Smart TVs e Projetores Data Show
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
              <li>
                Deslocar os carrinhos de TV com calma pelos corredores, evitando desníveis bruscos.
              </li>
              <li>
                <strong>Projetores:</strong> Ao término do uso, aguardar o resfriamento da lâmpada (cooler desligar) antes de retirar da tomada, prevenindo queima prematura.
              </li>
              <li>
                Retornar todos os cabos (HDMI, extensão elétrica e controle remoto) na bolsa oficial de cada kit.
              </li>
            </ul>
          </div>

          {/* Section 4: Caixas de Som */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Speaker className="w-4 h-4 text-amber-600" />
              4. Caixas de Som e Microfones
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
              <li>
                Ajustar o volume sonoro de forma a não perturbar as aulas das turmas nas salas adjacentes.
              </li>
              <li>
                Desligar a chave dos microfones sem fio imediatamente após o término para preservar as pilhas.
              </li>
            </ul>
          </div>

          {/* Section 5: Biblioteca e Laboratório */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-purple-600" />
              5. Biblioteca e Laboratório de Informática
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
              <li>
                O agendamento do espaço garante exclusividade no horário reservado para a sua turma.
              </li>
              <li>
                Ao sair, deixar as cadeiras organizadas, ar-condicionado e luzes desligados.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
