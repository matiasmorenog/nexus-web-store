"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type RememberMeCheckboxProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
};

export function RememberMeCheckbox({
  id,
  checked,
  onChange,
  className,
}: RememberMeCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 text-sm text-neutral-600",
        className,
      )}
    >
      <Switch
        id={id}
        name="rememberMe"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      Recordarme
    </label>
  );
}
