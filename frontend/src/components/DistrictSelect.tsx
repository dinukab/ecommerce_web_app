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

export function DistrictSelect({ province, value, setValue }: any) {

  const [open, setOpen] = React.useState(false)

  const districts =
    provinces.find((p) => p.value === province)?.districts || []

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>

        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={!province}
        >
          {value
            ? districts.find((d) => d.value === value)?.label
            : "Select district..."}

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />

        </Button>

      </PopoverTrigger>

      <PopoverContent className="w-full p-0">

        <Command>

          <CommandInput placeholder="Search district..." />

          <CommandEmpty>No district found.</CommandEmpty>

          <CommandGroup>

            {districts.map((district) => (
              <CommandItem
                key={district.value}
                value={district.value}
                onSelect={(currentValue) => {
                  setValue(currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    value === district.value ? "opacity-100" : "opacity-0"
                  }`}
                />
                {district.label}
              </CommandItem>
            ))}

          </CommandGroup>

        </Command>

      </PopoverContent>

    </Popover>
  )
}