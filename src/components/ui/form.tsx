'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { Slot } from '@radix-ui/react-slot'
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
)

function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn('space-y-2', className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  required,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & { required?: boolean }) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn(
        'text-sm font-medium leading-none',
        'transition-colors duration-200',
        error && 'text-destructive',
        className
      )}
      htmlFor={formItemId}
      {...props}
    >
      {props.children}
      {required && (
        <span className="ml-1 text-destructive" aria-hidden="true">*</span>
      )}
    </Label>
  )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn(
        'text-sm text-muted-foreground leading-relaxed',
        className
      )}
      {...props}
    />
  )
}

interface FormMessageProps extends React.ComponentProps<'div'> {
  /** Show success message instead of error */
  success?: boolean
  /** Custom icon to display */
  icon?: React.ReactNode
}

function FormMessage({
  className,
  success,
  icon,
  children,
  ...props
}: FormMessageProps) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? '') : children

  if (!body) {
    return null
  }

  const isSuccess = success && !error
  const Icon = isSuccess ? CheckCircle2 : AlertCircle
  const displayIcon = icon ?? <Icon className="size-4 shrink-0" />

  return (
    <div
      data-slot="form-message"
      id={formMessageId}
      role={error ? 'alert' : undefined}
      className={cn(
        'flex items-start gap-2 text-sm animate-in fade-in-0 slide-in-from-top-1 duration-200',
        error && 'text-destructive',
        isSuccess && 'text-green-600 dark:text-green-500',
        className
      )}
      {...props}
    >
      {displayIcon}
      <span className="leading-tight">{body}</span>
    </div>
  )
}

/** Helper text that appears below input, different from description */
function FormHint({ className, icon, children, ...props }: React.ComponentProps<'p'> & { icon?: React.ReactNode }) {
  return (
    <p
      data-slot="form-hint"
      className={cn(
        'flex items-center gap-1.5 text-xs text-muted-foreground',
        className
      )}
      {...props}
    >
      {icon ?? <Info className="size-3" />}
      {children}
    </p>
  )
}

/** Character/word counter for inputs */
function FormCounter({
  current,
  max,
  className,
  ...props
}: React.ComponentProps<'span'> & { current: number; max: number }) {
  const isNearLimit = current >= max * 0.9
  const isOverLimit = current > max

  return (
    <span
      data-slot="form-counter"
      className={cn(
        'text-xs tabular-nums transition-colors',
        isOverLimit
          ? 'text-destructive font-medium'
          : isNearLimit
            ? 'text-yellow-600 dark:text-yellow-500'
            : 'text-muted-foreground',
        className
      )}
      {...props}
    >
      {current}/{max}
    </span>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  FormHint,
  FormCounter,
}
