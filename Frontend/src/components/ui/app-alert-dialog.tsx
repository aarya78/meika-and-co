import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/utils";

function AppAlertDialog(props: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root {...props} />;
}

function AppAlertDialogTrigger(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>,
) {
  return <AlertDialogPrimitive.Trigger {...props} />;
}

function AppAlertDialogCancel(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>,
) {
  return <AlertDialogPrimitive.Cancel {...props} />;
}

function AppAlertDialogAction(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Action>,
) {
  return <AlertDialogPrimitive.Action {...props} />;
}

function AppAlertDialogContent({
  children,
  className,
  portalContainer,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
  portalContainer?: HTMLElement | null;
}) {
  return (
    <AlertDialogPrimitive.Portal container={portalContainer ?? undefined}>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-black/35 backdrop-blur-sm" />
      <AlertDialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-[100] w-[calc(100%-1.5rem)] max-h-[calc(100vh-1.5rem)] -translate-x-1/2 -translate-y-1/2 outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
}

function AppAlertDialogTitle(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Title>,
) {
  return <AlertDialogPrimitive.Title {...props} />;
}

function AppAlertDialogDescription(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Description>,
) {
  return <AlertDialogPrimitive.Description {...props} />;
}

export {
  AppAlertDialog,
  AppAlertDialogTrigger,
  AppAlertDialogCancel,
  AppAlertDialogAction,
  AppAlertDialogContent,
  AppAlertDialogTitle,
  AppAlertDialogDescription,
};
