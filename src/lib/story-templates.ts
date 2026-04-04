export type StoryType = "monster_battle" | "space_adventure";

export type StylePreset =
  | "storybook_illustration"
  | "colorful_cartoon"
  | "comic_book";

export interface StoryTemplate {
  id: StoryType;
  title: string;
  hook: string;
  icon: string;
  structure: string[];
  questions: TemplateQuestion[];
}

export interface TemplateQuestion {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "image_upload";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required: boolean;
  helperText?: string;
}

export const stylePresets: {
  id: StylePreset;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "storybook_illustration",
    title: "Storybook",
    description: "Warm, painterly, classic children's book feel",
    icon: "📖",
  },
  {
    id: "colorful_cartoon",
    title: "Cartoon",
    description: "Bright, bold, animated TV show look",
    icon: "🎨",
  },
  {
    id: "comic_book",
    title: "Comic Book",
    description: "Dynamic panels, strong outlines, dramatic angles",
    icon: "💥",
  },
];

export const storyTemplates: StoryTemplate[] = [
  {
    id: "monster_battle",
    title: "Monster Battle",
    hook: "A scary creature shows up. Only you can stop it!",
    icon: "🐉",
    structure: [
      "Peace",
      "Threat appears",
      "Decision to fight",
      "Battle",
      "Victory",
    ],
    questions: [
      {
        id: "hero_name",
        label: "Who is the hero?",
        type: "text",
        placeholder: "Give your hero a name...",
        required: true,
        helperText: "This is the star of your movie!",
      },
      {
        id: "hero_image",
        label: "Upload a drawing or photo of your hero",
        type: "image_upload",
        required: false,
        helperText: "Draw your hero or use a photo — this is what they'll look like in the movie!",
      },
      {
        id: "setting",
        label: "Where does the story happen?",
        type: "select",
        options: [
          { value: "enchanted_forest", label: "An enchanted forest" },
          { value: "medieval_castle", label: "A medieval castle" },
          { value: "underwater_kingdom", label: "An underwater kingdom" },
          { value: "floating_islands", label: "Floating islands in the sky" },
          { value: "custom", label: "Somewhere else..." },
        ],
        required: true,
      },
      {
        id: "setting_custom",
        label: "Describe your setting",
        type: "text",
        placeholder: "Tell us about the place...",
        required: false,
        helperText: "Only fill this in if you picked 'Somewhere else'",
      },
      {
        id: "monster_name",
        label: "What monster appears?",
        type: "text",
        placeholder: "Name the creature...",
        required: true,
        helperText: "What scary creature threatens the land?",
      },
      {
        id: "monster_image",
        label: "Upload a drawing of the monster",
        type: "image_upload",
        required: false,
        helperText: "Draw the monster or skip this and the AI will imagine it!",
      },
      {
        id: "fight_method",
        label: "How does the hero try to fight it?",
        type: "select",
        options: [
          { value: "magic_powers", label: "With magic powers" },
          { value: "clever_trap", label: "By setting a clever trap" },
          { value: "brave_charge", label: "With a brave charge" },
          { value: "secret_weapon", label: "With a secret weapon" },
          { value: "friendship", label: "By making friends with it" },
        ],
        required: true,
      },
      {
        id: "victory",
        label: "How does the hero win?",
        type: "select",
        options: [
          { value: "epic_showdown", label: "An epic final showdown" },
          { value: "outsmart", label: "Outsmarting the monster" },
          { value: "teamwork", label: "With help from friends" },
          { value: "inner_strength", label: "Finding hidden inner strength" },
          { value: "monster_becomes_friend", label: "The monster becomes a friend" },
        ],
        required: true,
      },
    ],
  },
  {
    id: "space_adventure",
    title: "Space Adventure",
    hook: "You're the captain. Where does your crew go?",
    icon: "🚀",
    structure: [
      "Launch",
      "Discovery",
      "Danger",
      "Solution",
      "Return/new frontier",
    ],
    questions: [
      {
        id: "captain_name",
        label: "Who is the captain?",
        type: "text",
        placeholder: "Name your space captain...",
        required: true,
        helperText: "This brave explorer leads the mission!",
      },
      {
        id: "captain_image",
        label: "Upload a drawing or photo of the captain",
        type: "image_upload",
        required: false,
        helperText: "Draw your captain or use a photo!",
      },
      {
        id: "ship_name",
        label: "What's the name of your spaceship?",
        type: "text",
        placeholder: "Name your ship...",
        required: true,
        helperText: "Every great ship needs a name!",
      },
      {
        id: "destination",
        label: "Where does the crew go?",
        type: "select",
        options: [
          { value: "crystal_planet", label: "A planet made of crystals" },
          { value: "gas_giant", label: "A giant planet with floating cities" },
          { value: "asteroid_belt", label: "Through a dangerous asteroid belt" },
          { value: "alien_world", label: "A world with friendly aliens" },
          { value: "custom", label: "Somewhere else..." },
        ],
        required: true,
      },
      {
        id: "destination_custom",
        label: "Describe where the crew goes",
        type: "text",
        placeholder: "Tell us about the destination...",
        required: false,
      },
      {
        id: "discovery",
        label: "What do they discover?",
        type: "select",
        options: [
          { value: "ancient_ruins", label: "Ancient alien ruins" },
          { value: "new_lifeform", label: "A new lifeform" },
          { value: "treasure", label: "Mysterious space treasure" },
          { value: "signal", label: "A strange signal" },
        ],
        required: true,
      },
      {
        id: "danger",
        label: "What danger do they face?",
        type: "select",
        options: [
          { value: "space_storm", label: "A massive space storm" },
          { value: "engine_failure", label: "The ship's engine breaks down" },
          { value: "space_pirates", label: "Space pirates attack" },
          { value: "black_hole", label: "Getting pulled toward a black hole" },
        ],
        required: true,
      },
      {
        id: "solution",
        label: "How do they escape the danger?",
        type: "select",
        options: [
          { value: "clever_piloting", label: "Amazing piloting skills" },
          { value: "crew_teamwork", label: "The whole crew works together" },
          { value: "alien_help", label: "Aliens come to help" },
          { value: "invention", label: "They invent something new" },
        ],
        required: true,
      },
    ],
  },
];
