import React, { useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { Input } from './input'
import { cn } from '@/lib/utils'

export const Search = ({ 
  className, 
  onSearch, 
  placeholder = 'Search...', 
  ...props 
}) => {
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    const value = e.target.value
    setQuery(value)
    onSearch?.(value)
  }

  return (
    <div 
      className={cn(
        "relative flex items-center w-full max-w-md", 
        className
      )} 
      {...props}
    >
      <SearchIcon 
        className="absolute left-3 h-4 w-4 text-muted-foreground" 
      />
      <Input 
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={handleSearch}
        className="pl-10 w-full"
      />
    </div>
  )
}

export default Search
