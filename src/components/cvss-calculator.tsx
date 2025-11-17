/**
 * CVSS Calculator Component
 * Interactive calculator for CVSS v3.1 scores with visual feedback
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Info, Shield, Zap, Lock, Users, Network } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CVSS } from "@/lib/types/api"

interface CVSSCalculatorProps {
  value?: CVSS
  onChange?: (cvss: CVSS) => void
  className?: string
}

// CVSS v3.1 Metric Definitions
const metrics = {
  attackVector: {
    name: "Attack Vector (AV)",
    description: "How the vulnerability can be exploited",
    icon: Network,
    options: [
      { value: "N", label: "Network", description: "Remotely exploitable", weight: 0.85 },
      { value: "A", label: "Adjacent", description: "Adjacent network access required", weight: 0.62 },
      { value: "L", label: "Local", description: "Local access required", weight: 0.55 },
      { value: "P", label: "Physical", description: "Physical access required", weight: 0.2 },
    ],
  },
  attackComplexity: {
    name: "Attack Complexity (AC)",
    description: "Complexity of the attack required to exploit the vulnerability",
    icon: Zap,
    options: [
      { value: "L", label: "Low", description: "No special conditions", weight: 0.77 },
      { value: "H", label: "High", description: "Special conditions required", weight: 0.44 },
    ],
  },
  privilegesRequired: {
    name: "Privileges Required (PR)",
    description: "Level of privileges required to exploit",
    icon: Lock,
    options: [
      { value: "N", label: "None", description: "No privileges required", weight: 0.85 },
      { value: "L", label: "Low", description: "Basic user privileges", weight: 0.62 },
      { value: "H", label: "High", description: "Admin privileges required", weight: 0.27 },
    ],
  },
  userInteraction: {
    name: "User Interaction (UI)",
    description: "Whether user interaction is required",
    icon: Users,
    options: [
      { value: "N", label: "None", description: "No user interaction required", weight: 0.85 },
      { value: "R", label: "Required", description: "User must take action", weight: 0.62 },
    ],
  },
  scope: {
    name: "Scope (S)",
    description: "Whether the vulnerability affects resources beyond its authorization",
    icon: Shield,
    options: [
      { value: "U", label: "Unchanged", description: "Only the vulnerable component", weight: 1.0 },
      { value: "C", label: "Changed", description: "Impacts beyond the vulnerable component", weight: 1.0 },
    ],
  },
  confidentiality: {
    name: "Confidentiality Impact (C)",
    description: "Impact to data confidentiality",
    icon: Lock,
    options: [
      { value: "H", label: "High", description: "Total loss of confidentiality", weight: 0.56 },
      { value: "L", label: "Low", description: "Some loss of confidentiality", weight: 0.22 },
      { value: "N", label: "None", description: "No loss of confidentiality", weight: 0.0 },
    ],
  },
  integrity: {
    name: "Integrity Impact (I)",
    description: "Impact to data integrity",
    icon: Shield,
    options: [
      { value: "H", label: "High", description: "Total loss of integrity", weight: 0.56 },
      { value: "L", label: "Low", description: "Some loss of integrity", weight: 0.22 },
      { value: "N", label: "None", description: "No loss of integrity", weight: 0.0 },
    ],
  },
  availability: {
    name: "Availability Impact (A)",
    description: "Impact to availability of the impacted component",
    icon: Zap,
    options: [
      { value: "H", label: "High", description: "Total loss of availability", weight: 0.56 },
      { value: "L", label: "Low", description: "Reduced performance", weight: 0.22 },
      { value: "N", label: "None", description: "No impact to availability", weight: 0.0 },
    ],
  },
}

export function CVSSCalculator({ value, onChange, className }: CVSSCalculatorProps) {
  // Initialize state from value or defaults
  const [selections, setSelections] = useState({
    attackVector: value?.vector?.match(/AV:([NALP])/)?.[1] || "N",
    attackComplexity: value?.vector?.match(/AC:([LH])/)?.[1] || "L",
    privilegesRequired: value?.vector?.match(/PR:([NLH])/)?.[1] || "N",
    userInteraction: value?.vector?.match(/UI:([NR])/)?.[1] || "N",
    scope: value?.vector?.match(/S:([UC])/)?.[1] || "U",
    confidentiality: value?.vector?.match(/C:([HLN])/)?.[1] || "N",
    integrity: value?.vector?.match(/I:([HLN])/)?.[1] || "N",
    availability: value?.vector?.match(/A:([HLN])/)?.[1] || "N",
  })

  // Calculate CVSS score
  const calculateScore = () => {
    const { attackVector, attackComplexity, privilegesRequired, userInteraction, scope, confidentiality, integrity, availability } = selections

    // Get weights from metrics
    const av = metrics.attackVector.options.find((o) => o.value === attackVector)?.weight || 0
    const ac = metrics.attackComplexity.options.find((o) => o.value === attackComplexity)?.weight || 0
    const pr = metrics.privilegesRequired.options.find((o) => o.value === privilegesRequired)?.weight || 0
    const ui = metrics.userInteraction.options.find((o) => o.value === userInteraction)?.weight || 0
    const c = metrics.confidentiality.options.find((o) => o.value === confidentiality)?.weight || 0
    const i = metrics.integrity.options.find((o) => o.value === integrity)?.weight || 0
    const a = metrics.availability.options.find((o) => o.value === availability)?.weight || 0

    // Calculate Impact Sub Score (ISS)
    const iss = 1 - (1 - c) * (1 - i) * (1 - a)

    // Calculate Impact based on scope
    const impact = scope === "U" ? 6.42 * iss : 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15)

    // Calculate Exploitability
    const exploitability = 8.22 * av * ac * pr * ui

    // Calculate final score
    let score = 0
    if (impact <= 0) {
      score = 0
    } else if (scope === "U") {
      score = Math.min(impact + exploitability, 10)
    } else {
      score = Math.min(1.08 * (impact + exploitability), 10)
    }

    return Math.round(score * 10) / 10
  }

  // Generate vector string
  const generateVector = () => {
    return `CVSS:3.1/AV:${selections.attackVector}/AC:${selections.attackComplexity}/PR:${selections.privilegesRequired}/UI:${selections.userInteraction}/S:${selections.scope}/C:${selections.confidentiality}/I:${selections.integrity}/A:${selections.availability}`
  }

  const score = calculateScore()
  const vector = generateVector()

  // Determine severity based on score
  const getSeverity = (score: number): { level: string; color: string; bg: string } => {
    if (score === 0) return { level: "None", color: "text-gray-600", bg: "bg-gray-100" }
    if (score < 4.0) return { level: "Low", color: "text-blue-600", bg: "bg-blue-100" }
    if (score < 7.0) return { level: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" }
    if (score < 9.0) return { level: "High", color: "text-orange-600", bg: "bg-orange-100" }
    return { level: "Critical", color: "text-red-600", bg: "bg-red-100" }
  }

  const severity = getSeverity(score)

  // Update parent component when score changes
  useEffect(() => {
    if (onChange) {
      onChange({
        version: "3.1",
        score,
        vector,
      })
    }
  }, [score, vector, onChange])

  const handleSelectionChange = (metric: string, value: string) => {
    setSelections((prev) => ({ ...prev, [metric]: value }))
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              CVSS v3.1 Calculator
            </CardTitle>
            <CardDescription className="mt-1.5">
              Calculate vulnerability severity using Common Vulnerability Scoring System
            </CardDescription>
          </div>

          {/* Score Display */}
          <div className="text-right">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tabular-nums">{score.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">/ 10.0</span>
            </div>
            <Badge className={cn("mt-1", severity.bg, severity.color, "font-semibold")}>
              {severity.level}
            </Badge>
          </div>
        </div>

        {/* Vector String */}
        <div className="mt-4 rounded-lg bg-muted p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Vector String</p>
              <code className="text-xs font-mono break-all">{vector}</code>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Base Score Metrics */}
        <div>
          <h3 className="text-sm font-semibold mb-4">Base Score Metrics</h3>

          {/* Exploitability Metrics */}
          <div className="space-y-5">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Exploitability Metrics
            </div>

            {Object.entries(metrics)
              .slice(0, 4)
              .map(([key, metric]) => {
                const Icon = metric.icon
                return (
                  <div key={key} className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {metric.name}
                      <span className="text-xs text-muted-foreground font-normal">
                        — {metric.description}
                      </span>
                    </Label>

                    <RadioGroup
                      value={selections[key as keyof typeof selections]}
                      onValueChange={(value) => handleSelectionChange(key, value)}
                      className="grid grid-cols-2 md:grid-cols-4 gap-3"
                    >
                      {metric.options.map((option) => (
                        <label
                          key={option.value}
                          className={cn(
                            "flex flex-col gap-1.5 p-3 rounded-lg border-2 cursor-pointer transition-all",
                            selections[key as keyof typeof selections] === option.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-accent",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value={option.value} id={`${key}-${option.value}`} />
                            <span className="font-medium text-sm">{option.label}</span>
                          </div>
                          <span className="text-xs text-muted-foreground ml-6">
                            {option.description}
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                )
              })}

            <Separator className="my-4" />

            {/* Impact Metrics */}
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Impact Metrics
            </div>

            {Object.entries(metrics)
              .slice(4)
              .map(([key, metric]) => {
                const Icon = metric.icon
                return (
                  <div key={key} className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {metric.name}
                      <span className="text-xs text-muted-foreground font-normal">
                        — {metric.description}
                      </span>
                    </Label>

                    <RadioGroup
                      value={selections[key as keyof typeof selections]}
                      onValueChange={(value) => handleSelectionChange(key, value)}
                      className="grid grid-cols-2 md:grid-cols-3 gap-3"
                    >
                      {metric.options.map((option) => (
                        <label
                          key={option.value}
                          className={cn(
                            "flex flex-col gap-1.5 p-3 rounded-lg border-2 cursor-pointer transition-all",
                            selections[key as keyof typeof selections] === option.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-accent",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value={option.value} id={`${key}-${option.value}`} />
                            <span className="font-medium text-sm">{option.label}</span>
                          </div>
                          <span className="text-xs text-muted-foreground ml-6">
                            {option.description}
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Visual Score Breakdown */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold mb-3">Score Breakdown</h4>
          <div className="space-y-2">
            {/* Score Bar */}
            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  score >= 9.0 ? "bg-red-500" :
                  score >= 7.0 ? "bg-orange-500" :
                  score >= 4.0 ? "bg-yellow-500" :
                  score > 0 ? "bg-blue-500" : "bg-gray-400"
                )}
                style={{ width: `${(score / 10) * 100}%` }}
              />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                <span>None (0.0)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span>Low (0.1-3.9)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <span>Med (4.0-6.9)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                <span>High (7.0-8.9)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span>Crit (9.0-10.0)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
