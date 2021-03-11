const weapon = {
  name: "Gnome Flickmace",
  tags: ["Attack", "Gnome", "Reach"],
};
const actions = [
  {
    name: "Attack of Opportunity",
    actions: "Reaction",
    attack: true,
    trigger:
      "A creature within your reach uses a manipulate action or a move action, makes a ranged attack, or leaves a square during a move action it’s using.",
    description:
      "You lash out at a foe that leaves an opening. Make a melee Strike against the triggering creature. If your attack is a critical hit and the trigger was a manipulate action, you disrupt that action. This Strike doesn’t count toward your multiple attack penalty, and your multiple attack penalty doesn’t apply to this Strike.",
  },
  {
    name: "Guardian's Deflection",
    actions: "Reaction",
    trigger:
      "An ally within your melee reach is hit by an attack, you can see the attacker, and the ally gaining a +2 circumstance bonus to AC would turn the critical hit into a hit or the hit into a miss.",
    requirements:
      "You are wielding a single one-handed melee weapon and have your other hand or hands free.",
    description:
      "You use your weapon to deflect the attack against your ally, granting a +2 circumstance bonus to their Armor Class against the triggering attack. This turns the triggering critical hit into a hit, or the triggering hit into a miss.",
  },
];
(async () => {
  const actionFormat = ({ actions, name, tags, content }) => {
    const checkTitle = (paragraph) =>
      typeof paragraph === "object"
        ? `<strong>${paragraph.title}</strong> ${paragraph.text}`
        : paragraph;
    return `
      <hr style="margin-top: 0; margin-bottom: 3px;" />
      <header style="display: flex; font-size: 14px">
        <img
          style="flex: 0 0 36px; margin-right: 5px;"
          src="systems/pf2e/icons/actions/${actions}.png"
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
      ${
        content
          ? `
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
          `
          : ""
      } 
    `;
  };
  const contentFormat = (action) => {
    const content = [];
    if (action.trigger) {
      content.push({
        title: "Trigger",
        text: action.trigger,
      });
    }
    if (action.requirements) {
      content.push({
        title: "Requirements",
        text: action.requirements,
      });
    }
    if (action.description) {
      content.push(action.description);
    }
    if (action.failure) {
      content.push({
        title: "Failure",
        text: action.failure,
      });
    }
    return {
      actions: action.actions,
      name: action.name,
      tags: action.tags,
      content: content,
    };
  };
  const slugify = (string) =>
    // borrowed from https://gist.github.com/codeguy/6684588
    string
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  const strikeItem = (actor.data.data.actions ?? [])
    .filter((action) => action.type === "strike")
    .find((strike) => strike.name === weapon.name);
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
  const buttons = (action, modifiers) => {
    const buttons = ["", "", ""];
    if (action.attack) {
      if (action.actions === "Reaction") {
        buttons[0] = modifiers
          ? `${action.name} (${modToString(modifiers[0])})`
          : action.name;
      } else {
        if (!(action.tags ?? []).includes("Press")) {
          buttons[0] = modifiers ? `1st (${modToString(modifiers[0])})` : "1st";
        }
        if (
          !(
            action.actions === "ThreeActions" ||
            (action.tags ?? []).includes("Open")
          )
        ) {
          buttons[1] = modifiers ? `2nd (${modToString(modifiers[1])})` : "2nd";
          if (action.actions !== "TwoActions") {
            buttons[2] = modifiers
              ? `3rd (${modToString(modifiers[2])})`
              : "3rd";
          }
        }
      }
    } else {
      buttons[0] = action.name;
    }
    return buttons;
  };
  const buttonFormat = (action, modifiers) => {
    const buttonText = buttons(action, modifiers);
    let buttonHTML = "";
    for (let i = 0; i < buttonText.length; i++) {
      if (buttonText[i]) {
        buttonHTML += `
            <button
              class="dialog-button ${slugify(action.name)}${i}"
              data-button="${slugify(action.name)}${i}"
              style="margin-bottom:5px;"
            >${buttonText[i]}</button>
          `;
      }
    }
    return `<div class="dialog-buttons" style="margin-top: 5px;">${buttonHTML}</div>`;
  };
  const strike = (MAP) => {
    const options = [
      ...actor.getRollOptions(["all", "str-based", "attack", "attack-roll"]),
      ...(weapon.tags ? weapon.tags.map((tag) => slugify(tag)) : []),
    ];
    strikeItem.variants[MAP].roll({ event, options });
  };
  const dialog = new Dialog(
    {
      title: " ",
      content: `
      ${actions
        .slice(0, -1)
        .map(
          (action) =>
            `${actionFormat(action)}${buttonFormat(action, modifiers)}`
        )
        .join("")}
      ${actionFormat(actions[actions.length - 1])}
    `,
      buttons: {},
    },
    { width: 250 }
  );
  const setButtons = (action, buttonText) => {
    for (let MAP = 0; MAP < 3; MAP++) {
      if (buttonText[MAP]) {
        dialog.data.buttons[`${slugify(action.name)}${MAP}`] = {
          label: buttonText[MAP],
          callback: () => {
            ChatMessage.create({
              user: game.user._id,
              speaker: ChatMessage.getSpeaker(),
              content: `
                ${actionFormat(contentFormat(action))}
              `,
            });
            if (action.attack) {
              strike(MAP);
            }
          },
        };
      }
    }
  };
  setButtons(
    actions[actions.length - 1],
    buttons(actions[actions.length - 1], modifiers)
  );
  dialog.render(true);
  for (const action of actions.slice(0, -1)) {
    setButtons(action, buttons(action, modifiers));
  }
})();
