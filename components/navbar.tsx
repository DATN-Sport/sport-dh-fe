"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Activity, LogOut, User, Settings } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Sport DH</span>
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <>
              {user.role === "ADMIN" && (
                <Link href="/admin">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Quản trị</span>
                  </Button>
                </Link>
              )}
              {user.role === "OWNER" && (
                <Link href="/owner">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Quản lý</span>
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.username}</span>
                    {user.role === "ADMIN" && (
                      <Badge variant="default" className="ml-1 hidden md:inline-flex">
                        Admin
                      </Badge>
                    )}
                    {user.role === "OWNER" && (
                      <Badge variant="secondary" className="ml-1 hidden md:inline-flex">
                        Owner
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex w-full cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Thông tin cá nhân
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex w-full cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Quản trị hệ thống
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === "OWNER" && (
                    <DropdownMenuItem asChild>
                      <Link href="/owner" className="flex w-full cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Quản lý trung tâm
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
