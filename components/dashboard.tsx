"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Camera, Users, Menu } from "lucide-react"
import CameraGrid from "@/components/camera-grid"
import AlertsList from "@/components/alerts-list"
import CitizenSubmissionForm from "@/components/citizen-submission-form"
import { useAlerts } from "@/hooks/use-alerts"
import { useCameras } from "@/hooks/user-cameras"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { AuthStatus } from "./auth-status"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Dashboard() {
  const { alerts, loading: alertsLoading, refreshAlerts } = useAlerts();
  const { cameras, loading: camerasLoading } = useCameras();
  const [activeTab, setActiveTab] = useState("submissions")
  const { data: session } = useSession();

  // Determine if the user is an admin or moderator
  const isAdminOrModerator = session?.user?.role === 'admin' || session?.user?.role === 'moderator';

  // Set default tab based on user role
  useEffect(() => {
    if (isAdminOrModerator) {
      setActiveTab("monitoring")
    } else {
      setActiveTab("submissions")
    }
  }, [session?.user?.role, isAdminOrModerator])

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

      // Refresh alerts instead of reloading page
      await refreshAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4">
      {/* Mobile Header */}
      <header className="flex flex-col gap-4 mb-6 sm:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold leading-tight">Система мониторинга города</h1>

          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Меню</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 py-4">
                <AuthStatus />
                {isAdminOrModerator && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Администрирование</h3>
                    <Badge variant="outline" className="flex items-center gap-1 w-full justify-center py-2">
                      <Bell className="h-3.5 w-3.5" />
                      <span>{alerts.filter((a) => a.status === "new").length} Новых оповещений</span>
                    </Badge>
                    <Button className="w-full">
                      <Bell className="mr-2 h-4 w-4" />
                      Управление оповещениями
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <p className="text-sm text-muted-foreground">Мониторинг общественной собственности и зеленых зон</p>
      </header>

      {/* Desktop Header */}
      <header className="mb-6 hidden sm:flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Система мониторинга города</h1>
          <p className="text-muted-foreground">Мониторинг общественной собственности и зеленых зон</p>
        </div>
        <div className="flex items-center gap-4">
          {isAdminOrModerator && (
            <>
              <Badge variant="outline" className="hidden md:flex items-center gap-1">
                <Bell className="h-3.5 w-3.5" />
                <span>{alerts.filter((a) => a.status === "new").length} Новых оповещений</span>
              </Badge>
              <Button className="hidden md:flex">
                <Bell className="mr-2 h-4 w-4" />
                Управление оповещениями
              </Button>
            </>
          )}
          <AuthStatus />
        </div>
      </header>

      <Tabs value={activeTab} className="space-y-4" onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2">
          <TabsList className={`grid w-full min-w-max ${isAdminOrModerator ? 'grid-cols-3' : 'grid-cols-1'}`}>
            {isAdminOrModerator && (
              <>
                <TabsTrigger value="monitoring" className="whitespace-nowrap">
                  <Camera className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Мониторинг в реальном времени</span>
                  <span className="sm:hidden">Мониторинг</span>
                </TabsTrigger>
                <TabsTrigger value="alerts" className="whitespace-nowrap">
                  <Bell className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Оповещения и нарушения</span>
                  <span className="sm:hidden">Оповещения</span>
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="submissions" className="whitespace-nowrap">
              <Users className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Обращения граждан</span>
              <span className="sm:hidden">Обращения</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {isAdminOrModerator && (
          <>
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

                <Card className="md:block">
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
                <CardContent className="overflow-hidden">
                  <div className="overflow-x-auto -mx-2 px-2">
                    <AlertsList alerts={alerts} showFilters />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Оповещения и нарушения</CardTitle>
                  <CardDescription>Полный список обнаруженных нарушений с ссылками на законы</CardDescription>
                </CardHeader>
                <CardContent className="overflow-hidden">
                  <div className="overflow-x-auto -mx-2 px-2">
                    <AlertsList alerts={alerts} showFilters />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}

        <TabsContent value="submissions" className="space-y-4">
          {!session ? (
            <Card>
              <CardHeader>
                <CardTitle>Необходима авторизация</CardTitle>
                <CardDescription>
                  Для отправки обращения, пожалуйста, войдите в систему или зарегистрируйтесь
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/login">Войти</Link>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/register">Зарегистрироваться</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
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
          )}
          {isAdminOrModerator && (
            <Card>
              <CardHeader>
                <CardTitle>Недавние обращения граждан</CardTitle>
                <CardDescription>Сообщения, отправленные гражданами</CardDescription>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <div className="overflow-x-auto -mx-2 px-2">
                  <AlertsList
                    alerts={alerts.filter((alert) => alert.source === "Гражданин")}
                    showFilters
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}