export type StoryType = "monster_battle" | "space_adventure" | "fairy_tale_quest" | "superhero_origin" | "robot_best_friend" | "haunted_house_mystery";

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
    icon: "/images/story-types/monster_battle.png",
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
    icon: "/images/story-types/space_adventure.png",
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
  {
    id: "fairy_tale_quest",
    title: "Fairy Tale Quest",
    hook: "A magical wish goes wrong. Can you set things right?",
    icon: "/images/story-types/fairy_tale_quest.png",
    structure: [
      "Wish",
      "Twist",
      "Journey",
      "Challenge",
      "Happy ending",
    ],
    questions: [
      {
        id: "hero_name",
        label: "Who is the hero of this tale?",
        type: "text",
        placeholder: "Give your hero a name...",
        required: true,
        helperText: "Every fairy tale needs a brave hero!",
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
        label: "Where does the fairy tale take place?",
        type: "select",
        options: [
          { value: "enchanted_kingdom", label: "An enchanted kingdom" },
          { value: "magical_forest", label: "A deep magical forest" },
          { value: "cloud_castle", label: "A castle in the clouds" },
          { value: "village_by_the_sea", label: "A little village by the sea" },
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
        id: "wish",
        label: "What wish does the hero make?",
        type: "select",
        options: [
          { value: "fly", label: "To be able to fly" },
          { value: "talk_to_animals", label: "To talk to animals" },
          { value: "become_royalty", label: "To become a prince or princess" },
          { value: "infinite_sweets", label: "Infinite sweets and treats" },
          { value: "custom", label: "Something else..." },
        ],
        required: true,
      },
      {
        id: "wish_custom",
        label: "Describe the wish",
        type: "text",
        placeholder: "What does your hero wish for?",
        required: false,
        helperText: "Only fill this in if you picked 'Something else'",
      },
      {
        id: "twist",
        label: "How does the wish go wrong?",
        type: "select",
        options: [
          { value: "opposite_effect", label: "It does the opposite of what they wanted" },
          { value: "too_much", label: "They get way too much of it" },
          { value: "affects_everyone", label: "It affects everyone around them" },
          { value: "trickster", label: "A trickster twisted the wish on purpose" },
        ],
        required: true,
      },
      {
        id: "helper",
        label: "Who helps the hero on their quest?",
        type: "select",
        options: [
          { value: "wise_owl", label: "A wise old owl" },
          { value: "fairy_godparent", label: "A fairy godparent" },
          { value: "talking_fox", label: "A clever talking fox" },
          { value: "lost_knight", label: "A lost but brave knight" },
          { value: "nobody", label: "No one — the hero goes alone!" },
        ],
        required: true,
      },
      {
        id: "ending",
        label: "How does the story end?",
        type: "select",
        options: [
          { value: "break_the_spell", label: "They break the spell just in time" },
          { value: "learn_lesson", label: "They learn what they really needed all along" },
          { value: "new_wish", label: "They earn a new, better wish" },
          { value: "make_peace", label: "They make peace with the trickster" },
        ],
        required: true,
      },
    ],
  },
  {
    id: "superhero_origin",
    title: "Superhero Origin",
    hook: "Something amazing just happened to you. Use your new powers!",
    icon: "/images/story-types/superhero_origin.png",
    structure: [
      "Normal day",
      "Transformation",
      "First mission",
      "Villain",
      "Triumph",
    ],
    questions: [
      {
        id: "hero_name",
        label: "What is your superhero's real name?",
        type: "text",
        placeholder: "Their everyday name...",
        required: true,
        helperText: "Every superhero has a secret identity!",
      },
      {
        id: "hero_image",
        label: "Upload a drawing or photo of your superhero",
        type: "image_upload",
        required: false,
        helperText: "Draw your hero or use a photo — this is what they'll look like in the movie!",
      },
      {
        id: "super_name",
        label: "What is their superhero name?",
        type: "text",
        placeholder: "Their superhero name...",
        required: true,
        helperText: "The name everyone will cheer!",
      },
      {
        id: "setting",
        label: "Where does the story take place?",
        type: "select",
        options: [
          { value: "big_city", label: "A big bustling city" },
          { value: "small_town", label: "A quiet small town" },
          { value: "futuristic_city", label: "A futuristic city" },
          { value: "island", label: "A remote island" },
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
        id: "power_origin",
        label: "How do they get their powers?",
        type: "select",
        options: [
          { value: "lightning_strike", label: "Struck by magical lightning" },
          { value: "mysterious_object", label: "They find a mysterious glowing object" },
          { value: "science_experiment", label: "A science experiment goes wild" },
          { value: "born_with_it", label: "They discover powers they were born with" },
          { value: "animal_encounter", label: "A magical animal gives them powers" },
        ],
        required: true,
      },
      {
        id: "superpower",
        label: "What is their superpower?",
        type: "select",
        options: [
          { value: "super_strength", label: "Super strength" },
          { value: "flight", label: "The power of flight" },
          { value: "invisibility", label: "Invisibility" },
          { value: "elemental", label: "Control over fire, water, or wind" },
          { value: "time_control", label: "Slowing down time" },
          { value: "custom", label: "Something else..." },
        ],
        required: true,
      },
      {
        id: "superpower_custom",
        label: "Describe the superpower",
        type: "text",
        placeholder: "What can they do?",
        required: false,
        helperText: "Only fill this in if you picked 'Something else'",
      },
      {
        id: "villain",
        label: "Who is the villain?",
        type: "select",
        options: [
          { value: "evil_genius", label: "An evil genius with gadgets" },
          { value: "shadow_creature", label: "A creature made of shadows" },
          { value: "rival_hero", label: "A rival with the same powers" },
          { value: "robot_army", label: "An army of rogue robots" },
          { value: "trickster", label: "A shapeshifting trickster" },
        ],
        required: true,
      },
      {
        id: "triumph",
        label: "How does the hero save the day?",
        type: "select",
        options: [
          { value: "master_power", label: "They finally master their power" },
          { value: "sacrifice", label: "They make a brave sacrifice" },
          { value: "rally_people", label: "They inspire everyone to help" },
          { value: "outsmart", label: "They outsmart the villain" },
          { value: "forgive", label: "They show the villain kindness" },
        ],
        required: true,
      },
    ],
  },
  {
    id: "robot_best_friend",
    title: "Robot Best Friend",
    hook: "You just built a robot. But it has a mind of its own!",
    icon: "/images/story-types/robot_best_friend.png",
    structure: [
      "Build",
      "Awakening",
      "Adventure",
      "Trouble",
      "Bond",
    ],
    questions: [
      {
        id: "builder_name",
        label: "Who builds the robot?",
        type: "text",
        placeholder: "Give the inventor a name...",
        required: true,
        helperText: "This kid is a genius inventor!",
      },
      {
        id: "builder_image",
        label: "Upload a drawing or photo of the inventor",
        type: "image_upload",
        required: false,
        helperText: "Draw your inventor or use a photo!",
      },
      {
        id: "robot_name",
        label: "What is the robot's name?",
        type: "text",
        placeholder: "Name your robot...",
        required: true,
        helperText: "Every robot needs a cool name!",
      },
      {
        id: "robot_image",
        label: "Upload a drawing of the robot",
        type: "image_upload",
        required: false,
        helperText: "Draw your robot or skip this and the AI will imagine it!",
      },
      {
        id: "setting",
        label: "Where does the story take place?",
        type: "select",
        options: [
          { value: "suburban_home", label: "A suburban home with a messy garage" },
          { value: "school", label: "At school" },
          { value: "junkyard", label: "A magical junkyard" },
          { value: "futuristic_lab", label: "A futuristic lab" },
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
        id: "robot_personality",
        label: "What is the robot's personality like?",
        type: "select",
        options: [
          { value: "silly", label: "Silly and clumsy" },
          { value: "curious", label: "Super curious about everything" },
          { value: "protective", label: "Protective and loyal" },
          { value: "mischievous", label: "Mischievous and playful" },
          { value: "shy", label: "Shy but sweet" },
        ],
        required: true,
      },
      {
        id: "adventure",
        label: "What adventure do they go on together?",
        type: "select",
        options: [
          { value: "sneak_out", label: "They sneak out to explore the city" },
          { value: "rescue_pet", label: "They rescue a lost pet" },
          { value: "talent_show", label: "They enter a talent show" },
          { value: "fix_disaster", label: "They have to fix a mess the robot made" },
        ],
        required: true,
      },
      {
        id: "trouble",
        label: "What trouble do they get into?",
        type: "select",
        options: [
          { value: "discovered", label: "Someone discovers the robot's secret" },
          { value: "malfunction", label: "The robot starts malfunctioning" },
          { value: "taken_away", label: "Someone wants to take the robot away" },
          { value: "robot_runs_away", label: "The robot runs away" },
        ],
        required: true,
      },
      {
        id: "bond",
        label: "How does their friendship win in the end?",
        type: "select",
        options: [
          { value: "prove_heart", label: "The robot proves it has a heart" },
          { value: "save_each_other", label: "They save each other" },
          { value: "accepted", label: "Everyone accepts the robot as family" },
          { value: "upgrade", label: "The inventor upgrades the robot with love" },
        ],
        required: true,
      },
    ],
  },
  {
    id: "haunted_house_mystery",
    title: "Haunted House Mystery",
    hook: "Strange things are happening in the old house. Dare to investigate?",
    icon: "/images/story-types/haunted_house_mystery.png",
    structure: [
      "Arrival",
      "Clues",
      "Scare",
      "Discovery",
      "Resolution",
    ],
    questions: [
      {
        id: "investigator_name",
        label: "Who is the brave investigator?",
        type: "text",
        placeholder: "Give your detective a name...",
        required: true,
        helperText: "This kid isn't afraid of anything... right?",
      },
      {
        id: "investigator_image",
        label: "Upload a drawing or photo of the investigator",
        type: "image_upload",
        required: false,
        helperText: "Draw your detective or use a photo!",
      },
      {
        id: "house_type",
        label: "What kind of haunted house is it?",
        type: "select",
        options: [
          { value: "victorian_mansion", label: "A creaky old Victorian mansion" },
          { value: "abandoned_school", label: "An abandoned school" },
          { value: "spooky_cabin", label: "A spooky cabin in the woods" },
          { value: "haunted_castle", label: "A crumbling haunted castle" },
          { value: "custom", label: "Somewhere else..." },
        ],
        required: true,
      },
      {
        id: "house_custom",
        label: "Describe the haunted place",
        type: "text",
        placeholder: "Tell us about the place...",
        required: false,
        helperText: "Only fill this in if you picked 'Somewhere else'",
      },
      {
        id: "companion",
        label: "Who comes along?",
        type: "select",
        options: [
          { value: "best_friend", label: "Their best friend" },
          { value: "pet_dog", label: "A loyal but scared dog" },
          { value: "sibling", label: "Their younger sibling" },
          { value: "nobody", label: "Nobody — they go alone!" },
        ],
        required: true,
      },
      {
        id: "first_clue",
        label: "What is the first strange clue they find?",
        type: "select",
        options: [
          { value: "footprints", label: "Mysterious glowing footprints" },
          { value: "music", label: "Music playing from an empty room" },
          { value: "message", label: "A hidden message on the wall" },
          { value: "moving_painting", label: "A painting whose eyes follow you" },
        ],
        required: true,
      },
      {
        id: "scare",
        label: "What is the big scare?",
        type: "select",
        options: [
          { value: "ghost_appears", label: "A ghost suddenly appears!" },
          { value: "trapped", label: "They get trapped in a room" },
          { value: "lights_out", label: "All the lights go out at once" },
          { value: "object_flies", label: "Objects start flying around" },
        ],
        required: true,
      },
      {
        id: "secret",
        label: "What is the house's secret?",
        type: "select",
        options: [
          { value: "friendly_ghost", label: "The ghost is friendly and just lonely" },
          { value: "hidden_treasure", label: "There's a hidden treasure inside" },
          { value: "lost_pet", label: "A lost magical pet was causing the spookiness" },
          { value: "time_portal", label: "The house is actually a time portal" },
        ],
        required: true,
      },
      {
        id: "resolution",
        label: "How does the mystery end?",
        type: "select",
        options: [
          { value: "help_ghost", label: "They help the ghost find peace" },
          { value: "claim_treasure", label: "They claim the treasure and share it" },
          { value: "new_friend", label: "They make an unexpected new friend" },
          { value: "save_the_house", label: "They save the house from being torn down" },
        ],
        required: true,
      },
    ],
  },
];
