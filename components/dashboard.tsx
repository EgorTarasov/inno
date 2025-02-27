"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Camera, Users } from "lucide-react"
import CameraGrid from "@/components/camera-grid"
import AlertsList from "@/components/alerts-list"
import CitizenSubmissionForm from "@/components/citizen-submission-form"
import { useAlerts } from "@/hooks/use-alerts"
import { useCameras } from "@/hooks/user-cameras"


export default function Dashboard() {
  const { alerts, loading: alertsLoading } = useAlerts();
  const { cameras, loading: camerasLoading } = useCameras();
  const [activeTab, setActiveTab] = useState("monitoring")

  const handleNewSubmission = async (submission: any) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: submission.title,
          description: submission.description,
          location: submission.location,
          status: "new",
          priority: submission.priority,
          lawReference: "На рассмотрении",
          source: "Гражданин",
          imageUrl: submission.imageUrl || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create alert');
      }

      // Reload page or refetch alerts
      window.location.reload();
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Система мониторинга города</h1>
          <p className="text-muted-foreground">Мониторинг общественной собственности и зеленых зон</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Bell className="h-3.5 w-3.5" />
            <span>{alerts.filter((a) => a.status === "new").length} Новых оповещений</span>
          </Badge>
          <Button>
            <Bell className="mr-2 h-4 w-4" />
            Управление оповещениями
          </Button>
        </div>
      </header>

      <Tabs defaultValue="monitoring" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monitoring">
            <Camera className="mr-2 h-4 w-4" />
            Мониторинг в реальном времени
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell className="mr-2 h-4 w-4" />
            Оповещения и нарушения
          </TabsTrigger>
          <TabsTrigger value="submissions">
            <Users className="mr-2 h-4 w-4" />
            Обращения граждан
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Камеры наблюдения</CardTitle>
                <CardDescription>Мониторинг общественных мест и зеленых зон</CardDescription>
              </CardHeader>
              <CardContent>
                <CameraGrid cameraStreams={cameras} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Последние оповещения</CardTitle>
                <CardDescription>Недавно обнаруженные нарушения</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertsList alerts={alerts.slice(0, 5)} compact />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Все оповещения</CardTitle>
              <CardDescription>Полный список обнаруженных нарушений с ссылками на законы</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertsList alerts={alerts} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Оповещения и нарушения</CardTitle>
              <CardDescription>Полный список обнаруженных нарушений с ссылками на законы</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertsList alerts={alerts} showFilters />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Отправить сообщение о нарушении</CardTitle>
              <CardDescription>
                Помогите нам сохранить наш город чистым и безопасным, сообщая о нарушениях
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CitizenSubmissionForm onSubmit={handleNewSubmission} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Недавние обращения граждан</CardTitle>
              <CardDescription>Сообщения, отправленные гражданами</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertsList alerts={alerts.filter((alert) => alert.source === "Гражданин")} showFilters />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

