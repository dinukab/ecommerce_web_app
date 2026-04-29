"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { provinces } from "@/data/sri-lanka-locations"

export function ProvinceSelect({ value, setValue }: any) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between border-gray-500 bg-gray-100 text-gray-900 hover:bg-gray-200 hover:text-gray-900"
        >
          {value
            ? provinces.find((province) => province.value === value)?.label
            : "Select province..."}

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full border-gray-200 bg-white p-0 text-gray-900">
        <Command className="bg-white text-gray-900">
          <CommandInput
            placeholder="Search province..."
            className="bg-white text-gray-900 placeholder:text-gray-400"
          />
          <CommandEmpty>No province found.</CommandEmpty>

          <CommandGroup>
            {provinces.map((province) => (
              <CommandItem
                key={province.value}
                value={province.value}
                className="text-gray-800 data-[selected=true]:bg-gray-100 data-[selected=true]:text-gray-900"
                onSelect={(currentValue) => {
                  setValue(currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    value === province.value ? "opacity-100" : "opacity-0"
                  }`}
                />
                {province.label}
              </CommandItem>
            ))}
          </CommandGroup>

        </Command>
      </PopoverContent>
    </Popover>
  )
}
