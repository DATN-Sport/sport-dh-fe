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
    const day = today.getDay() // 0 = Chủ Nhật, 1 = Thứ 2, ..., 6 = Thứ 7
    // Tính toán để tuần bắt đầu từ Thứ 2 (Monday = 1)
    // Nếu là Chủ Nhật (0), trừ 6 ngày để về Thứ 2 tuần trước
    // Nếu là Thứ 2-7 (1-6), trừ (day - 1) ngày để về Thứ 2 của tuần hiện tại
    const diff = day === 0 ? -6 : -(day - 1)
    const weekStartDate = new Date(today)
    weekStartDate.setDate(today.getDate() + diff)
    weekStartDate.setHours(0, 0, 0, 0)
    return weekStartDate
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

  // Vì weekStart là Thứ 2, weekDays đã đúng thứ tự: [Thứ 2, Thứ 3, ..., Chủ Nhật]
  // Map day index: Thứ 2 (1) -> 0, Thứ 3 (2) -> 1, ..., Chủ Nhật (0) -> 6
  const getDayIndex = (day: number) => day === 0 ? 6 : day - 1
  const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

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
        {weekDays.map((date, index) => {
          const dayIndex = getDayIndex(date.getDay())
          return (
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
              <span className="text-xs font-medium">{dayNames[dayIndex]}</span>
              <span className="text-lg font-bold">{date.getDate()}</span>
              {isToday(date) && <span className="text-xs text-muted-foreground">Hôm nay</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
