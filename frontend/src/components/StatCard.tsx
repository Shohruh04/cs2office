import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  highlight?: boolean;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  highlight = false,
}: StatCardProps) {
  return (
    <div
      className={`cs-card p-4 ${
        highlight ? 'border-cs2-orange/40 shadow-cs-glow' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-cs2-gray uppercase tracking-wider">
          {label}
        </span>
        {Icon && <Icon size={16} className="text-cs2-orange" />}
      </div>
      <div
        className={`text-2xl font-bold font-display ${
          highlight ? 'text-cs2-orange-light' : 'text-white'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
