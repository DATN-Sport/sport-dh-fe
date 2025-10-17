"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DateSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  disabledDates?: Date[]
}

export function DateSelector({ selectedDate, onDateChange, disabledDates = [] }: DateSelectorProps) {
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day
    return new Date(today.setDate(diff))
  })

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    return date
  })

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // reset giờ để so sánh chính xác
  
    const target = new Date(date)
    target.setHours(0, 0, 0, 0)
  
    // disable nếu trước hôm nay
    if (target < today) return true
  
    // hoặc nằm trong danh sách disabledDates
    return disabledDates.some(
      (d) =>
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
    )
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const handlePrevWeek = () => {
    const newStart = new Date(weekStart)
    newStart.setDate(newStart.getDate() - 7)
    setWeekStart(newStart)
  }

  const handleNextWeek = () => {
    const newStart = new Date(weekStart)
    newStart.setDate(newStart.getDate() + 7)
    setWeekStart(newStart)
  }

  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Chọn ngày</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {weekDays.map((date, index) => (
          <button
            key={index}
            onClick={() => onDateChange(date)}
            disabled={isDateDisabled(date)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-lg px-4 py-3 transition-all",
              "min-w-[80px] border-2",
              isSelected(date)
                ? "border-primary bg-primary/10 text-primary"
                : isToday(date)
                  ? "border-secondary bg-secondary/10 text-secondary"
                  : "border-border hover:border-primary/50",
              isDateDisabled(date) && "cursor-not-allowed opacity-50",
            )}
          >
            <span className="text-xs font-medium">{dayNames[date.getDay()]}</span>
            <span className="text-lg font-bold">{date.getDate()}</span>
            {isToday(date) && <span className="text-xs text-muted-foreground">Hôm nay</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
