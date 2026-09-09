import React from 'react';
import { X, Trash2, Folder, Check } from 'lucide-react';
import type { Project } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSave: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

const PRESET_COLORS = [
  '#4f46e5', // Indigo
  '#0284c7', // Sky
  '#059669', // Emerald
  '#d97706', // Amber
  '#dc2626', // Red
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0d9488', // Teal
  '#ea580c', // Orange
  '#64748b', // Slate
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onSave,
  onDelete,
}) => {
  const [name, setName] = React.useState('');
  const [color, setColor] = React.useState('#4f46e5');

  React.useEffect(() => {
    if (project) {
      setName(project.name);
      setColor(project.color || '#4f46e5');
    } else {
      setName('');
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const savedProject: Project = {
      id: project ? project.id : `proj_${Date.now()}`,
      name: name.trim(),
      color: color,
      icon: project?.icon || 'folder',
    };

    onSave(savedProject);
    onClose();
  };

  const handleDelete = () => {
    if (!project || !onDelete) return;
    if (confirm(`Удалить проект "${project.name}"? Задачи из этого проекта не пропадут, а останутся без проекта.`)) {
      onDelete(project.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#16181e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 px-5 border-b border-white/10 flex items-center justify-between bg-[#13151b]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: color }}
            >
              <Folder size={14} />
            </div>
            <h2 className="text-sm font-semibold text-white">
              {project ? 'Редактировать проект' : 'Создать проект'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              Название проекта
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Маркетинг, Ремонт, Клиенты..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e2028] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Color swatches */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 block">
              Цвет проекта
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((preset) => {
                const isSelected = color.toLowerCase() === preset.toLowerCase();
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setColor(preset)}
                    className="w-7 h-7 rounded-full transition-transform hover:scale-110 flex items-center justify-center shadow-md relative"
                    style={{ backgroundColor: preset }}
                  >
                    {isSelected && <Check size={13} className="text-white drop-shadow" />}
                  </button>
                );
              })}

              {/* Custom color picker */}
              <label
                className="w-7 h-7 rounded-full cursor-pointer border border-dashed border-white/30 hover:border-white transition flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: color }}
                title="Свой цвет"
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            {project && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-2 rounded-xl transition"
              >
                <Trash2 size={13} />
                <span>Удалить проект</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-full text-xs text-slate-400 hover:text-white transition"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="ios-glass-btn px-5 py-2 rounded-full text-xs font-semibold"
              >
                {project ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
