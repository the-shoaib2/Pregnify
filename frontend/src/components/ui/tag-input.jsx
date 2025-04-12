import React, { useState } from 'react'
import { PlusCircle, X } from "lucide-react"

export const TagInput = ({ label, icon: Icon, values, onAdd, onRemove, placeholder }) => {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      const newValue = inputValue.trim()
      if (!values.includes(newValue)) {
        onAdd(newValue)
      }
      setInputValue('')
    }
  }

  const handleAddClick = () => {
    if (inputValue.trim()) {
      const newValue = inputValue.trim()
      if (!values.includes(newValue)) {
        onAdd(newValue)
      }
      setInputValue('')
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium leading-none flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 p-2 border rounded-md min-h-[42px] bg-background">
        {values.map((value, index) => (
          <div 
            key={index}
            className="flex items-center gap-1 bg-primary/5 hover:bg-primary/10 text-primary text-xs px-2 py-1 rounded-md transition-colors group"
          >
            <span>{value}</span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <div className="relative flex-1 min-w-[120px]">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground/60"
            placeholder={placeholder}
          />
          <button 
            type="button"
            onClick={handleAddClick}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <PlusCircle className="h-4 w-4 text-muted-foreground/40 hover:text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
} 