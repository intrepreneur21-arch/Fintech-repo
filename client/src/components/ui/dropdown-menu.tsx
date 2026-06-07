import React from "react";
export const DropdownMenu = ({ children }: any) => <div>{children}</div>;
export const DropdownMenuTrigger = React.forwardRef<any, any>(({ children, ...props }, ref) => (
  <button ref={ref} {...props}>{children}</button>
));
export const DropdownMenuContent = ({ children }: any) => <div>{children}</div>;
export const DropdownMenuItem = ({ children, ...props }: any) => <button {...props}>{children}</button>;
