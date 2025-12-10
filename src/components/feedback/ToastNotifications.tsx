import { useToast as useBaseToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info" | "loading";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ShowToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
  onDismiss?: () => void;
}

export function useEnhancedToast() {
  const { toast } = useBaseToast();

  const showToast = ({
    title,
    description,
    variant = "default",
    duration = 5000,
    action,
    onDismiss,
  }: ShowToastOptions) => {
    const variantConfig = {
      default: {
        icon: Info,
        className: "",
      },
      success: {
        icon: CheckCircle2,
        className: "border-green-500 bg-green-50 dark:bg-green-950",
      },
      error: {
        icon: AlertCircle,
        className: "border-red-500 bg-red-50 dark:bg-red-950",
      },
      warning: {
        icon: AlertTriangle,
        className: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950",
      },
      info: {
        icon: Info,
        className: "border-blue-500 bg-blue-50 dark:bg-blue-950",
      },
      loading: {
        icon: Loader2,
        className: "border-blue-500 bg-blue-50 dark:bg-blue-950",
      },
    };

    const config = variantConfig[variant];
    const Icon = config.icon;

    return toast({
      title: (
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              "h-4 w-4",
              variant === "loading" && "animate-spin",
              variant === "success" && "text-green-600 dark:text-green-400",
              variant === "error" && "text-red-600 dark:text-red-400",
              variant === "warning" && "text-yellow-600 dark:text-yellow-400",
              variant === "info" && "text-blue-600 dark:text-blue-400"
            )}
          />
          <span>{title}</span>
        </div>
      ),
      description,
      duration,
      className: config.className,
      action: action
        ? {
            altText: action.label,
            onClick: action.onClick,
          }
        : undefined,
      onOpenChange: (open) => {
        if (!open && onDismiss) {
          onDismiss();
        }
      },
    });
  };

  const success = (title: string, description?: string, options?: Partial<ShowToastOptions>) => {
    return showToast({ title, description, variant: "success", ...options });
  };

  const error = (title: string, description?: string, options?: Partial<ShowToastOptions>) => {
    return showToast({ title, description, variant: "error", ...options });
  };

  const warning = (title: string, description?: string, options?: Partial<ShowToastOptions>) => {
    return showToast({ title, description, variant: "warning", ...options });
  };

  const info = (title: string, description?: string, options?: Partial<ShowToastOptions>) => {
    return showToast({ title, description, variant: "info", ...options });
  };

  const loading = (title: string, description?: string, options?: Partial<ShowToastOptions>) => {
    return showToast({ title, description, variant: "loading", duration: Infinity, ...options });
  };

  const promise = async <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ): Promise<T> => {
    const loadingToast = loading(options.loading);

    try {
      const data = await promise;
      loadingToast.dismiss();

      const successMessage = typeof options.success === "function"
        ? options.success(data)
        : options.success;

      success(successMessage);
      return data;
    } catch (err) {
      loadingToast.dismiss();

      const errorMessage = typeof options.error === "function"
        ? options.error(err as Error)
        : options.error;

      error(errorMessage);
      throw err;
    }
  };

  return {
    toast: showToast,
    success,
    error,
    warning,
    info,
    loading,
    promise,
  };
}

interface ToastPreset {
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

export const TOAST_PRESETS: Record<string, ToastPreset> = {
  SAVE_SUCCESS: {
    title: "Changes saved",
    description: "Your changes have been saved successfully.",
    variant: "success",
  },
  SAVE_ERROR: {
    title: "Failed to save",
    description: "An error occurred while saving your changes.",
    variant: "error",
  },
  DELETE_SUCCESS: {
    title: "Deleted successfully",
    description: "The item has been deleted.",
    variant: "success",
  },
  DELETE_ERROR: {
    title: "Failed to delete",
    description: "An error occurred while deleting the item.",
    variant: "error",
  },
  CREATE_SUCCESS: {
    title: "Created successfully",
    description: "The item has been created.",
    variant: "success",
  },
  CREATE_ERROR: {
    title: "Failed to create",
    description: "An error occurred while creating the item.",
    variant: "error",
  },
  UPDATE_SUCCESS: {
    title: "Updated successfully",
    description: "The item has been updated.",
    variant: "success",
  },
  UPDATE_ERROR: {
    title: "Failed to update",
    description: "An error occurred while updating the item.",
    variant: "error",
  },
  COPY_SUCCESS: {
    title: "Copied to clipboard",
    description: "The content has been copied to your clipboard.",
    variant: "success",
    duration: 2000,
  },
  NETWORK_ERROR: {
    title: "Network error",
    description: "Please check your internet connection and try again.",
    variant: "error",
  },
  UNAUTHORIZED: {
    title: "Unauthorized",
    description: "You don't have permission to perform this action.",
    variant: "error",
  },
  SESSION_EXPIRED: {
    title: "Session expired",
    description: "Your session has expired. Please log in again.",
    variant: "warning",
  },
  VALIDATION_ERROR: {
    title: "Validation error",
    description: "Please check your input and try again.",
    variant: "error",
  },
};

export function useToastPresets() {
  const { toast } = useEnhancedToast();

  const showPreset = (presetKey: keyof typeof TOAST_PRESETS, overrides?: Partial<ShowToastOptions>) => {
    const preset = TOAST_PRESETS[presetKey];
    return toast({ ...preset, ...overrides });
  };

  return {
    showPreset,
    PRESETS: TOAST_PRESETS,
  };
}

export function useActionToasts() {
  const { success, error, warning, promise } = useEnhancedToast();

  const saveAction = async <T,>(
    saveFn: () => Promise<T>,
    entityName: string = "item"
  ) => {
    return promise(saveFn(), {
      loading: `Saving ${entityName}...`,
      success: `${entityName} saved successfully`,
      error: `Failed to save ${entityName}`,
    });
  };

  const deleteAction = async <T,>(
    deleteFn: () => Promise<T>,
    entityName: string = "item",
    onUndo?: () => Promise<void>
  ) => {
    const result = await promise(deleteFn(), {
      loading: `Deleting ${entityName}...`,
      success: `${entityName} deleted successfully`,
      error: `Failed to delete ${entityName}`,
    });

    if (onUndo) {
      success(`${entityName} deleted`, undefined, {
        action: {
          label: "Undo",
          onClick: async () => {
            await promise(onUndo(), {
              loading: `Restoring ${entityName}...`,
              success: `${entityName} restored`,
              error: `Failed to restore ${entityName}`,
            });
          },
        },
        duration: 8000,
      });
    }

    return result;
  };

  const createAction = async <T,>(
    createFn: () => Promise<T>,
    entityName: string = "item"
  ) => {
    return promise(createFn(), {
      loading: `Creating ${entityName}...`,
      success: `${entityName} created successfully`,
      error: `Failed to create ${entityName}`,
    });
  };

  const updateAction = async <T,>(
    updateFn: () => Promise<T>,
    entityName: string = "item"
  ) => {
    return promise(updateFn(), {
      loading: `Updating ${entityName}...`,
      success: `${entityName} updated successfully`,
      error: `Failed to update ${entityName}`,
    });
  };

  const bulkAction = async <T,>(
    actionFn: () => Promise<T>,
    actionName: string,
    count: number
  ) => {
    return promise(actionFn(), {
      loading: `${actionName} ${count} items...`,
      success: `Successfully ${actionName.toLowerCase()} ${count} items`,
      error: `Failed to ${actionName.toLowerCase()} items`,
    });
  };

  const copyToClipboard = async (text: string, label: string = "content") => {
    try {
      await navigator.clipboard.writeText(text);
      success("Copied to clipboard", `${label} has been copied`);
    } catch (err) {
      error("Failed to copy", "Could not copy to clipboard");
    }
  };

  return {
    saveAction,
    deleteAction,
    createAction,
    updateAction,
    bulkAction,
    copyToClipboard,
  };
}
