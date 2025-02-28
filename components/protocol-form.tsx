"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Protocol, Person, LegalEntity } from "@/lib/types"
import { Plus, Trash2 } from "lucide-react"

// Define the form schema using zod
const officialSchema = z.object({
    fullName: z.string().min(5, "ФИО должно содержать не менее 5 символов"),
    position: z.string().min(3, "Должность должна содержать не менее 3 символов"),
    organization: z.string().min(3, "Организация должна содержать не менее 3 символов"),
})

const personSchema = z.object({
    fullName: z.string().min(5, "ФИО должно содержать не менее 5 символов"),
    address: z.string().min(5, "Адрес должен содержать не менее 5 символов"),
    documentType: z.enum(["passport", "driver_license", "other"]),
    documentNumber: z.string().min(4, "Номер документа должен содержать не менее 4 символов"),
})

const legalEntitySchema = z.object({
    name: z.string().min(3, "Название должно содержать не менее 3 символов"),
    address: z.string().min(5, "Адрес должен содержать не менее 5 символов"),
    inn: z.string().min(10, "ИНН должен содержать не менее 10 символов"),
    director: z.string().min(5, "ФИО директора должно содержать не менее 5 символов"),
})

const violationSchema = z.object({
    date: z.string().min(1, "Выберите дату"),
    time: z.string().min(1, "Выберите время"),
    location: z.string().min(5, "Место должно содержать не менее 5 символов"),
    article: z.string().min(3, "Статья должна содержать не менее 3 символов"),
    description: z.string().min(10, "Описание должно содержать не менее 10 символов"),
    circumstances: z.string().min(10, "Обстоятельства должны содержать не менее 10 символов"),
    evidence: z.array(z.string()),
})

const witnessSchema = z.object({
    fullName: z.string().min(5, "ФИО должно содержать не менее 5 символов"),
    address: z.string().min(5, "Адрес должен содержать не менее 5 символов"),
    testimony: z.string().min(10, "Показания должны содержать не менее 10 символов"),
})

const protocolSchema = z.object({
    id: z.string(),
    dateCreated: z.string(),
    placeCreated: z.string().min(5, "Место составления должно содержать не менее 5 символов"),
    official: officialSchema,
    offenderType: z.enum(["person", "legalEntity"]),
    personOffender: personSchema.optional(),
    legalEntityOffender: legalEntitySchema.optional(),
    violation: violationSchema,
    witnesses: z.array(witnessSchema),
    offenderExplanation: z.string().optional(),
    signatures: z.object({
        official: z.boolean(),
        offender: z.boolean().optional(),
        witnesses: z.array(z.boolean()).optional(),
    }),
    notes: z.string().optional(),
})

interface ProtocolFormProps {
    protocol: Protocol
    onChange: (protocol: Protocol) => void
    onPreview: () => void
}

export default function ProtocolForm({ protocol, onChange, onPreview }: ProtocolFormProps) {
    const [offenderType, setOffenderType] = useState<"person" | "legalEntity">(
        "fullName" in protocol.offender ? "person" : "legalEntity",
    )
    const [evidenceInput, setEvidenceInput] = useState("")

    // Initialize form with protocol data
    const form = useForm<z.infer<typeof protocolSchema>>({
        resolver: zodResolver(protocolSchema),
        defaultValues: {
            id: protocol.id,
            dateCreated: protocol.dateCreated,
            placeCreated: protocol.placeCreated,
            official: protocol.official,
            offenderType: "fullName" in protocol.offender ? "person" : "legalEntity",
            personOffender: "fullName" in protocol.offender ? protocol.offender : undefined,
            legalEntityOffender: "name" in protocol.offender ? protocol.offender : undefined,
            violation: protocol.violation,
            witnesses: protocol.witnesses || [],
            offenderExplanation: protocol.offenderExplanation || "",
            signatures: protocol.signatures,
            notes: protocol.notes || "",
        },
    })

    // Update protocol when form values change
    const updateProtocol = (values: z.infer<typeof protocolSchema>) => {
        const updatedProtocol: Protocol = {
            id: values.id,
            dateCreated: values.dateCreated,
            placeCreated: values.placeCreated,
            official: values.official,
            offender:
                values.offenderType === "person"
                    ? (values.personOffender as Person)
                    : (values.legalEntityOffender as LegalEntity),
            violation: values.violation,
            witnesses: values.witnesses,
            offenderExplanation: values.offenderExplanation,
            signatures: values.signatures,
            notes: values.notes,
        }
        onChange(updatedProtocol)
    }

    // Handle form submission
    const onSubmit = (values: z.infer<typeof protocolSchema>) => {
        updateProtocol(values)
        onPreview()
    }

    // Add evidence item
    const addEvidence = () => {
        if (evidenceInput.trim()) {
            const currentEvidence = form.getValues("violation.evidence") || []
            form.setValue("violation.evidence", [...currentEvidence, evidenceInput.trim()])
            setEvidenceInput("")

            // Update protocol
            const values = form.getValues()
            updateProtocol(values)
        }
    }

    // Remove evidence item
    const removeEvidence = (index: number) => {
        const currentEvidence = form.getValues("violation.evidence") || []
        const newEvidence = currentEvidence.filter((_, i) => i !== index)
        form.setValue("violation.evidence", newEvidence)

        // Update protocol
        const values = form.getValues()
        updateProtocol(values)
    }

    // Add witness
    const addWitness = () => {
        const currentWitnesses = form.getValues("witnesses") || []
        form.setValue("witnesses", [...currentWitnesses, { fullName: "", address: "", testimony: "" }])

        // Update protocol
        const values = form.getValues()
        updateProtocol(values)
    }

    // Remove witness
    const removeWitness = (index: number) => {
        const currentWitnesses = form.getValues("witnesses") || []
        const newWitnesses = currentWitnesses.filter((_, i) => i !== index)
        form.setValue("witnesses", newWitnesses)

        // Update protocol
        const values = form.getValues()
        updateProtocol(values)
    }

    useEffect(() => {
        // Reset form with new values from the protocol prop
        form.reset({
            id: protocol.id,
            dateCreated: protocol.dateCreated,
            placeCreated: protocol.placeCreated,
            official: protocol.official,
            offenderType: "fullName" in protocol.offender ? "person" : "legalEntity",
            personOffender: "fullName" in protocol.offender ? protocol.offender : undefined,
            legalEntityOffender: "name" in protocol.offender ? protocol.offender : undefined,
            violation: protocol.violation,
            witnesses: protocol.witnesses || [],
            offenderExplanation: protocol.offenderExplanation || "",
            signatures: protocol.signatures,
            notes: protocol.notes || "",
        });

        // Also update the offender type state if needed
        setOffenderType("fullName" in protocol.offender ? "person" : "legalEntity");
    }, [protocol, form.reset]);

    // Update form when offender type changes
    useEffect(() => {
        form.setValue("offenderType", offenderType)
    }, [offenderType, form])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Protocol Information */}
                <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                        control={form.control}
                        name="id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Номер протокола</FormLabel>
                                <FormControl>
                                    <Input {...field} readOnly />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="dateCreated"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Дата составления</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="placeCreated"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Место составления</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="г. Москва, ул. Ленина, д. 1" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Official Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Должностное лицо</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        <FormField
                            control={form.control}
                            name="official.fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ФИО должностного лица</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Иванов Иван Иванович" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="official.position"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Должность</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Инспектор" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="official.organization"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Организация</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Отдел экологического контроля" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Offender Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Нарушитель</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="mb-4">
                            <FormLabel>Тип нарушителя</FormLabel>
                            <RadioGroup
                                value={offenderType}
                                onValueChange={(value) => setOffenderType(value as "person" | "legalEntity")}
                                className="flex gap-4 mt-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="person" id="person" />
                                    <label htmlFor="person">Физическое лицо</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="legalEntity" id="legalEntity" />
                                    <label htmlFor="legalEntity">Юридическое лицо</label>
                                </div>
                            </RadioGroup>
                        </div>

                        {offenderType === "person" ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="personOffender.fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ФИО</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Петров Петр Петрович" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="personOffender.address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Адрес</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="г. Москва, ул. Пушкина, д. 10, кв. 5" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="personOffender.documentType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Тип документа</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите тип документа" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="passport">Паспорт</SelectItem>
                                                    <SelectItem value="driver_license">Водительское удостоверение</SelectItem>
                                                    <SelectItem value="other">Иной документ</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="personOffender.documentNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Номер документа</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="1234 567890" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="legalEntityOffender.name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Наименование организации</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="ООО 'Ромашка'" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="legalEntityOffender.address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Юридический адрес</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="г. Москва, ул. Ленина, д. 15, офис 301" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="legalEntityOffender.inn"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ИНН</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="1234567890" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="legalEntityOffender.director"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ФИО руководителя</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Сидоров Сидор Сидорович" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Violation Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Информация о правонарушении</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="violation.date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Дата нарушения</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="violation.time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Время нарушения</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="violation.location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Место нарушения</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="г. Москва, Парк Горького" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="violation.article"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Статья закона</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="ст. 8.2 КоАП РФ" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="violation.description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Описание правонарушения</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Краткое описание совершенного правонарушения"
                                            className="min-h-[80px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="violation.circumstances"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Обстоятельства правонарушения</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Подробное описание обстоятельств правонарушения"
                                            className="min-h-[120px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div>
                            <FormLabel>Доказательства</FormLabel>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    value={evidenceInput}
                                    onChange={(e) => setEvidenceInput(e.target.value)}
                                    placeholder="Фотография, видеозапись, показания свидетелей и т.д."
                                />
                                <Button type="button" onClick={addEvidence} size="sm">
                                    <Plus className="h-4 w-4 mr-1" /> Добавить
                                </Button>
                            </div>
                            <FormMessage />

                            <div className="mt-2 space-y-2">
                                {form.watch("violation.evidence")?.map((evidence, index) => (
                                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                                        <span>{evidence}</span>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeEvidence(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Witnesses */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Свидетели</CardTitle>
                        <Button type="button" onClick={addWitness} size="sm">
                            <Plus className="h-4 w-4 mr-1" /> Добавить свидетеля
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {form.watch("witnesses")?.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">Нет добавленных свидетелей</div>
                        ) : (
                            <div className="space-y-6">
                                {form.watch("witnesses")?.map((_, index) => (
                                    <div key={index} className="border rounded-lg p-4 relative">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-2 right-2"
                                            onClick={() => removeWitness(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                        <h3 className="font-medium mb-4">Свидетель #{index + 1}</h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name={`witnesses.${index}.fullName`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>ФИО свидетеля</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Сидоров Сидор Сидорович" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`witnesses.${index}.address`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Адрес свидетеля</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="г. Москва, ул. Ленина, д. 10, кв. 5" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`witnesses.${index}.testimony`}
                                                render={({ field }) => (
                                                    <FormItem className="md:col-span-2">
                                                        <FormLabel>Показания свидетеля</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                {...field}
                                                                placeholder="Показания свидетеля о правонарушении"
                                                                className="min-h-[80px]"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Дополнительная информация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="offenderExplanation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Объяснения нарушителя</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Объяснения лица, в отношении которого возбуждено дело"
                                            className="min-h-[100px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Примечания</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Дополнительные примечания к протоколу" className="min-h-[80px]" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <FormLabel>Подписи</FormLabel>
                            <div className="space-y-2">
                                <FormField
                                    control={form.control}
                                    name="signatures.official"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Подпись должностного лица</FormLabel>
                                                <FormDescription>Протокол подписан должностным лицом</FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="signatures.offender"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Подпись нарушителя</FormLabel>
                                                <FormDescription>Протокол подписан лицом, в отношении которого возбуждено дело</FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline">
                        Отмена
                    </Button>
                    <Button type="submit">Предпросмотр протокола</Button>
                </div>
            </form>
        </Form>
    )
}

