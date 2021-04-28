const weapon = {
  name: "Gnome Flickmace",
  tags: ["Attack", "Gnome", "Reach"],
  description: [
    "More a flail than a mace, this weapon has a short handle attached to a length of chain with a ball at the end. The ball is propelled to its reach with the flick of the wrist, the momentum of which brings the ball back to the wielder after the strike.",
  ],
  critical: {
    content: [
      {
        title: "Critical Specialization (Flail)",
        text: "The target is knocked prone.",
      },
      {
        title: "Shock",
        text:
          "On a critical hit, electricity arcs out to deal an equal amount of electricity damage to up to two other creatures of your choice within 10 feet of the target.",
      },
    ],
    rollData: {
      selectors: ["electricity", "energy"],
      multiplier: 2,
    },
  },
  actions: [
    {
      name: "Snagging Strike",
      actions: "OneAction", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
      attack: true,
      tags: ["Fighter"],
      requirements:
        "You have one hand free, and your target is within reach of that hand.",
      description:
        "You combine an attack with quick grappling moves to throw an enemy off balance as long as it stays in your reach. Make a Strike while keeping one hand free. If this Strike hits, the target is flat-footed until the start of your next turn or until it’s no longer within the reach of your hand, whichever comes first.",
    },
    {
      name: "Lunge",
      actions: "OneAction", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
      attack: true,
      tags: ["Fighter"],
      requirements: "You are wielding a melee weapon.",
      description:
        "Using your weapon as a lever, you force your opponent to end up right where you want them. Make a Strike with the required weapon. If the Strike hits, you can move the target up to 10 feet into a space in your reach. You can move the target through your space during this movement. This follows the forced movement rules. Your Strike gains the following failure effect.",
    },
  ],
};
(async () => {
  const actionHeader = ({ actions, name, tags }) => `
    <hr style="margin-top: 0; margin-bottom: 3px;" />
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
  `;
  const actionBody = ({ content }) => {
    const checkTitle = (paragraph) =>
      typeof paragraph === "object"
        ? `<strong>${paragraph.title}</strong> ${paragraph.text}`
        : paragraph;
    return `
      <div style="font-weight: 500;">
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
  const actionFormat = ({ actions, name, tags, content }) =>
    `<div style="font-size: 14px; line-height: 16.8px; color: #191813;">
      ${actionHeader({ actions, name, tags })}${actionBody({ content })}
    </div>`;
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
  const buttonFormat = (action, modifiers) => {
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
    let buttonHTML = "";
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i]) {
        buttonHTML += `
            <button
              class="dialog-button ${slugify(action.name)}${i}"
              data-button="${slugify(action.name)}${i}"
              style="margin-bottom:5px;"
            >${buttons[i]}</button>
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
  const damage = ({ crit }) => {
    const options = actor.getRollOptions([
      "all",
      "str-based",
      "damage",
      "damage-roll",
    ]);
    if (crit) {
      strikeItem.critical({
        event,
        options,
        callback: (rollData) => {
          console.log(rollData);
          if (weapon.critical) {
            const criticalContent = {
              actions: "Passive",
              name: "Critical Effects",
              content: weapon.critical.content,
            };
            if (weapon.critical.rollData) {
              DicePF2e.damageRoll({
                event,
                parts: [
                  `${
                    weapon.critical.rollData.multiplier
                      ? `${weapon.critical.rollData.multiplier}*`
                      : ""
                  }${
                    rollData.diceResults[weapon.critical.rollData.selectors[0]][
                      weapon.critical.rollData.selectors[1]
                    ]
                  }`,
                ],
                actor,
                data: actor.data.data,
                title: `${actionFormat(criticalContent)}<hr />`,
                speaker: ChatMessage.getSpeaker(),
              });
            } else {
              ChatMessage.create({
                user: game.user._id,
                speaker: ChatMessage.getSpeaker(),
                content: actionFormat(criticalContent),
              });
            }
          }
        },
      });
    } else {
      strikeItem.damage({ event, options });
    }
  };
  const strikeAction = {
    actions: "OneAction",
    name: `${weapon.name} Strike`,
    attack: true,
    tags: weapon.tags,
  };
  const dialog = new Dialog(
    {
      title: " ",
      content: `
      ${[strikeAction, ...(weapon.actions ?? [])]
        .map(
          (action) =>
            `${actionHeader(action)}${buttonFormat(action, modifiers)}`
        )
        .join("")}
      ${actionHeader({ actions: "Passive", name: "Damage" })}
    `,
      buttons: {
        damage: {
          label: "✔️",
          callback: () => {
            damage({ crit: false });
          },
        },
        critical: {
          label: "💥",
          callback: () => {
            damage({ crit: true });
          },
        },
      },
    },
    { width: 300 }
  );
  dialog.render(true);
  for (let MAP = 0; MAP < 3; MAP++) {
    dialog.data.buttons[`${slugify(strikeAction.name)}${MAP}`] = {
      callback: () => {
        strike(MAP);
      },
    };
  }
  if (weapon.actions) {
    for (const action of weapon.actions) {
      for (let MAP = 0; MAP < 3; MAP++) {
        dialog.data.buttons[`${slugify(action.name)}${MAP}`] = {
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
  }
})();
