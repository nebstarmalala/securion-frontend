/**
 * Forms Components
 *
 * Reusable form components for Phase 6: Forms & Data Entry
 */

// Multi-Step Wizard
export {
  MultiStepWizard,
  useWizard,
  createWizardStep,
  type WizardStep,
  type WizardStepProps,
  type MultiStepWizardProps,
} from "./MultiStepWizard"

// Inline Editing
export {
  InlineTextEdit,
  InlineSelectEdit,
  InlineBadgeEdit,
  InlineNumberEdit,
  type InlineEditBaseProps,
  type InlineTextEditProps,
  type InlineSelectEditProps,
  type InlineSelectOption,
  type InlineBadgeEditProps,
  type InlineNumberEditProps,
} from "./InlineEdit"

// Bulk Actions
export {
  BulkSelectionProvider,
  useBulkSelection,
  BulkActionsToolbar,
  BulkSelectionCheckbox,
  createDeleteAction,
  createStatusAction,
  createAssignAction,
  createTagAction,
  createArchiveAction,
  type BulkAction,
  type BulkActionResult,
} from "./BulkActions"

// Template Selector
export {
  TemplateSelector,
  QuickTemplateApply,
  type TemplateType,
  type TemplateSelectorProps,
} from "./TemplateSelector"

// Pre-built Wizards
export { ProjectWizard } from "./ProjectWizard"
