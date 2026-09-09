import React from 'react';
import {
  Droplets,
  Flame,
  Dumbbell,
  Footprints,
  Heart,
  Moon,
  BookOpen,
  Brain,
  Coffee,
  Apple,
  Smile,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  Shield,
  Clock,
  Sun,
  PenTool,
  Music,
  type LucideProps,
} from 'lucide-react';

export interface HabitIconItem {
  id: string;
  name: string;
  category: 'sport' | 'health' | 'mind' | 'life';
  component: React.FC<LucideProps>;
}

export const HABIT_ICONS: HabitIconItem[] = [
  // Здоровье и тело
  { id: 'Droplets', name: 'Вода', category: 'health', component: Droplets },
  { id: 'Heart', name: 'Сердце / Здоровье', category: 'health', component: Heart },
  { id: 'Apple', name: 'Питание', category: 'health', component: Apple },
  { id: 'Moon', name: 'Сон / Отдых', category: 'health', component: Moon },
  { id: 'Shield', name: 'Без срывов', category: 'health', component: Shield },

  // Спорт и движение
  { id: 'Flame', name: 'Огонь / Интенсив', category: 'sport', component: Flame },
  { id: 'Dumbbell', name: 'Тренировка', category: 'sport', component: Dumbbell },
  { id: 'Footprints', name: '10 000 шагов', category: 'sport', component: Footprints },
  { id: 'Activity', name: 'Активность', category: 'sport', component: Activity },
  { id: 'Zap', name: 'Энергия', category: 'sport', component: Zap },

  // Разум и развитие
  { id: 'BookOpen', name: 'Чтение', category: 'mind', component: BookOpen },
  { id: 'Brain', name: 'Обучение / Ум', category: 'mind', component: Brain },
  { id: 'PenTool', name: 'Дневник / Письмо', category: 'mind', component: PenTool },
  { id: 'CheckCircle2', name: 'Дисциплина', category: 'mind', component: CheckCircle2 },

  // Образ жизни
  { id: 'Sun', name: 'Ранний подъем', category: 'life', component: Sun },
  { id: 'Coffee', name: 'Кофе / Чай', category: 'life', component: Coffee },
  { id: 'Clock', name: 'Режим дня', category: 'life', component: Clock },
  { id: 'Smile', name: 'Благодарность', category: 'life', component: Smile },
  { id: 'Music', name: 'Музыка / Хобби', category: 'life', component: Music },
  { id: 'Sparkles', name: 'Магия привычки', category: 'life', component: Sparkles },
];

export function renderHabitIcon(iconName: string, props: LucideProps = { size: 16 }): React.ReactNode {
  const match = HABIT_ICONS.find((item) => item.id.toLowerCase() === iconName.toLowerCase());
  if (match) {
    const IconComp = match.component;
    return <IconComp {...props} />;
  }
  return <Sparkles {...props} />;
}
