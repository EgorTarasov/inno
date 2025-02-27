import type { Alert, CameraStream } from "./types"

// Камеры с видеопотоками
export const mockCameraStreams: CameraStream[] = [
  {
    id: "cam-001",
    name: "Камера на ул. Инноваций",
    location: "Иннополис, ул. Инноваций, Северный вход",
    streamUrl: "https://cdn.universmotri.ru/ipcam/cam36.stream_1080p/playlist.m3u8",
    status: "normal",
    lastUpdated: new Date().toISOString(),
  },
]

// Оповещения
export const mockAlerts: Alert[] = [
  {
    id: "alert-001",
    title: "Несанкционированная утилизация отходов",
    description: "Обнаружено лицо, выбрасывающее мусор в недопустимом месте",
    location: "Иннополис, Центральная площадь, Северный угол",
    timestamp: new Date().toISOString(),
    status: "новый",
    priority: "высокий",
    lawReference: "Городской кодекс §23-7: Незаконное захоронение отходов",
    source: "Камера",
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "alert-002",
    title: "Граффити на общественной собственности",
    description: "Обнаружено граффити на монументе",
    location: "Иннополис, Центральный парк, Западный вход",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 час назад
    status: "в процессе",
    priority: "средний",
    lawReference: "Городской кодекс §18-2: Порча общественной собственности",
    source: "Гражданин",
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "alert-003",
    title: "Поврежденная скамейка в парке",
    description: "Скамейка в парке повреждена преднамеренно",
    location: "Иннополис, Парк у реки, Южная зона",
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 часа назад
    status: "решено",
    priority: "низкий",
    lawReference: "Городской кодекс §21-4: Порча общественных объектов",
    source: "Камера",
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "alert-004",
    title: "Несанкционированный автомобиль в зеленой зоне",
    description: "Автомобиль припаркован в зоне, предназначенной для зеленых насаждений",
    location: "Иннополис, Ботанический сад, Восточный вход",
    timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 часа назад
    status: "новый",
    priority: "высокий",
    lawReference: "Городской кодекс §15-9: Охраняемые зеленые зоны",
    source: "Камера",
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "alert-005",
    title: "Повреждение дерева",
    description: "Зафиксировано лицо, обрезающее ветви охраняемого дерева",
    location: "Иннополис, Парк памяти, Центральная зона",
    timestamp: new Date(Date.now() - 14400000).toISOString(), // 4 часа назад
    status: "в процессе",
    priority: "средний",
    lawReference: "Городской кодекс §22-3: Охрана городского леса",
    source: "Гражданин",
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "alert-006",
    title: "Несанкционированное мероприятие",
    description: "Крупное собрание без соответствующих разрешений в общественном месте",
    location: "Иннополис, Набережная Иннополиса",
    timestamp: new Date(Date.now() - 18000000).toISOString(), // 5 часов назад
    status: "новый",
    priority: "средний",
    lawReference: "Городской кодекс §17-1: Разрешения на публичные мероприятия",
    source: "Камера",
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "alert-007",
    title: "Вандализм фонтана",
    description: "Обнаружено преднамеренное повреждение общественного фонтана",
    location: "Иннополис, Детский парк, ул. Радости",
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 день назад
    status: "решено",
    priority: "низкий",
    lawReference: "Городской кодекс §21-4: Порча общественных объектов",
    source: "Гражданин",
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
]