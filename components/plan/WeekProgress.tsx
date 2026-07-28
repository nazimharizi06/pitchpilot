export function WeekProgress({ total, unlocked }: { total: number; unlocked: number }) {
  return (
    <div className="flex gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => i + 1).map((day) => (
        <div
          key={day}
          className={`flex-1 h-2 rounded-full ${
            day <= unlocked ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-800"
          }`}
          title={`Day ${day}`}
        />
      ))}
    </div>
  );
}
