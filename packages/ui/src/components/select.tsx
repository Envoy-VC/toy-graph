'use client';

// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as selectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import type * as react from 'react';

import { cn } from '@repo/ui/lib/utils';

function Select({
  ...props
}: react.ComponentProps<typeof selectPrimitive.Root>) {
  return (
    <selectPrimitive.Root
      data-slot='select'
      {...props}
    />
  );
}

function SelectGroup({
  ...props
}: react.ComponentProps<typeof selectPrimitive.Group>) {
  return (
    <selectPrimitive.Group
      data-slot='select-group'
      {...props}
    />
  );
}

function SelectValue({
  ...props
}: react.ComponentProps<typeof selectPrimitive.Value>) {
  return (
    <selectPrimitive.Value
      data-slot='select-value'
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: react.ComponentProps<typeof selectPrimitive.Trigger> & {
  size?: 'sm' | 'default';
}) {
  return (
    <selectPrimitive.Trigger
      data-slot='select-trigger'
      data-size={size}
      className={cn(
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}

      <selectPrimitive.Icon asChild={true}>
        {/** @ts-ignore */}
        <ChevronDownIcon className='size-4 opacity-50' />
      </selectPrimitive.Icon>
    </selectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: react.ComponentProps<typeof selectPrimitive.Content>) {
  return (
    <selectPrimitive.Portal>
      <selectPrimitive.Content
        data-slot='select-content'
        className={cn(
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in',
          position === 'popper' &&
            'data-[side=left]:-translate-x-1 data-[side=top]:-translate-y-1 data-[side=right]:translate-x-1 data-[side=bottom]:translate-y-1',
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <selectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1'
          )}
        >
          {children}
        </selectPrimitive.Viewport>
        <SelectScrollDownButton />
      </selectPrimitive.Content>
    </selectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: react.ComponentProps<typeof selectPrimitive.Label>) {
  return (
    <selectPrimitive.Label
      data-slot='select-label'
      className={cn('px-2 py-1.5 text-muted-foreground text-xs', className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: react.ComponentProps<typeof selectPrimitive.Item>) {
  return (
    <selectPrimitive.Item
      data-slot='select-item'
      className={cn(
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className='absolute right-2 flex size-3.5 items-center justify-center'>
        <selectPrimitive.ItemIndicator>
          {/** @ts-ignore */}
          <CheckIcon className='size-4' />
        </selectPrimitive.ItemIndicator>
      </span>
      <selectPrimitive.ItemText>{children}</selectPrimitive.ItemText>
    </selectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: react.ComponentProps<typeof selectPrimitive.Separator>) {
  return (
    <selectPrimitive.Separator
      data-slot='select-separator'
      className={cn('-mx-1 pointer-events-none my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: react.ComponentProps<typeof selectPrimitive.ScrollUpButton>) {
  return (
    <selectPrimitive.ScrollUpButton
      data-slot='select-scroll-up-button'
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className
      )}
      {...props}
    >
      {/** @ts-ignore */}
      <ChevronUpIcon className='size-4' />
    </selectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: react.ComponentProps<typeof selectPrimitive.ScrollDownButton>) {
  return (
    <selectPrimitive.ScrollDownButton
      data-slot='select-scroll-down-button'
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className
      )}
      {...props}
    >
      {/** @ts-ignore */}
      <ChevronDownIcon className='size-4' />
    </selectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
