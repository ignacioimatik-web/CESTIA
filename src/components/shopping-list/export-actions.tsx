'use client'

import { useState } from 'react'
import {
  Download,
  ClipboardCopy,
  Share2,
  Printer,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { formatText, formatCSV } from '@/lib/export/text-format'
import type { ShoppingListItemData } from '@/app/(dashboard)/shopping-lists/actions'

type ExportActionsProps = {
  listName: string
  supermarketName: string | null
  createdAt: string
  items: ShoppingListItemData[]
}

export function ExportActions({
  listName,
  supermarketName,
  createdAt,
  items,
}: ExportActionsProps) {
  const [hideOwned, setHideOwned] = useState(false)
  const [showPrices, setShowPrices] = useState(false)

  const opts = { hideOwned, showPrices }

  const input = { name: listName, supermarketName, createdAt, items, options: opts }

  async function handleCopy() {
    const text = formatText(input)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
  }

  async function handleShare() {
    const text = formatText(input)
    if (navigator.share) {
      try {
        await navigator.share({
          title: listName,
          text,
        })
      } catch {
        // user cancelled
      }
    } else {
      await handleCopy()
    }
  }

  function handlePrint() {
    window.print()
  }

  function handleDownloadCSV() {
    const csv = formatCSV(input)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${listName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDownloadText() {
    const text = formatText(input)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${listName.replace(/[^a-zA-Z0-9]/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-3 text-xs text-muted-foreground mr-2">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Switch
            checked={hideOwned}
            onCheckedChange={setHideOwned}
            className="h-4 w-7"
            aria-label="Ocultar 'ya lo tengo'"
          />
          <span>Ocultar ya lo tengo</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Switch
            checked={showPrices}
            onCheckedChange={setShowPrices}
            className="h-4 w-7"
            aria-label="Mostrar precios"
          />
          <span>Precios</span>
        </label>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1.5" />
            Exportar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Exportar lista</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopy}>
            <ClipboardCopy className="h-4 w-4 mr-2" />
            Copiar al portapapeles
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir / PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadCSV}>
            <FileText className="h-4 w-4 mr-2" />
            Descargar CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadText}>
            <FileText className="h-4 w-4 mr-2" />
            Descargar TXT
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
