import React from "react";
import { cn } from "../../utils/cn";

const Checkbox = React.forwardRef(({ className, onChange, checked, ...props }, ref) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500",
        className
      )}
      ref={ref}
      checked={checked}
      onChange={handleChange}
      {...props}
    />
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };
