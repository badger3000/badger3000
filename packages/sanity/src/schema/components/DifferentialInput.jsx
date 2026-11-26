import {Stack, Text} from "@sanity/ui";
import {useFormValue} from "sanity";

// Default number input plus a read-only estimate when the field is empty,
// so a typo stands out: (113 / slope) × (score − rating).
export default function DifferentialInput(props) {
  const score = useFormValue(["score"]);
  const tee = useFormValue(["tee"]);
  const empty = props.value == null;
  const est =
    empty && score != null && tee?.slope && tee?.rating != null
      ? Math.round((113 / tee.slope) * (score - tee.rating) * 10) / 10
      : null;
  return (
    <Stack space={2}>
      {props.renderDefault(props)}
      {est != null && <Text size={1} muted>Estimated ~{est} (PCC 0). Copy GHIN's value to replace it.</Text>}
    </Stack>
  );
}
