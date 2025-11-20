"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Building2, MapPin } from "lucide-react"
import Image from "next/image"

const navItems = [
  {
    title: "Tổng quan",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Trung tâm thể thao",
    href: "/admin/sport-centers",
    icon: Building2,
  },
  {
    title: "Sân thể thao",
    href: "/admin/sport-fields",
    icon: MapPin,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="border-b p-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-web.png"
            alt="Sport DH Logo"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <div>
            <h2 className="text-lg font-bold">Sport DH</h2>
            <p className="text-xs text-muted-foreground">Quản trị</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
