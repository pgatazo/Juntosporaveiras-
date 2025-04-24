"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { InfoIcon, EuroIcon, BarChart3Icon } from "lucide-react"
import { dados } from "@/lib/data"
import Image from "next/image"

export default function Home() {
  const [tipo, setTipo] = useState("despesa")
  const [rubrica, setRubrica] = useState("")
  const [info, setInfo] = useState<any>({})

  useEffect(() => {
    if (dados[tipo]) {
      const keys = Object.keys(dados[tipo])
      if (keys.length > 0 && !rubrica) {
        setRubrica(keys[1]) // Skip the formula entry
      }
    }
  }, [tipo])

  useEffect(() => {
    if (tipo && rubrica && dados[tipo] && dados[tipo][rubrica]) {
      setInfo(dados[tipo][rubrica])
    }
  }, [tipo, rubrica])

  const getExecutionPercentage = () => {
    if (tipo === "despesa") {
      return Number.parseFloat(info["Período corrente %"] || "0")
    } else if (tipo === "receita") {
      return Number.parseFloat(info["Período corrente %"] || "0")
    } else if (tipo === "projetos" && rubrica !== "2") {
      return Number.parseFloat(info["Nível Execução Financeira Anual (%)"]?.replace(",", ".").replace(" %", "") || "0")
    }
    return 0
  }

  const renderRubricaOptions = () => {
    if (!dados[tipo]) return null

    return Object.entries(dados[tipo]).map(([key, val]: [string, any]) => {
      if (key === "formula de calculo" || key === "Fórmula de cálculo") return null
      const label =
        (val["Rubrica"] ? val["Rubrica"] + " - " : "") +
        (val["Designação Do Projeto"] || val["Descrição"] || val["Referência"] || key).split(",")[0]
      return (
        <SelectItem key={key} value={key}>
          {label}
        </SelectItem>
      )
    })
  }

  const renderTableContent = () => {
    if (!info) return null

    if (tipo === "tesouraria" && (rubrica.includes("Movimentos Tesouraria") || rubrica.includes("Total Período"))) {
      // Special case for these specific treasury items
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="p-2 text-left">Referência</th>
                <th className="p-2 text-right">Entrada</th>
                <th className="p-2 text-right">Saída</th>
                <th className="p-2 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border-b border-muted">
                  <strong>Total Período</strong>
                </td>
                <td className="p-2 border-b border-muted text-right">
                  <strong>554.462,04 €</strong>
                </td>
                <td className="p-2 border-b border-muted text-right">
                  <strong>483.790,49 €</strong>
                </td>
                <td className="p-2 border-b border-muted text-right">
                  <strong>70.671,55 €</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="p-2 text-left">Campo</th>
              <th className="p-2 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(info).map(([campo, valor]: [string, any], index) => {
              // Skip certain fields for cleaner display
              if (["Rubrica", "Objetivo", "Nº Do Projeto", "Referência"].includes(campo)) return null

              // Format percentage values
              let formattedValue = valor
              if (typeof valor === "string" && valor.includes("%")) {
                formattedValue = `${valor}`
              } else if (
                !isNaN(Number.parseFloat(valor)) &&
                campo !== "Descrição" &&
                campo !== "Designação Do Projeto"
              ) {
                // Add euro symbol to monetary values
                formattedValue = `${valor} ${campo.toLowerCase().includes("percentagem") ? "%" : "€"}`
              }

              return (
                <tr key={index} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                  <td className="p-2 border-b border-muted">{campo}</td>
                  <td className="p-2 border-b border-muted text-right font-medium">{formattedValue}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  const renderSummaryCards = () => {
    if (!info) return null

    if (tipo === "despesa") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Orçamentado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <EuroIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {Number.parseFloat(info["Dotações corrigidas"] || "0").toLocaleString("pt-PT")} €
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Executado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <EuroIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {Number.parseFloat(info["Período corrente"] || "0").toLocaleString("pt-PT")} €
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Execução</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <BarChart3Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                {info["Período corrente %"] || "0"}%
              </div>
              <Progress value={Number.parseFloat(info["Período corrente %"] || "0")} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )
    } else if (tipo === "receita") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Previsto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <EuroIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {Number.parseFloat(info["Previsões Corrigidas"] || "0").toLocaleString("pt-PT")} €
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cobrado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <EuroIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {Number.parseFloat(info["Período corrente"] || "0").toLocaleString("pt-PT")} €
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Cobrança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <BarChart3Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                {info["Período corrente %"] || "0"}%
              </div>
              <Progress value={Number.parseFloat(info["Período corrente %"] || "0")} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )
    } else if (tipo === "projetos" && rubrica !== "2") {
      const execPercentage = info["Nível Execução Financeira Anual (%)"]?.replace(",", ".").replace(" %", "") || "0"
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Orçamentado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <EuroIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {Number.parseFloat(info["Ano t"] || "0").toLocaleString("pt-PT")} €
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Executado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <EuroIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {Number.parseFloat(info["Ano t.1"] || "0").toLocaleString("pt-PT")} €
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Execução</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <BarChart3Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                {execPercentage}%
              </div>
              <Progress value={Number.parseFloat(execPercentage)} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center">Execução Orçamental 2024</h1>
          <p className="text-center mt-2 text-primary-foreground/80">Junta de Freguesia de Aveiras de Cima</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Image
            src="avc.jpg"
            alt="Aveiras de Cima"
            width={800}
            height={300}
            className="w-full h-48 md:h-64 object-cover rounded-lg shadow-md"
          />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <InfoIcon className="mr-2 h-5 w-5" />
              Manual de Utilização
            </CardTitle>
            <CardDescription>
              Painel interativo criado pelo projeto <strong>Juntos por Aveiras</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="mb-2">
              Este painel interativo foi criado com um objetivo simples: tornar acessível a toda a população a
              informação sobre as contas da nossa Junta de Freguesia de uma forma clara, transparente e sem
              complicações.
            </p>
            <p className="mb-2">
              Aqui podes consultar os dados da execução orçamental de 2024 da Junta de Freguesia de Aveiras de Cima.
              Basta escolher o <strong>tipo</strong> (Despesas, Receita, Tesouraria, Projetos) e depois a{" "}
              <strong>rúbrica</strong> que queres analisar. Os dados aparecerão organizados em tabela.
            </p>
            <p className="mb-2">
              <strong>O que são rúbricas?</strong>
              <br />
              As rúbricas são códigos que servem para agrupar as despesas e receitas por categorias. Alguns exemplos
              reais:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>D11 - Remunerações Certas e Permanentes</strong>: vencimentos fixos do pessoal da Junta
              </li>
              <li>
                <strong>D12 - Abonos Variáveis ou Eventuais</strong>: subsídios ou componentes variáveis no salário
              </li>
              <li>
                <strong>D13 - Segurança Social</strong>: contribuições da Junta para a segurança social
              </li>
            </ul>
          </CardContent>
        </Card>

        <Tabs defaultValue="despesa" className="mb-8" onValueChange={(value) => setTipo(value)}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="despesa">💸 Despesa</TabsTrigger>
            <TabsTrigger value="receita">💰 Receita</TabsTrigger>
            <TabsTrigger value="tesouraria">📋 Tesouraria</TabsTrigger>
            <TabsTrigger value="projetos">📌 Investimentos</TabsTrigger>
          </TabsList>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Escolha a rubrica:</label>
            <Select value={rubrica} onValueChange={setRubrica}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma rubrica" />
              </SelectTrigger>
              <SelectContent>{renderRubricaOptions()}</SelectContent>
            </Select>
          </div>

          {info && info.Descrição && (
            <div className="mb-6">
              <h2 className="text-xl font-bold flex items-center">
                {info.Rubrica && (
                  <Badge variant="outline" className="mr-2">
                    {info.Rubrica}
                  </Badge>
                )}
                {info.Descrição || info["Designação Do Projeto"] || ""}
              </h2>
            </div>
          )}

          {renderSummaryCards()}

          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Dados Detalhados</CardTitle>
              </CardHeader>
              <CardContent>{renderTableContent()}</CardContent>
            </Card>
          </div>
        </Tabs>
      </div>

      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="font-bold text-primary">Juntos por Aveiras • Corrigido em 24/04/2025</p>
          <p className="text-xs mt-2 text-muted-foreground">
            🔒 Este conteúdo está protegido contra cópia e edição direta. Projeto Juntos por Aveiras.
          </p>
        </div>
      </footer>
    </div>
  )
}
