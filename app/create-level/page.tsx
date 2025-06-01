"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Settings } from "lucide-react"
import { LevelConfig, LevelData } from "@/app/types/game"
import LevelPreview from "../components/LevelPreview"
import { generateLevelFromConfig } from "@/app/utils/levelGenerator"
import { getLevelInfo } from "@/app/data/levels"

interface ValidationErrors {
  name?: string
  beasts?: string
  superBeasts?: string
  eggs?: string
  height?: string
  width?: string
  gameSpeed?: string
  wallPercentage?: string
  blockPercentage?: string
}

interface FieldConfig {
  label: string
  type: 'text'
  min?: number
  max?: number
  required?: boolean
  pattern?: RegExp
  patternError?: string
  group: 'entities' | 'settings' | 'dimensions'
  errorMessages: {
    required?: string
    min?: string
    max?: string
    pattern?: string
    invalidNumber?: string
  }
}

const fieldConfigs: Record<keyof LevelConfig, FieldConfig> = {
  name: {
    label: 'Level Name',
    type: 'text',
    required: true,
    pattern: /^[a-zA-Z0-9\s-]+$/,
    patternError: 'Level name can only contain letters, numbers, spaces, and hyphens',
    group: 'settings',
    errorMessages: {
      required: 'Level name is required',
      min: 'Level name must be at least 3 characters',
      max: 'Level name must be less than 50 characters',
      pattern: 'Level name can only contain letters, numbers, spaces, and hyphens'
    }
  },
  beasts: {
    label: 'Beasts',
    type: 'text',
    min: 0,
    max: 100,
    required: true,
    group: 'entities',
    errorMessages: {
      min: 'Beasts cannot be negative',
      max: 'Beasts cannot exceed 100',
      invalidNumber: 'Please enter a valid number'
    }
  },
  superBeasts: {
    label: 'Super Beasts',
    type: 'text',
    min: 0,
    max: 100,
    required: true,
    group: 'entities',
    errorMessages: {
      min: 'Super beasts cannot be negative',
      max: 'Super beasts cannot exceed 100',
      invalidNumber: 'Please enter a valid number'
    }
  },
  eggs: {
    label: 'Eggs',
    type: 'text',
    min: 0,
    max: 100,
    required: true,
    group: 'entities',
    errorMessages: {
      min: 'Eggs cannot be negative',
      max: 'Eggs cannot exceed 100',
      invalidNumber: 'Please enter a valid number'
    }
  },
  gameSpeed: {
    label: 'Game Speed',
    type: 'text',
    min: 0.1,
    max: 5.0,
    required: true,
    group: 'settings',
    errorMessages: {
      required: 'Game speed is required',
      min: 'Game speed must be at least 0.1',
      max: 'Game speed cannot exceed 5.0',
      invalidNumber: 'Please enter a valid number'
    }
  },
  wallPercentage: {
    label: 'Wall Percentage',
    type: 'text',
    min: 0,
    max: 100,
    required: true,
    group: 'settings',
    errorMessages: {
      required: 'Wall percentage is required',
      min: 'Wall percentage must be at least 0',
      max: 'Wall percentage cannot exceed 100',
      invalidNumber: 'Please enter a valid number'
    }
  },
  blockPercentage: {
    label: 'Block Percentage',
    type: 'text',
    min: 0,
    max: 100,
    required: true,
    group: 'settings',
    errorMessages: {
      required: 'Block percentage is required',
      min: 'Block percentage must be at least 0',
      max: 'Block percentage cannot exceed 100',
      invalidNumber: 'Please enter a valid number'
    }
  },
  height: {
    label: 'Height',
    type: 'text',
    min: 5,
    max: 200,
    required: true,
    group: 'dimensions',
    errorMessages: {
      required: 'Height is required',
      min: 'Height must be at least 5',
      max: 'Height cannot exceed 200',
      invalidNumber: 'Please enter a valid number'
    }
  },
  width: {
    label: 'Width',
    type: 'text',
    min: 5,
    max: 200,
    required: true,
    group: 'dimensions',
    errorMessages: {
      required: 'Width is required',
      min: 'Width must be at least 5',
      max: 'Width cannot exceed 200',
      invalidNumber: 'Please enter a valid number'
    }
  }
}

export default function CreateLevelPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editingLevelId = searchParams.get("id")
  const isEditing = !!editingLevelId

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingLevel, setIsLoadingLevel] = useState(isEditing)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [generatedLevel, setGeneratedLevel] = useState<LevelData | null>(null)

  const [levelConfig, setLevelConfig] = useState<LevelConfig>({
    name: "",
    beasts: 3,
    superBeasts: 0,
    eggs: 0,
    height: 25,
    width: 40,
    gameSpeed: 1.0,
    wallPercentage: 2,
    blockPercentage: 40,
  })

  // Generate level whenever config changes
  useEffect(() => {
    const isValid = validateForm(true)
    if (isValid) {
      const levelData = generateLevelFromConfig(levelConfig)
      console.log("Generated level data:", levelData)
      setGeneratedLevel(levelData)
    } else {
      setGeneratedLevel(null)
    }
  }, [levelConfig])

  // Load existing level data when editing
  useEffect(() => {
    if (isEditing && editingLevelId) {
      loadLevelData(editingLevelId)
    }
  }, [isEditing, editingLevelId])

  // Stub function to load existing level data
  const loadLevelData = async (levelId: string) => {
    setIsLoadingLevel(true)
    try {
      // TODO: Replace with actual API call
      const existingLevel = await getLevelByIdAPI(levelId)
      if (existingLevel) {
        setLevelConfig(existingLevel)
      }
    } catch (error) {
      console.error("Error loading level:", error)
    } finally {
      setIsLoadingLevel(false)
    }
  }

  // Stub function for getting level by ID - to be connected later
  const getLevelByIdAPI = async (levelId: string): Promise<LevelConfig | null> => {
    try {
      const levelData = getLevelInfo(levelId)
      // Convert LevelData to LevelConfig by removing extra fields
      const levelConfig: LevelConfig = {
        name: levelData.name,
        beasts: levelData.beasts,
        superBeasts: levelData.superBeasts,
        eggs: levelData.eggs,
        height: levelData.height,
        width: levelData.width,
        gameSpeed: levelData.gameSpeed,
        wallPercentage: levelData.wallPercentage,
        blockPercentage: levelData.blockPercentage,
      }
      return levelConfig
    } catch (error) {
      console.error("Error loading level:", error)
      return null
    }
  }

  const validateForm = (forPreview: boolean = false): boolean => {
    const newErrors: ValidationErrors = {}

    Object.entries(fieldConfigs).forEach(([field, config]) => {
      const value = levelConfig[field as keyof LevelConfig]
      const fieldErrors: string[] = []

      // Required check - only for name field and only when not previewing
      if (field === 'name' && config.required && value === '' && !forPreview) {
        fieldErrors.push(config.errorMessages.required || 'This field is required')
      }

      // Pattern check for text fields
      if (config.pattern && typeof value === 'string' && value !== '') {
        if (!config.pattern.test(value)) {
          fieldErrors.push(config.patternError || config.errorMessages.pattern || 'Invalid format')
        }
      }

      // Number validation for numeric fields
      if (field !== 'name') {
        const numValue = value === '' ? 0 : Number(value)
        if (isNaN(numValue)) {
          fieldErrors.push(config.errorMessages.invalidNumber || 'Please enter a valid number')
        } else {
          if (config.min !== undefined && numValue < config.min) {
            fieldErrors.push(config.errorMessages.min || `Must be at least ${config.min}`)
          }
          if (config.max !== undefined && numValue > config.max) {
            fieldErrors.push(config.errorMessages.max || `Cannot exceed ${config.max}`)
          }
        }
      }

      if (fieldErrors.length > 0) {
        newErrors[field as keyof ValidationErrors] = fieldErrors[0]
      }
    })

    // Must have at least 1 of either beast, superbeast, or egg
    const beasts = Number(levelConfig.beasts) || 0
    const superBeasts = Number(levelConfig.superBeasts) || 0
    const eggs = Number(levelConfig.eggs) || 0
    if (beasts === 0 && superBeasts === 0 && eggs === 0) {
      newErrors.beasts = "Must have at least 1 of either beast, superbeast, or egg"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Stub function for API calls - to be connected later
  const createLevelAPI = async (data: LevelConfig): Promise<{ id: number; success: boolean }> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate successful creation with a new ID
    const newId = Math.floor(Math.random() * 1000) + 200 // Generate ID starting from 200

    console.log("Creating level with data:", data)
    console.log("Generated level ID:", newId)

    return { id: newId, success: true }
  }

  const updateLevelAPI = async (levelId: string, data: LevelConfig): Promise<{ success: boolean }> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Updating level ID:", levelId, "with data:", data)

    return { success: true }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm(false)) {
      return
    }

    setIsLoading(true)

    try {
      // Generate the level data from the config
      const generatedLevel = generateLevelFromConfig(levelConfig)

      if (isEditing && editingLevelId) {
        // Update existing level
        const result = await updateLevelAPI(editingLevelId, generatedLevel)
        if (result.success) {
          router.push(`/play?level=${editingLevelId}`)
        }
      } else {
        // Create new level
        const result = await createLevelAPI(generatedLevel)
        if (result.success) {
          router.push(`/play?level=${result.id}`)
        }
      }
    } catch (error) {
      console.error("Error saving level:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof LevelConfig, value: string) => {
    let parsedValue: string | number = value

    // Parse numeric fields only if there's a value
    if (value !== '') {
      if (field === "beasts" || field === "superBeasts" || field === "eggs" || field === "height" || field === "width") {
        const intValue = Number.parseInt(value)
        parsedValue = Number.isNaN(intValue) ? '' : intValue
      } else if (field === "gameSpeed") {
        const floatValue = Number.parseFloat(value)
        parsedValue = Number.isNaN(floatValue) ? '' : floatValue
      }
    }

    setLevelConfig((prev) => ({
      ...prev,
      [field]: parsedValue,
    }))

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  if (isLoadingLevel) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading level data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Form Section */}
          <Card className="w-[400px] shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-4 w-4" />
                Level Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Level name field spanning both columns */}
                <div>
                  <Label htmlFor="name" className="flex justify-between">
                    <span>{fieldConfigs.name.label}</span>
                    {(fieldConfigs.name.min !== undefined || fieldConfigs.name.max !== undefined) && (
                      <span className="text-xs text-muted-foreground">
                        {fieldConfigs.name.min}-{fieldConfigs.name.max}
                      </span>
                    )}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={levelConfig.name.toString()}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Two-column grid for remaining fields */}
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(fieldConfigs)
                    .filter(([field]) => field !== 'name')
                    .map(([field, config]) => (
                      <div key={field}>
                        <Label htmlFor={field} className="flex justify-between">
                          <span>{config.label}</span>
                          {(config.min !== undefined || config.max !== undefined) && (
                            <span className="text-xs text-muted-foreground">
                              {config.min}-{config.max}
                            </span>
                          )}
                        </Label>
                        <Input
                          id={field}
                          type="text"
                          value={levelConfig[field as keyof LevelConfig].toString()}
                          onChange={(e) => handleInputChange(field as keyof LevelConfig, e.target.value)}
                          className={errors[field as keyof ValidationErrors] ? "border-red-500" : ""}
                        />
                        {errors[field as keyof ValidationErrors] && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors[field as keyof ValidationErrors]}
                          </p>
                        )}
                      </div>
                    ))}
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading
                      ? isEditing
                        ? "Updating Level..."
                        : "Creating Level..."
                      : isEditing
                        ? "Update Level"
                        : "Create Level"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <div className="flex-1 min-w-[300px]">
            {generatedLevel ? (
              <LevelPreview levelData={generatedLevel} />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center text-muted-foreground">
                  <p>Fill in valid level parameters to see a preview</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
