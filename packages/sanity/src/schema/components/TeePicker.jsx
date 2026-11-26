import {useCallback, useEffect, useState} from "react";
import {Box, Button, Card, Flex, Stack, Text} from "@sanity/ui";
import {set, unset, useClient, useFormValue} from "sanity";
import {IntentLink} from "sanity/router";

const SWATCH = {black: "#111", blue: "#1d4ed8", white: "#fff", gold: "#d4a017", red: "#c62828", green: "#2e7d32", silver: "#b0b4ba"};

// Copy the tee's values at pick time, so re-rating a course never moves an old round.
const snapshot = (t) => ({
  _type: "object",
  teeKey: t._key,
  name: t.name,
  color: t.color,
  gender: t.gender,
  par: t.par,
  yardage: t.yardage,
  rating: t.rating,
  slope: t.slope,
});

export default function TeePicker(props) {
  const {value, onChange} = props;
  const courseRef = useFormValue(["course"])?._ref;
  const courseId = courseRef?.replace(/^drafts\./, "");
  const client = useClient({apiVersion: "2024-03-09"});
  const [tees, setTees] = useState(null);

  // Fetch tees including drafts, so a course you just created works straight away.
  useEffect(() => {
    if (!courseId) {
      setTees(null);
      return undefined;
    }
    let live = true;
    client
      .fetch(`coalesce(*[_id == "drafts." + $id][0].tees, *[_id == $id][0].tees)`, {id: courseId}, {perspective: "raw"})
      .then((r) => live && setTees(r ?? []))
      .catch(() => live && setTees([]));
    return () => {
      live = false;
    };
  }, [client, courseId]);

  // Changing the course clears the tee.
  const [lastCourse, setLastCourse] = useState(courseId);
  useEffect(() => {
    if (lastCourse !== courseId) {
      setLastCourse(courseId);
      if (value?.teeKey) onChange(unset());
    }
  }, [courseId, lastCourse, value?.teeKey, onChange]);

  const pick = useCallback((t) => onChange(set(snapshot(t))), [onChange]);
  const selected = tees?.find((t) => t._key === value?.teeKey);

  if (!courseId) return <Card padding={3} tone="transparent" border radius={2}><Text size={1} muted>Pick a course first</Text></Card>;
  if (tees === null) return <Text size={1} muted>Loading tees…</Text>;
  if (tees.length === 0) {
    return (
      <Card padding={3} tone="caution" border radius={2}>
        <Text size={1}>
          This course has no tees yet.{" "}
          <IntentLink intent="edit" params={{id: courseId, type: "golfCourse"}}>Add them on the course</IntentLink>.
        </Text>
      </Card>
    );
  }

  return (
    <Stack space={3}>
      <Stack space={2} role="radiogroup">
        {tees.map((t) => {
          const on = t._key === value?.teeKey;
          return (
            <Card
              key={t._key}
              as="button"
              type="button"
              role="radio"
              aria-checked={on}
              padding={3}
              border
              radius={2}
              tone={on ? "primary" : "default"}
              onClick={() => pick(t)}
              style={{textAlign: "left", cursor: "pointer"}}
            >
              <Flex align="center" gap={3}>
                <span
                  aria-hidden="true"
                  style={{width: 16, height: 16, borderRadius: "50%", background: SWATCH[t.color] ?? t.color ?? "transparent", border: "1px solid rgba(128,128,128,.6)"}}
                />
                <Box flex={1}>
                  <Text size={1} weight="semibold">{t.name} {t.gender ? `(${t.gender})` : ""}</Text>
                </Box>
                <Text size={1} muted>{[t.yardage && `${t.yardage} yds`, `${t.rating}/${t.slope}`].filter(Boolean).join(" · ")}</Text>
              </Flex>
            </Card>
          );
        })}
      </Stack>
      {value?.teeKey && !selected && <Text size={1}>This round's tee is no longer on the course. Pick one again.</Text>}
      {selected && (
        <Flex>
          <Button mode="ghost" fontSize={1} text="Refresh from course" onClick={() => pick(selected)} />
        </Flex>
      )}
    </Stack>
  );
}
