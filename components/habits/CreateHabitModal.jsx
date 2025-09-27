'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { useHabitStore } from '@/lib/store/habitStore'
import { useUIStore } from '@/lib/store/uiStore'
import { CATEGORIES, HABIT_TYPES, DIFFICULTY_LEVELS } from '@/lib/types'

export function CreateHabitModal() {
  const { 
    createHabitModalOpen, 
    setCreateHabitModalOpen, 
    editingHabit,
    setEditingHabit 
  } = useUIStore()
  const { addHabit, updateHabit } = useHabitStore()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'HEALTH',
    type: HABIT_TYPES.BOOLEAN,
    difficulty: DIFFICULTY_LEVELS.EASY,
    goal: null
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editingHabit) {
      setFormData({
        name: editingHabit.name,
        description: editingHabit.description || '',
        category: editingHabit.category,
        type: editingHabit.type,
        difficulty: editingHabit.difficulty,
        goal: editingHabit.goal
      })
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'HEALTH',
        type: HABIT_TYPES.BOOLEAN,
        difficulty: DIFFICULTY_LEVELS.EASY,
        goal: null
      })
    }
    setErrors({})
  }, [editingHabit])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Habit name is required'
    }
    
    if ((formData.type === HABIT_TYPES.COUNTER || formData.type === HABIT_TYPES.TIMER) && !formData.goal) {
      newErrors.goal = 'Goal is required for this habit type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const habitData = {
      ...formData,
      goal: (formData.type === HABIT_TYPES.BOOLEAN) ? null : Number(formData.goal)
    }

    if (editingHabit) {
      updateHabit(editingHabit.id, habitData)
    } else {
      addHabit(habitData)
    }

    handleClose()
  }

  const handleClose = () => {
    setCreateHabitModalOpen(false)
    setEditingHabit(null)
    setFormData({
      name: '',
      description: '',
      category: 'HEALTH',
      type: HABIT_TYPES.BOOLEAN,
      difficulty: DIFFICULTY_LEVELS.EASY,
      goal: null
    })
    setErrors({})
  }

  return (
    <Dialog open={createHabitModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingHabit ? 'Edit Habit' : 'Create New Habit'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name*</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Drink 8 glasses of water"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORIES).map(([key, category]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Habit Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value, goal: null }))}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2 p-2 rounded-lg border">
                <RadioGroupItem value={HABIT_TYPES.BOOLEAN} id="boolean" />
                <Label htmlFor="boolean" className="flex-1 cursor-pointer">
                  <div className="font-medium">Simple (Yes/No)</div>
                  <div className="text-sm text-muted-foreground">Complete or not complete</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-2 rounded-lg border">
                <RadioGroupItem value={HABIT_TYPES.COUNTER} id="counter" />
                <Label htmlFor="counter" className="flex-1 cursor-pointer">
                  <div className="font-medium">Counter</div>
                  <div className="text-sm text-muted-foreground">Track a number (e.g., glasses of water)</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-2 rounded-lg border">
                <RadioGroupItem value={HABIT_TYPES.TIMER} id="timer" />
                <Label htmlFor="timer" className="flex-1 cursor-pointer">
                  <div className="font-medium">Timer</div>
                  <div className="text-sm text-muted-foreground">Track duration in minutes</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {(formData.type === HABIT_TYPES.COUNTER || formData.type === HABIT_TYPES.TIMER) && (
            <div className="space-y-2">
              <Label htmlFor="goal">
                Goal* {formData.type === HABIT_TYPES.TIMER ? '(minutes)' : '(count)'}
              </Label>
              <Input
                id="goal"
                type="number"
                min="1"
                value={formData.goal || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                placeholder={formData.type === HABIT_TYPES.TIMER ? '30' : '8'}
                className={errors.goal ? 'border-red-500' : ''}
              />
              {errors.goal && <p className="text-sm text-red-500">{errors.goal}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <div className="flex gap-2">
              {Object.values(DIFFICULTY_LEVELS).map((level) => (
                <Badge
                  key={level}
                  variant={formData.difficulty === level ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => setFormData(prev => ({ ...prev, difficulty: level }))}
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingHabit ? 'Update Habit' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}