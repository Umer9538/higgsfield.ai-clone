import type { Field } from "@/lib/workspace/types";
import { PresetCard } from "./fields/PresetCard";
import { Segmented } from "./fields/Segmented";
import { Dropzone, DropzoneRow } from "./fields/Dropzone";
import { PromptField } from "./fields/PromptField";
import { Accordion, PillRow, SelectRow, Stepper, ValueRow } from "./fields/Rows";
import { ToggleRow } from "./fields/ToggleRow";

/** Maps one config field onto its renderer. Adding a field type starts here. */
export function FieldRenderer({ field }: { field: Field }) {
  switch (field.kind) {
    case "preset":
      return <PresetCard label={field.label} sublabel={field.sublabel} image={field.image} />;
    case "segmented":
      return <Segmented id={field.id} options={field.options} defaultValue={field.defaultValue} />;
    case "dropzone":
      return <Dropzone title={field.title} subtitle={field.subtitle} accepts={field.accepts} />;
    case "dropzoneRow":
      return <DropzoneRow items={field.items} />;
    case "prompt":
      return (
        <PromptField
          id={field.id}
          label={field.label}
          placeholder={field.placeholder}
          chips={field.chips}
          maxLength={field.maxLength}
          optional={field.optional}
        />
      );
    case "select":
      return <SelectRow label={field.label} value={field.value} />;
    case "pills":
      return <PillRow items={field.items} />;
    case "valueRow":
      return <ValueRow label={field.label} value={field.value} accent={field.accent} />;
    case "stepper":
      return <Stepper label={field.label} value={field.value} />;
    case "toggle":
      return (
        <ToggleRow
          id={field.id}
          label={field.label}
          defaultOn={field.defaultOn}
          segmented={field.segmented}
          description={field.description}
        />
      );
    case "accordion":
      return <Accordion label={field.label} icon={field.icon} />;
  }
}
