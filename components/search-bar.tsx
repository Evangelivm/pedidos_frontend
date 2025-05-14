"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  onSearch?: (value: string) => void
  placeholder?: string
}

export function SearchBar({ onSearch, placeholder = "Buscar..." }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Debounce search to avoid too many updates
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, onSearch])

  return (
    <div className="relative max-w-xl w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        type="search"
        className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  )
}
