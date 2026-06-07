import React from "react";

export const Select = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const SelectTrigger = React.forwardRef<HTMLButtonElement, any>(({ className, ...props }, ref) => (
  <button ref={ref} className={`rounded-md border border-gray-300 px-3 py-2 text-sm ${className || ""}`} {...props} />
));
SelectTrigger.displayName = "SelectTrigger";
export const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>;
export const SelectContent = ({ children }: any) => <div>{children}</div>;
export const SelectItem = ({ value, children }: any) => <option value={value}>{children}</option>;
