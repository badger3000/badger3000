import { defineQuery } from "groq";
import { IMAGE } from "./fragments.ts";

/** `AvatarUser ← settings.name`, and the profile card in the sidebar. */
export const settingsQuery = defineQuery(`*[_type == "settings"][0] {
  name,
  title,
  location,
  occupation,
  description,
  "avatarImage": avatar_image ${IMAGE},
  "links": links[]->{ siteName, webUrl }
}`);

/** Chat — the agent's `about` intent. */
export const settingsForChatQuery = defineQuery(`*[_type == "settings"][0] {
  name, title, location, occupation, description
}`);
