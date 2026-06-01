'use client'

import { useState } from 'react'
import { Check, ShoppingBag, Trash2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from '@/components/shared/animations'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CANONICAL_SECTIONS } from '@/lib/constants/sections'
import { SectionBadge } from '@/components/shared/section-badge'
import { ProductMatchSelector } from './product-match-selector'
import type { ShoppingListItemData } from '@/app/(dashboard)/shopping-lists/actions'

type ItemRowProps = {
  item: ShoppingListItemData
  onToggleCheck: (id: string, checked: boolean) => void
  onToggleOwned: (id: string, owned: boolean) => void
  onUpdateQuantity: (id: string, quantity: number) => void
  onDelete: (id: string) => void
  onChangeSection: (id: string, section: string) => void
  onMatchChange: (itemId: string) => void
  checklistMode?: boolean
}

export function ItemRow({
  item,
  onToggleCheck,
  onToggleOwned,
  onUpdateQuantity,
  onDelete,
  onChangeSection,
  onMatchChange,
  checklistMode = false,
}: ItemRowProps) {
  const [editing, setEditing] = useState(false)
  const [qty, setQty] = useState(String(item.quantity))

  const quantityDisplay = item.unit === 'ud'
    ? String(Math.round(item.quantity))
    : item.quantity % 1 === 0
      ? String(Math.round(item.quantity))
      : String(item.quantity)

  function handleBlur() {
    setEditing(false)
    const parsed = parseFloat(qty)
    if (!isNaN(parsed) && parsed !== item.quantity) {
      onUpdateQuantity(item.id, parsed)
    } else {
      setQty(String(item.quantity))
    }
  }

  return (
    <motion.div
      layout
      className={cn(
        'flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-0 transition-colors',
        item.isChecked && 'opacity-50'
      )}
    >
      {/* Check button */}
      <button
        type="button"
        onClick={() => onToggleCheck(item.id, !item.isChecked)}
        aria-label={item.isChecked ? 'Desmarcar producto' : 'Marcar producto'}
        className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200',
          item.isChecked
            ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
            : 'border-muted-foreground/40 hover:border-primary hover:bg-primary/5'
        )}
      >
        {item.isChecked && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Check className="h-3.5 w-3.5" />
          </motion.span>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {editing ? (
            <Input
              className="h-7 w-20 text-xs rounded-lg"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
              autoFocus
            />
          ) : (
            <button
              className="text-sm font-semibold tabular-nums text-foreground hover:text-primary transition-colors"
              onClick={() => { setQty(String(item.quantity)); setEditing(true) }}
            >
              {quantityDisplay}
            </button>
          )}
          {item.unit && (
            <span className="text-xs text-muted-foreground font-medium">{item.unit}</span>
          )}
        </div>
        <p
          className={cn(
            'text-sm',
            item.isChecked && 'line-through text-muted-foreground/70'
          )}
        >
          {item.name}
        </p>
        {item.recipeSources.length > 0 && (
          <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">
            {item.recipeSources.join(', ')}
          </p>
        )}
        <ProductMatchSelector
          itemId={item.id}
          ingredientName={item.name}
          currentMatch={item.matchedProduct ?? null}
          onMatchChange={() => onMatchChange(item.id)}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Cambiar sección"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto rounded-xl">
              {CANONICAL_SECTIONS.map((section) => (
                <DropdownMenuItem
                  key={section.id}
                  onClick={() => onChangeSection(item.id, section.label)}
                  className={cn(
                    'text-xs',
                    item.section === section.label && 'font-semibold'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <SectionBadge name={section.label} />
                    {section.label}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {!checklistMode && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8',
                item.isOwned ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => onToggleOwned(item.id, !item.isOwned)}
              title={item.isOwned ? 'Ya lo tengo' : 'Marcar como poseido'}
              aria-label={item.isOwned ? 'Quitar de en casa' : 'Marcar en casa'}
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(item.id)}
            aria-label="Eliminar producto"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {item.section && (
          <SectionBadge name={item.section} className="text-[9px] leading-none" />
        )}
      </div>
    </motion.div>
  )
}
