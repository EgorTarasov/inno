"use client"

import type React from "react"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Заголовок должен содержать не менее 5 символов.",
  }),
  description: z.string().min(10, {
    message: "Описание должно содержать не менее 10 символов.",
  }),
  location: z.string().min(5, {
    message: "Местоположение должно содержать не менее 5 символов.",
  }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Пожалуйста, выберите уровень приоритета.",
  }),
  imageUrl: z.string().optional(),
})

interface CitizenSubmissionFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void
}

export default function CitizenSubmissionForm({ onSubmit }: CitizenSubmissionFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      priority: "medium",
      imageUrl: "",
    },
  })

  function handleSubmit(values: z.infer<typeof formSchema>) {
    if (imagePreview) {
      values.imageUrl = imagePreview
    }
    onSubmit(values)
    form.reset()
    setImagePreview(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload this to a server
      // For demo purposes, we'll just create a local object URL
      const url = URL.createObjectURL(file)
      setImagePreview(url)
      form.setValue("imageUrl", url)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Заголовок</FormLabel>
                <FormControl>
                  <Input placeholder="Краткое описание нарушения" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Местоположение</FormLabel>
                <FormControl>
                  <Input placeholder="Адрес или описание области" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Подробное описание того, что вы наблюдали"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Приоритет</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите уровень приоритета" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Низкий - Незначительная проблема</SelectItem>
                    <SelectItem value="medium">Средний - Требует внимания</SelectItem>
                    <SelectItem value="high">Высокий - Срочная проблема</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Фотодоказательство (Необязательно)</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image-upload")?.click()}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Загрузить изображение
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    {imagePreview && (
                      <div className="relative h-10 w-10 overflow-hidden rounded-md">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Предпросмотр"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>Загрузите фото нарушения, чтобы помочь городским службам</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Отправить отчет
        </Button>
      </form>
    </Form>
  )
}

