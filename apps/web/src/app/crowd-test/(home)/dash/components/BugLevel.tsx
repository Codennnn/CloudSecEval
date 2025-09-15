const bugLevelData = [
  {
    level: '高危',
    value: 100,
  },
  {
    level: '中危',
    value: 50,
  },
  {
    level: '低危',
    value: 20,
  },
]

export function BugLevel() {
  return (
    <div className="flex flex-col gap-2">
      {bugLevelData.map((item) => (
        <div key={item.level} className="flex items-center gap-2 text-sm">
          <div>{item.level}：</div>

          <div className="h-3 flex-1 flex items-center gap-1">
            <div
              className="h-full bg-gradient-to-r from-theme to-95% to-theme2 rounded-xs"
              style={{
                width: `${(item.value / 100) * 100}%`,
              }}
            />
            <div className="text-sm shrink-0">{item.value}个</div>
          </div>

        </div>
      ))}
    </div>
  )
}
