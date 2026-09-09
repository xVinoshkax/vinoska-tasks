import React from 'react';
import { X, Plus, Trash2, Sliders } from 'lucide-react';
import type { CustomPriority, CustomStatus } from '../types';

interface ManagePropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  priorities: CustomPriority[];
  statuses: CustomStatus[];
  onUpdatePriorities: (priorities: CustomPriority[]) => void;
  onUpdateStatuses: (statuses: CustomStatus[]) => void;
}

export const ManagePropertiesModal: React.FC<ManagePropertiesModalProps> = ({
  isOpen,
  onClose,
  priorities,
  statuses,
  onUpdatePriorities,
  onUpdateStatuses,
}) => {
  const [activeTab, setActiveTab] = React.useState<'priorities' | 'statuses'>('priorities');

  // New Priority Form
  const [newPrioLabel, setNewPrioLabel] = React.useState('');
  const [newPrioColor, setNewPrioColor] = React.useState('#ef4444');

  // New Status Form
  const [newStatusName, setNewStatusName] = React.useState('');
  const [newStatusColor, setNewStatusColor] = React.useState('#6366f1');
  const [newStatusIsDone, setNewStatusIsDone] = React.useState(false);

  if (!isOpen) return null;

  // Add priority
  const handleAddPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrioLabel.trim()) return;
    const newP: CustomPriority = {
      id: `prio_${Date.now()}`,
      label: newPrioLabel.trim(),
      color: newPrioColor,
    };
    onUpdatePriorities([...priorities, newP]);
    setNewPrioLabel('');
  };

  // Delete priority
  const handleDeletePriority = (id: string) => {
    if (priorities.length <= 1) {
      alert('Должен остаться хотя бы один приоритет');
      return;
    }
    onUpdatePriorities(priorities.filter((p) => p.id !== id));
  };

  // Add status
  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusName.trim()) return;
    const newS: CustomStatus = {
      id: `status_${Date.now()}`,
      name: newStatusName.trim(),
      color: newStatusColor,
      isDone: newStatusIsDone,
    };
    onUpdateStatuses([...statuses, newS]);
    setNewStatusName('');
    setNewStatusIsDone(false);
  };

  // Delete status
  const handleDeleteStatus = (id: string) => {
    if (statuses.length <= 1) {
      alert('Должен остаться хотя бы один статус');
      return;
    }
    onUpdateStatuses(statuses.filter((s) => s.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#14161f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="h-14 px-5 border-b border-white/10 flex items-center justify-between bg-[#181b26]">
          <div className="flex items-center gap-2.5">
            <Sliders size={17} className="text-slate-300" />
            <h2 className="text-sm font-semibold text-white">Настройка приоритетов и статусов</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-[#12141c]">
          <button
            onClick={() => setActiveTab('priorities')}
            className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === 'priorities'
                ? 'border-indigo-500 text-white bg-white/[0.03]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Приоритеты ({priorities.length})
          </button>
          <button
            onClick={() => setActiveTab('statuses')}
            className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === 'statuses'
                ? 'border-indigo-500 text-white bg-white/[0.03]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Статусы задач ({statuses.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'priorities' ? (
            <div className="space-y-4">
              {/* Priorities List */}
              <div className="space-y-2">
                {priorities.map((prio) => (
                  <div
                    key={prio.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#1a1d28] border border-white/[0.06]"
                  >
                    <div className="flex items-center gap-2.5">
                      <label
                        className="relative w-5 h-5 rounded-full cursor-pointer overflow-hidden border border-white/20 shrink-0 flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                        style={{ backgroundColor: prio.color }}
                        title="Выбрать цвет"
                      >
                        <input
                          type="color"
                          value={prio.color}
                          onChange={(e) => {
                            const next = priorities.map((p) =>
                              p.id === prio.id ? { ...p, color: e.target.value } : p
                            );
                            onUpdatePriorities(next);
                          }}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                      </label>
                      <input
                        type="text"
                        value={prio.label}
                        onChange={(e) => {
                          const next = priorities.map((p) =>
                            p.id === prio.id ? { ...p, label: e.target.value } : p
                          );
                          onUpdatePriorities(next);
                        }}
                        className="bg-transparent text-xs text-white font-medium focus:outline-none border-b border-transparent focus:border-indigo-500 flex-1"
                      />
                    </div>

                    <button
                      onClick={() => handleDeletePriority(prio.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                      title="Удалить приоритет"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Priority Form */}
              <form onSubmit={handleAddPriority} className="p-3 rounded-xl bg-[#12141c] border border-dashed border-white/10 space-y-2.5">
                <span className="text-xs font-semibold text-slate-300 block">+ Создать новый приоритет</span>
                <div className="flex items-center gap-2">
                  <label
                    className="relative w-7 h-7 rounded-full cursor-pointer overflow-hidden border border-white/20 shrink-0 flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                    style={{ backgroundColor: newPrioColor }}
                    title="Выбрать цвет"
                  >
                    <input
                      type="color"
                      value={newPrioColor}
                      onChange={(e) => setNewPrioColor(e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </label>
                  <input
                    type="text"
                    value={newPrioLabel}
                    onChange={(e) => setNewPrioLabel(e.target.value)}
                    placeholder="Название приоритета (напр. Критично, Блокер, Срочно)..."
                    className="flex-1 bg-[#1a1d28] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
                    title="Добавить"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Statuses List */}
              <div className="space-y-2">
                {statuses.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#1a1d28] border border-white/[0.06]"
                  >
                    <div className="flex items-center gap-2.5">
                      <label
                        className="relative w-5 h-5 rounded-full cursor-pointer overflow-hidden border border-white/20 shrink-0 flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                        style={{ backgroundColor: status.color }}
                        title="Выбрать цвет"
                      >
                        <input
                          type="color"
                          value={status.color}
                          onChange={(e) => {
                            const next = statuses.map((s) =>
                              s.id === status.id ? { ...s, color: e.target.value } : s
                            );
                            onUpdateStatuses(next);
                          }}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                      </label>
                      <input
                        type="text"
                        value={status.name}
                        onChange={(e) => {
                          const next = statuses.map((s) =>
                            s.id === status.id ? { ...s, name: e.target.value } : s
                          );
                          onUpdateStatuses(next);
                        }}
                        className="bg-transparent text-xs text-white font-medium focus:outline-none border-b border-transparent focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(status.isDone)}
                          onChange={(e) => {
                            const next = statuses.map((s) =>
                              s.id === status.id ? { ...s, isDone: e.target.checked } : s
                            );
                            onUpdateStatuses(next);
                          }}
                          className="rounded bg-white/10 border-white/20 text-indigo-600"
                        />
                        <span>Считается выполненным</span>
                      </label>
                      <button
                        onClick={() => handleDeleteStatus(status.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                        title="Удалить статус"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Status Form */}
              <form onSubmit={handleAddStatus} className="p-3 rounded-xl bg-[#12141c] border border-dashed border-white/10 space-y-2.5">
                <span className="text-xs font-semibold text-slate-300 block">+ Создать новый статус</span>
                <div className="flex items-center gap-2">
                  <label
                    className="relative w-7 h-7 rounded-full cursor-pointer overflow-hidden border border-white/20 shrink-0 flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                    style={{ backgroundColor: newStatusColor }}
                    title="Выбрать цвет"
                  >
                    <input
                      type="color"
                      value={newStatusColor}
                      onChange={(e) => setNewStatusColor(e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </label>
                  <input
                    type="text"
                    value={newStatusName}
                    onChange={(e) => setNewStatusName(e.target.value)}
                    placeholder="Название статуса (напр. На проверке)..."
                    className="flex-1 bg-[#1a1d28] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
                    title="Добавить"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="h-12 px-5 bg-[#12141c] border-t border-white/10 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 text-white transition"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
