"use client"

import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { CreditCardIcon } from "lucide-react"
import { Input } from "./ui/input"


type FormInputProps = {
  id: string
  label: string
  type?: string
  placeholder?: string
  maxLength?: number
  inputMode?: string
  pattern?: string
};

export function CardNumberInput() {
  const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "")
    if (value.length <= 16 && /^\d*$/.test(value)) {
      const formatted = value.replace(/(\d{4})/g, "$1 ").trim()
      e.target.value = formatted
    } else {
      e.target.value = e.target.value.replace(/[^\d\s]/g, "").slice(0, 19)
    }
  }

  return (
    <Field>
      <FieldLabel htmlFor="card-number">
        Card Number
      </FieldLabel>

      <InputGroup>
        <InputGroupInput
          id="card-number"
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          inputMode="numeric"
          pattern="\d*"
          onChange={handleCardInput}
        />

        <InputGroupAddon align="inline-end">
          <CreditCardIcon size={18} />
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}

type FormInputPropsBase = {
  id: string
  label: string
  type?: string
  placeholder?: string
  maxLength?: number
  inputClassName?: string
}

export function FormInput({
  id,
  label,
  type = "text",
  placeholder,
  maxLength,
  inputClassName,
}: FormInputPropsBase) {
  const handleCVVInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (id === "CVV") {
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4)
    }
  }

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        className={inputClassName}
        inputMode={id === "CVV" ? "numeric" : undefined}
        onChange={id === "CVV" ? handleCVVInput : undefined}
      />
    </Field>
  )
}