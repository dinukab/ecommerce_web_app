"use client"

import * as React from "react"
import { provinces } from "@/data/sri-lanka-locations"

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

export function CitySelect({ province, district, value, setValue }: any) {

  const [open, setOpen] = React.useState(false)

  const cities =
    provinces
      .find((p) => p.value === province)
      ?.districts.find((d) => d.value === district)?.cities || []

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>

        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between border-gray-500 bg-gray-100 text-gray-900 hover:bg-gray-200 hover:text-gray-900 disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:opacity-100"
          disabled={!district}
        >
          {value
            ? cities.find((c) => c.value === value)?.label
            : "Select city..."}

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />

        </Button>

      </PopoverTrigger>

      <PopoverContent className="w-full border-gray-200 bg-white p-0 text-gray-900">

        <Command className="bg-white text-gray-900">

          <CommandInput
            placeholder="Search city..."
            className="bg-white text-gray-900 placeholder:text-gray-400"
          />

          <CommandEmpty>No city found.</CommandEmpty>

          <CommandGroup>

            {cities.map((city) => (
              <CommandItem
                key={city.value}
                value={city.value}
                className="text-gray-800 data-[selected=true]:bg-gray-100 data-[selected=true]:text-gray-900"
                onSelect={(currentValue) => {
                  setValue(currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    value === city.value ? "opacity-100" : "opacity-0"
                  }`}
                />
                {city.label}
              </CommandItem>
            ))}

          </CommandGroup>

        </Command>

      </PopoverContent>

    </Popover>
  )
}