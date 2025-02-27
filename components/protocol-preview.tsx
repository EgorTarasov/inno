"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Protocol } from "@/lib/types"
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"
import { Download, Printer } from "lucide-react"

// Register fonts
Font.register({
    family: "Roboto",
    fonts: [
        { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular.ttf", fontWeight: 400 },
        { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold.ttf", fontWeight: 700 },
    ],
})

// Create styles
const styles = StyleSheet.create({
    page: {
        fontFamily: "Roboto",
        fontSize: 12,
        padding: 30,
    },
    title: {
        fontSize: 18,
        fontWeight: 700,
        textAlign: "center",
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: 700,
        marginTop: 15,
        marginBottom: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    headerItem: {
        width: "30%",
    },
    headerLabel: {
        fontSize: 10,
        marginBottom: 5,
    },
    headerValue: {
        fontSize: 12,
    },
    section: {
        marginBottom: 15,
    },
    row: {
        flexDirection: "row",
        marginBottom: 5,
    },
    label: {
        width: "30%",
        fontWeight: 700,
    },
    value: {
        width: "70%",
    },
    text: {
        marginBottom: 10,
    },
    list: {
        marginLeft: 20,
    },
    listItem: {
        marginBottom: 5,
    },
    signatures: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 50,
    },
    signature: {
        width: "45%",
    },
    signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        marginTop: 30,
        marginBottom: 5,
    },
    signatureLabel: {
        fontSize: 10,
        textAlign: "center",
    },
})

// PDF Document component
const ProtocolDocument = ({ protocol }: { protocol: Protocol }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("ru-RU")
    }

    const getOffenderInfo = () => {
        if ("fullName" in protocol.offender) {
            return (
                <>
                    <View style={styles.row}>
                        <Text style={styles.label}>ФИО:</Text>
                        <Text style={styles.value}>{protocol.offender.fullName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Адрес:</Text>
                        <Text style={styles.value}>{protocol.offender.address}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Документ:</Text>
                        <Text style={styles.value}>
                            {protocol.offender.documentType === "passport"
                                ? "Паспорт"
                                : protocol.offender.documentType === "driver_license"
                                    ? "Водительское удостоверение"
                                    : "Иной документ"}{" "}
                            {protocol.offender.documentNumber}
                        </Text>
                    </View>
                </>
            )
        } else {
            return (
                <>
                    <View style={styles.row}>
                        <Text style={styles.label}>Организация:</Text>
                        <Text style={styles.value}>{protocol.offender.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Адрес:</Text>
                        <Text style={styles.value}>{protocol.offender.address}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>ИНН:</Text>
                        <Text style={styles.value}>{protocol.offender.inn}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Руководитель:</Text>
                        <Text style={styles.value}>{protocol.offender.director}</Text>
                    </View>
                </>
            )
        }
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>ПРОТОКОЛ № {protocol.id}</Text>
                <Text style={styles.title}>об административном правонарушении</Text>

                <View style={styles.header}>
                    <View style={styles.headerItem}>
                        <Text style={styles.headerLabel}>Дата составления</Text>
                        <Text style={styles.headerValue}>{formatDate(protocol.dateCreated)}</Text>
                    </View>
                    <View style={styles.headerItem}>
                        <Text style={styles.headerLabel}>Место составления</Text>
                        <Text style={styles.headerValue}>{protocol.placeCreated}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>1. Должностное лицо, составившее протокол</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>ФИО:</Text>
                        <Text style={styles.value}>{protocol.official.fullName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Должность:</Text>
                        <Text style={styles.value}>{protocol.official.position}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Организация:</Text>
                        <Text style={styles.value}>{protocol.official.organization}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>
                        2. Сведения о лице, в отношении которого возбуждено дело об административном правонарушении
                    </Text>
                    {getOffenderInfo()}
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>3. Сведения о правонарушении</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Дата:</Text>
                        <Text style={styles.value}>{formatDate(protocol.violation.date)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Время:</Text>
                        <Text style={styles.value}>{protocol.violation.time}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Место:</Text>
                        <Text style={styles.value}>{protocol.violation.location}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Статья закона:</Text>
                        <Text style={styles.value}>{protocol.violation.article}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Описание:</Text>
                        <Text style={styles.value}>{protocol.violation.description}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Обстоятельства:</Text>
                        <Text style={styles.value}>{protocol.violation.circumstances}</Text>
                    </View>
                </View>

                {protocol.violation.evidence && protocol.violation.evidence.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.subtitle}>4. Доказательства</Text>
                        <View style={styles.list}>
                            {protocol.violation.evidence.map((evidence, index) => (
                                <View key={index} style={styles.listItem}>
                                    <Text>• {evidence}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {protocol.witnesses && protocol.witnesses.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.subtitle}>5. Свидетели</Text>
                        {protocol.witnesses.map((witness, index) => (
                            <View key={index} style={{ marginBottom: 10 }}>
                                <Text style={{ fontWeight: 700 }}>Свидетель #{index + 1}</Text>
                                <View style={styles.row}>
                                    <Text style={styles.label}>ФИО:</Text>
                                    <Text style={styles.value}>{witness.fullName}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Адрес:</Text>
                                    <Text style={styles.value}>{witness.address}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Показания:</Text>
                                    <Text style={styles.value}>{witness.testimony}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {protocol.offenderExplanation && (
                    <View style={styles.section}>
                        <Text style={styles.subtitle}>6. Объяснения нарушителя</Text>
                        <Text style={styles.text}>{protocol.offenderExplanation}</Text>
                    </View>
                )}

                {protocol.notes && (
                    <View style={styles.section}>
                        <Text style={styles.subtitle}>7. Примечания</Text>
                        <Text style={styles.text}>{protocol.notes}</Text>
                    </View>
                )}

                <View style={styles.signatures}>
                    <View style={styles.signature}>
                        <Text>Должностное лицо:</Text>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>(подпись)</Text>
                    </View>
                    <View style={styles.signature}>
                        <Text>Лицо, в отношении которого составлен протокол:</Text>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>(подпись)</Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
}

interface ProtocolPreviewProps {
    protocol: Protocol
}

export default function ProtocolPreview({ protocol }: ProtocolPreviewProps) {
    const previewRef = useRef<HTMLDivElement>(null)

    const handlePrint = () => {
        const printWindow = window.open("", "_blank")
        if (printWindow && previewRef.current) {
            printWindow.document.write(`
        <html>
          <head>
            <title>Протокол № ${protocol.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .title { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px; }
              .section { margin-bottom: 15px; }
              .subtitle { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
              .row { display: flex; margin-bottom: 5px; }
              .label { width: 30%; font-weight: bold; }
              .value { width: 70%; }
              .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
              .signature { width: 45%; }
              .signature-line { border-bottom: 1px solid black; margin-top: 30px; margin-bottom: 5px; }
              .signature-label { font-size: 10px; text-align: center; }
            </style>
          </head>
          <body>
            ${previewRef.current.innerHTML}
          </body>
        </html>
      `)
            printWindow.document.close()
            printWindow.print()
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("ru-RU")
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" /> Печать
                </Button>
                <PDFDownloadLink document={<ProtocolDocument protocol={protocol} />} fileName={`protocol-${protocol.id}.pdf`}>
                    {({ loading }) => (
                        <Button disabled={loading}>
                            <Download className="mr-2 h-4 w-4" /> Скачать PDF
                        </Button>
                    )}
                </PDFDownloadLink>
            </div>

            <Card className="p-6 border">
                <div ref={previewRef} className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-xl font-bold">ПРОТОКОЛ № {protocol.id}</h2>
                        <h3 className="text-xl font-bold">об административном правонарушении</h3>
                    </div>

                    <div className="flex justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Дата составления</p>
                            <p>{formatDate(protocol.dateCreated)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Место составления</p>
                            <p>{protocol.placeCreated}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">1. Должностное лицо, составившее протокол</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="font-medium">ФИО:</p>
                                <p>{protocol.official.fullName}</p>
                            </div>
                            <div>
                                <p className="font-medium">Должность:</p>
                                <p>{protocol.official.position}</p>
                            </div>
                            <div>
                                <p className="font-medium">Организация:</p>
                                <p>{protocol.official.organization}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">
                            2. Сведения о лице, в отношении которого возбуждено дело об административном правонарушении
                        </h3>
                        {"fullName" in protocol.offender ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="font-medium">ФИО:</p>
                                    <p>{protocol.offender.fullName}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Адрес:</p>
                                    <p>{protocol.offender.address}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Документ:</p>
                                    <p>
                                        {protocol.offender.documentType === "passport"
                                            ? "Паспорт"
                                            : protocol.offender.documentType === "driver_license"
                                                ? "Водительское удостоверение"
                                                : "Иной документ"}{" "}
                                        {protocol.offender.documentNumber}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="font-medium">Организация:</p>
                                    <p>{protocol.offender.name}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Адрес:</p>
                                    <p>{protocol.offender.address}</p>
                                </div>
                                <div>
                                    <p className="font-medium">ИНН:</p>
                                    <p>{protocol.offender.inn}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Руководитель:</p>
                                    <p>{protocol.offender.director}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">3. Сведения о правонарушении</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <p className="font-medium">Дата:</p>
                                <p>{formatDate(protocol.violation.date)}</p>
                            </div>
                            <div>
                                <p className="font-medium">Время:</p>
                                <p>{protocol.violation.time}</p>
                            </div>
                            <div>
                                <p className="font-medium">Место:</p>
                                <p>{protocol.violation.location}</p>
                            </div>
                        </div>
                        <div className="mb-4">
                            <p className="font-medium">Статья закона:</p>
                            <p>{protocol.violation.article}</p>
                        </div>
                        <div className="mb-4">
                            <p className="font-medium">Описание:</p>
                            <p>{protocol.violation.description}</p>
                        </div>
                        <div>
                            <p className="font-medium">Обстоятельства:</p>
                            <p>{protocol.violation.circumstances}</p>
                        </div>
                    </div>

                    {protocol.violation.evidence && protocol.violation.evidence.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">4. Доказательства</h3>
                            <ul className="list-disc pl-5">
                                {protocol.violation.evidence.map((evidence, index) => (
                                    <li key={index}>{evidence}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {protocol.witnesses && protocol.witnesses.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">5. Свидетели</h3>
                            <div className="space-y-4">
                                {protocol.witnesses.map((witness, index) => (
                                    <div key={index} className="border-l-2 pl-4">
                                        <p className="font-medium">Свидетель #{index + 1}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <div>
                                                <p className="font-medium">ФИО:</p>
                                                <p>{witness.fullName}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium">Адрес:</p>
                                                <p>{witness.address}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <p className="font-medium">Показания:</p>
                                            <p>{witness.testimony}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {protocol.offenderExplanation && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">6. Объяснения нарушителя</h3>
                            <p>{protocol.offenderExplanation}</p>
                        </div>
                    )}

                    {protocol.notes && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">7. Примечания</h3>
                            <p>{protocol.notes}</p>
                        </div>
                    )}

                    <div className="flex justify-between mt-10">
                        <div className="w-5/12">
                            <p>Должностное лицо:</p>
                            <div className="border-b border-black mt-8 mb-1"></div>
                            <p className="text-xs text-center">(подпись)</p>
                        </div>
                        <div className="w-5/12">
                            <p>Лицо, в отношении которого составлен протокол:</p>
                            <div className="border-b border-black mt-8 mb-1"></div>
                            <p className="text-xs text-center">(подпись)</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

