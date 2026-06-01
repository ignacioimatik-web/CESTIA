'use client'

import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  baseServings: number
  value: number
  onChange: (servings: number) => void
}

export function ServingsSelector({ baseServings, value, onChange }: Props) {
  const presets = [baseServings, baseServings * 2, baseServings * 3]

  return (
    <div className="bg-card border rounded-xl p-4">
      <label className="text-xs font-medium text-muted-foreground mb-2 block">
        Raciones
      </label>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full"
          disabled={value <= 1}
          onClick={() => onChange(Math.max(1, value - 1))}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="flex-1 text-center">
          <span className="text-2xl font-bold tabular-nums">{value}</span>
          <span className="text-sm text-muted-foreground ml-1">
            persona{value !== 1 ? 's' : ''}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full"
          onClick={() => onChange(value + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-1.5 mt-3">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`flex-1 h-8 rounded-lg text-xs font-medium transition-colors
              ${value === p
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
