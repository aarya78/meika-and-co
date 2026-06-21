import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";

function AppDialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />;
}

function AppDialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />;
}

function AppDialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close {...props} />;
}

function AppDialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...props} />;
}

function AppDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn("fixed inset-0 z-[90] bg-black/35 backdrop-blur-sm", className)}
      {...props}
    />
  );
}

function AppDialogContent({
  children,
  className,
  portalContainer,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  portalContainer?: HTMLElement | null;
}) {
  return (
    <AppDialogPortal container={portalContainer ?? undefined}>
      <AppDialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-[100] w-[calc(100%-1.5rem)] max-h-[calc(100vh-1.5rem)] -translate-x-1/2 -translate-y-1/2 outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </AppDialogPortal>
  );
}

function AppDialogTitle(props: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title {...props} />;
}

function AppDialogDescription(props: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description {...props} />;
}

export {
  AppDialog,
  AppDialogTrigger,
  AppDialogClose,
  AppDialogContent,
  AppDialogTitle,
  AppDialogDescription,
};
