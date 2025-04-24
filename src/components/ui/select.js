import * as React from "react"
import { cn } from "../../lib/utils"

const Select = React.forwardRef(({ className, ...props }, ref) => (
  <select
    className={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
))
Select.displayName = "Select"

const SelectOption = React.forwardRef(({ className, ...props }, ref) => (
  <option
    className={cn("", className)}
    ref={ref}
    {...props}
  />
))
SelectOption.displayName = "SelectOption"

export { Select, SelectOption }