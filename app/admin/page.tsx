"use client"

import { AdminRoute } from "@/components/admin-route"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, MapPin, Activity } from "lucide-react"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    sportCenters: 0,
    sportFields: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, centers, fields] = await Promise.all([
          apiClient.getAllUsers(),
          apiClient.getAllSportCenters(),
          apiClient.getAllSportFields(),
        ])
        setStats({
          users: users.length,
          sportCenters: centers.length,
          sportFields: fields.length,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      }
    }
    fetchStats()
  }, [])

  return (
    <AdminRoute>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Tổng quan</h1>
              <p className="text-muted-foreground">Thống kê và quản lý hệ thống</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users}</div>
                  <p className="text-xs text-muted-foreground">Người dùng đã đăng ký</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Trung tâm thể thao</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.sportCenters}</div>
                  <p className="text-xs text-muted-foreground">Trung tâm đang hoạt động</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Sân thể thao</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.sportFields}</div>
                  <p className="text-xs text-muted-foreground">Sân có sẵn</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Hoạt động</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">100%</div>
                  <p className="text-xs text-muted-foreground">Hệ thống hoạt động tốt</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AdminRoute>
  )
}
