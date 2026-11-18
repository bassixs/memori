/**
 * Число в «барабанах». Итоговое значение задано через CSS-переменную --d,
 * поэтому число читается и без JavaScript / анимаций.
 */
export function Odometer({ value, digits = 2, className = '' }: { value: number; digits?: number; className?: string }) {
  const str = String(value).padStart(digits, '0')
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="sr-only">{str}</span>
      <span className="odo" aria-hidden="true">
        {str.split('').map((d, i) => (
          <span key={i} data-odo-col data-digit={d} className="odo-col" style={{ ['--d' as string]: d, transform: 'translateY(calc(var(--d) * -10%))' }}>
            {Array.from({ length: 10 }, (_, k) => (
              <span key={k}>{k}</span>
            ))}
          </span>
        ))}
      </span>
    </span>
  )
}
