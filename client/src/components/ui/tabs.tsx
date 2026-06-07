import React from "react";

export const Tabs = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const TabsList = ({ children, ...props }: any) => <div className="flex border-b" {...props}>{children}</div>;
export const TabsTrigger = ({ children, ...props }: any) => (
  <button className="px-4 py-2 border-b-2 border-transparent hover:border-blue-500" {...props}>{children}</button>
);
export const TabsContent = ({ children, ...props }: any) => <div {...props}>{children}</div>;
