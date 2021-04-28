const weapon = "Halberd";
const action = {
  name: "Sudden Charge",
  actions: "TwoActions", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
  tags: ["Fighter", "Flourish", "Open"],
  description:
    "With a quick sprint, you dash up to your foe and swing. Stride twice. If you end your movement within melee reach of at least one enemy, you can make a melee Strike against that enemy. You can use Sudden Charge while Burrowing, Climbing, Flying, or Swimming instead of Striding if you have the corresponding movement type.",
};
(async () => {
  const actionFormat = ({ actions, name, tags, content }) => {
    const checkTitle = (paragraph) =>
      typeof paragraph === "object"
        ? `<strong>${paragraph.title}</strong> ${paragraph.text}`
        : paragraph;
    return `
      <header style="display: flex; font-size: 14px">
        <img
          style="flex: 0 0 36px; margin-right: 5px;"
          src="systems/pf2e/icons/actions/${actions}.webp"
          title="${name}"
          width="36"
          height="36"
        >
        <h3 style="flex: 1; line-height: 36px; margin: 0;">
          ${name}
        </h3>
      </header>
      ${
        tags
          ? `
            <hr style="margin-top: 3px; margin-bottom: 1px;" />
            <div class="tags" style="
              margin-bottom: 5px;
            ">
              ${tags
                .map(
                  (tag) => `
                    <span class="tag tag_alt"">${tag}</span>`
                )
                .join(" ")}
            </div>
          `
          : `<hr style="margin-top: 3px;" />`
      }
      <div style="font-weight: 500; font-size: 14px;">
        ${content
          .map((paragraph) =>
            Array.isArray(paragraph)
              ? paragraph
                  .map((subParagraph) => checkTitle(subParagraph))
                  .join(`<div style="margin-bottom: 5px;"></div>`)
              : checkTitle(paragraph)
          )
          .join("<hr />")}
      </div>
    `;
  };
  const format = actionFormat({
    actions: action.actions,
    name: action.name,
    tags: action.tags,
    content: [
      ...(action.trigger
        ? [
            {
              title: "Trigger",
              text: action.trigger,
            },
          ]
        : []),
      ...(action.requirements
        ? [
            {
              title: "Requirements",
              text: action.requirements,
            },
          ]
        : []),
      ...(action.description ? [action.description] : []),
      ...(action.failure
        ? [
            {
              title: "Failure",
              text: action.failure,
            },
          ]
        : []),
    ],
  });
  const slugify = (string) =>
    // borrowed from https://gist.github.com/codeguy/6684588
    string
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  const strikeItem = (actor.data.data.actions ?? [])
    .filter((action) => action.type === "strike")
    .find((strike) => strike.name === weapon);
  const strike = (MAP) => {
    ChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: `
        <hr style="margin-top: 0; margin-bottom: 3px;" />
        ${format}
      `,
    });
    const options = [
      ...actor.getRollOptions(["all", "str-based", "attack", "attack-roll"]),
      ...(action.tags ? action.tags.map((tag) => slugify(tag)) : []),
      ...[`action:${slugify(action.name)}`],
    ];
    strikeItem.variants[MAP].roll({ event, options });
  };
  const modifiers = strikeItem.variants.map((variant) => {
    let modifier = strikeItem.totalModifier;
    const splitLabel = variant.label.split(" ");
    if (splitLabel[0] === "MAP") {
      modifier += parseInt(splitLabel[1]);
    }
    return modifier;
  });
  const modToString = (modifier) =>
    modifier >= 0 ? `+${modifier}` : `${modifier}`;
  const dialog = new Dialog({
    title: " ",
    content: `${format}<hr/>`,
    buttons: {},
  });
  const includeFirst =
    !(action.tags ?? []).includes("Press") || action.actions === "Reaction";
  if (includeFirst) {
    dialog.data.buttons.first = {};
    dialog.data.buttons.first = {
      label: `1st (${modToString(modifiers[0])})`,
      callback: () => {
        strike(0);
      },
    };
    dialog.data.default = "first";
  }
  if (
    !(
      action.actions === "ThreeActions" ||
      action.actions === "Reaction" ||
      (action.tags ?? []).includes("Open")
    )
  ) {
    dialog.data.buttons.second = {};
    dialog.data.buttons.second = {
      label: `2nd (${modToString(modifiers[1])})`,
      callback: () => {
        strike(1);
      },
    };
    if (!includeFirst) {
      dialog.data.default = "second";
    }
  }
  if (
    !(
      action.actions === "TwoActions" ||
      action.actions === "ThreeActions" ||
      action.actions === "Reaction" ||
      (action.tags ?? []).includes("Open")
    )
  ) {
    dialog.data.buttons.third = {};
    dialog.data.buttons.third = {
      label: `3rd (${modToString(modifiers[2])})`,
      callback: () => {
        strike(2);
      },
    };
  }
  dialog.render(true);
})();
