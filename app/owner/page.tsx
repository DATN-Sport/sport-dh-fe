"use client"

import { OwnerRoute } from "@/components/owner-route"
import { OwnerSidebar } from "@/components/owner-sidebar"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, MapPin, Activity } from "lucide-react"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

export default function OwnerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    sportCenters: 0,
    sportFields: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return

      try {
        const centers = await apiClient.getAllSportCenters({ owner: user.id })

        const fieldsPromises = centers.map((center) => apiClient.getAllSportFields({ sport_center: center.id }))
        const fieldsArrays = await Promise.all(fieldsPromises)
        const totalFields = fieldsArrays.reduce((sum, fields) => sum + fields.length, 0)

        setStats({
          sportCenters: centers.length,
          sportFields: totalFields,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      }
    }
    fetchStats()
  }, [user])

  return (
    <OwnerRoute>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1">
          <OwnerSidebar />
          <main className="flex-1 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Tổng quan</h1>
              <p className="text-muted-foreground">Quản lý trung tâm và sân thể thao của bạn</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Trung tâm thể thao</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.sportCenters}</div>
                  <p className="text-xs text-muted-foreground">Trung tâm của bạn</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Sân thể thao</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.sportFields}</div>
                  <p className="text-xs text-muted-foreground">Tổng số sân</p>
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
    </OwnerRoute>
  )
}
