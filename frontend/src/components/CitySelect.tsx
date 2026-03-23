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
          className="w-full justify-between"
          disabled={!district}
        >
          {value
            ? cities.find((c) => c.value === value)?.label
            : "Select city..."}

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />

        </Button>

      </PopoverTrigger>

      <PopoverContent className="w-full p-0">

        <Command>

          <CommandInput placeholder="Search city..." />

          <CommandEmpty>No city found.</CommandEmpty>

          <CommandGroup>

            {cities.map((city) => (
              <CommandItem
                key={city.value}
                value={city.value}
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