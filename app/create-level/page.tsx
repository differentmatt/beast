"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Settings } from "lucide-react"

interface LevelData {
  name: string
  beasts: number
  superBeasts: number
  eggs: number
  height: number
  width: number
  gameSpeed: number
}

interface ValidationErrors {
  name?: string
  beasts?: string
  superBeasts?: string
  eggs?: string
  height?: string
  width?: string
  gameSpeed?: string
}

interface FieldConfig {
  label: string
  type: 'text'
  min?: number
  max?: number
  required?: boolean
  pattern?: RegExp
  patternError?: string
  errorMessages: {
    required?: string
    min?: string
    max?: string
    pattern?: string
    invalidNumber?: string
  }
}

const fieldConfigs: Record<keyof LevelData, FieldConfig> = {
  name: {
    label: 'Level Name',
    type: 'text',
    required: true,
    pattern: /^[a-zA-Z0-9\s-]+$/,
    patternError: 'Level name can only contain letters, numbers, spaces, and hyphens',
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
    errorMessages: {
      min: 'Eggs cannot be negative',
      max: 'Eggs cannot exceed 100',
      invalidNumber: 'Please enter a valid number'
    }
  },
  height: {
    label: 'Height',
    type: 'text',
    min: 5,
    max: 200,
    required: true,
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
    errorMessages: {
      required: 'Width is required',
      min: 'Width must be at least 5',
      max: 'Width cannot exceed 200',
      invalidNumber: 'Please enter a valid number'
    }
  },
  gameSpeed: {
    label: 'Game Speed',
    type: 'text',
    min: 0.1,
    max: 5.0,
    required: true,
    errorMessages: {
      required: 'Game speed is required',
      min: 'Game speed must be at least 0.1',
      max: 'Game speed cannot exceed 5.0',
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

  const [levelData, setLevelData] = useState<LevelData>({
    name: "",
    beasts: 1,
    superBeasts: 0,
    eggs: 0,
    height: 50,
    width: 80,
    gameSpeed: 1.0,
  })

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
        setLevelData(existingLevel)
      }
    } catch (error) {
      console.error("Error loading level:", error)
    } finally {
      setIsLoadingLevel(false)
    }
  }

  // Stub function for getting level by ID - to be connected later
  const getLevelByIdAPI = async (levelId: string): Promise<LevelData | null> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock data for existing levels
    const mockLevels: Record<string, LevelData> = {
      "101": {
        name: "speed-arena",
        beasts: 4,
        superBeasts: 0,
        eggs: 1,
        height: 8,
        width: 8,
        gameSpeed: 1.3,
      },
      "102": {
        name: "maze-challenge",
        beasts: 6,
        superBeasts: 2,
        eggs: 3,
        height: 20,
        width: 20,
        gameSpeed: 0.9,
      },
      "103": {
        name: "peaceful-garden",
        beasts: 2,
        superBeasts: 0,
        eggs: 5,
        height: 12,
        width: 12,
        gameSpeed: 0.7,
      },
    }

    console.log("Loading level data for ID:", levelId)
    return mockLevels[levelId] || null
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    Object.entries(fieldConfigs).forEach(([field, config]) => {
      const value = levelData[field as keyof LevelData]
      const fieldErrors: string[] = []

      // Required check - only for empty strings, not for 0
      if (config.required && value === '') {
        fieldErrors.push(config.errorMessages.required || 'This field is required')
      }

      // Pattern check for text fields
      if (config.pattern && typeof value === 'string') {
        if (!config.pattern.test(value)) {
          fieldErrors.push(config.patternError || config.errorMessages.pattern || 'Invalid format')
        }
      }

      // Number validation for numeric fields
      if (field !== 'name') {
        // Only validate numbers if there's a value
        if (value !== '') {
          const numValue = Number(value)
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
      }

      if (fieldErrors.length > 0) {
        newErrors[field as keyof ValidationErrors] = fieldErrors[0]
      }
    })

    // Must have at least 1 of either beast, superbeast, or egg
    const beasts = Number(levelData.beasts) || 0
    const superBeasts = Number(levelData.superBeasts) || 0
    const eggs = Number(levelData.eggs) || 0
    if (beasts === 0 && superBeasts === 0 && eggs === 0) {
      newErrors.beasts = "Must have at least 1 of either beast, superbeast, or egg"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Stub function for API calls - to be connected later
  const createLevelAPI = async (data: LevelData): Promise<{ id: number; success: boolean }> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate successful creation with a new ID
    const newId = Math.floor(Math.random() * 1000) + 200 // Generate ID starting from 200

    console.log("Creating level with data:", data)
    console.log("Generated level ID:", newId)

    return { id: newId, success: true }
  }

  const updateLevelAPI = async (levelId: string, data: LevelData): Promise<{ success: boolean }> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Updating level ID:", levelId, "with data:", data)

    return { success: true }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      if (isEditing && editingLevelId) {
        // Update existing level
        const result = await updateLevelAPI(editingLevelId, levelData)
        if (result.success) {
          router.push(`/play?level=${editingLevelId}`)
        }
      } else {
        // Create new level
        const result = await createLevelAPI(levelData)
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

  const handleInputChange = (field: keyof LevelData, value: string) => {
    // For non-name fields, keep the raw string value
    // This allows empty inputs and partial numbers
    setLevelData((prev) => ({
      ...prev,
      [field]: value,
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
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Level Parameters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(fieldConfigs).map(([field, config]) => (
                  <div key={field} className={field === 'name' ? 'sm:col-span-2' : ''}>
                    <Label htmlFor={field} className="flex justify-between">
                      <span>{config.label}</span>
                      {config.min !== undefined && config.max !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {config.min}-{config.max}
                        </span>
                      )}
                    </Label>
                    <Input
                      id={field}
                      type={config.type}
                      value={levelData[field as keyof LevelData].toString()}
                      onChange={(e) => handleInputChange(field as keyof LevelData, e.target.value)}
                      className={errors[field as keyof ValidationErrors] ? "border-red-500" : ""}
                    />
                    {errors[field as keyof ValidationErrors] && (
                      <p className="text-sm text-red-500 mt-1">{errors[field as keyof ValidationErrors]}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4">
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

        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            <strong>Tips:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Level names should be descriptive and unique</li>
            <li>Super beasts are stronger versions of regular beasts</li>
            <li>Game speed affects how fast everything moves (1.0 = normal)</li>
            <li>Larger levels are more challenging but give more space</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
