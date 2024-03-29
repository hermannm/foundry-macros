const actions = [
  (godless) => ({
    actions: "Passive",
    name: "Treat Wounds",
    buttonLabel: godless ? "Self" : "Standard",
    healing: godless
      ? [
          "2d8+15",
          {
            action: {
              actions: "Passive",
              name: "Godless Healing",
              content: [
                "You recover an additional 5 Hit Points from a successful attempt to Treat your Wounds.",
              ],
            },
            roll: "5",
          },
        ]
      : "2d8+15",
    tags: ["Exploration", "Healing", "Manipulate"],
    content: [
      "You spend 10 minutes treating up to four injured living creatures (targeting yourself, if you so choose).",
    ],
  }),
  (godless) => ({
    actions: "OneAction",
    name: "Battle Medicine",
    buttonLabel: godless ? "Self" : "Standard",
    healing: godless ? "2d8+20" : "2d8+15",
    tags: ["Healing", "Manipulate"],
    content: [
      {
        title: "Requirements",
        text: "You are holding or wearing healer's tools.",
      },
      "You can patch up yourself or an adjacent ally, even in combat. Attempt a Medicine check with the same DC as for Treat Wounds, and restore a corresponding amount of Hit Points; this does not remove the wounded condition. The target is then temporarily immune to your Battle Medicine for 1 day.",
      {
        title: "Medic",
        text: "Once per day, you can use Battle Medicine on a creature that's temporarily immune.",
      },
      {
        title: "Doctor's Visitation (flourish)",
        text: "Stride, then use Battle Medicine.",
      },
      ...(godless
        ? [
            {
              title: "Godless Healing",
              text: "You recover an additional 5 Hit Points from a successful attempt to use Battle Medicine on you. After you or an ally use Battle Medicine on you, you become temporarily immune to that Battle Medicine for only 1 hour, instead of 1 day.",
            },
          ]
        : []),
    ],
  }),
  {
    actions: "OneAction",
    name: "Treat Poison",
    skill: "Medicine",
    tags: ["Manipulate"],
    content: [
      {
        title: "Requirements",
        text: "You are holding healer's tools, or you are wearing them and have a hand free.",
      },
      [
        "You treat a patient to prevent the spread of poison. Attempt a Medicine check against the poison's DC. After you attempt to Treat a Poison for a creature, you can't try again until after the next time that creature attempts a save against the poison.",
        {
          title: "Critical Success",
          text: "You grant the creature a +4 circumstance bonus to its next saving throw against the poison.",
        },
        {
          title: "Success",
          text: "You grant the creature a +2 circumstance bonus to its next saving throw against the poison.",
        },
        {
          title: "Critical Failure",
          text: "Your efforts cause the creature to take a -2 circumstance penalty to its next save against the poison.",
        },
      ],
      {
        title: "Doctor's Visitation (flourish)",
        text: "Stride, then use Treat Poison.",
      },
    ],
  },
  {
    actions: "TwoActions",
    name: "Administer First Aid",
    skill: "Medicine",
    tags: ["Manipulate"],
    content: [
      {
        title: "Requirements",
        text: "You are holding healer's tools, or you are wearing them and have a hand free.",
      },
      [
        "You perform first aid on an adjacent creature that is dying or bleeding. If a creature is both dying and bleeding, choose which ailment you're trying to treat before you roll. You can Administer First Aid again to attempt to remedy the other effect.",
        {
          title: "Stabilize",
          text: "Attempt a Medicine check on a creature that has 0 Hit Points and the dying condition. The DC is equal to 5 + that creature's recovery roll DC (typically 15 + its dying value).",
        },
        {
          title: "Stop Bleeding",
          text: "Attempt a Medicine check on a creature that is taking persistent bleed damage (page 452), giving them a chance to make another flat check to remove the persistent damage. The DC is usually the DC of the effect that caused the bleed.",
        },
        {
          title: "Success",
          text: "If you're trying to stabilize, the creature loses the dying condition (but remains unconscious). If you're trying to stop bleeding, the creature attempts a flat check to end the bleeding.",
        },
        {
          title: "Critical Failure",
          text: "If you were trying to stabilize, the creature's dying value increases by 1. If you were trying to stop bleeding, it immediately takes an amount of damage equal to its persistent bleed damage.",
        },
      ],
      {
        title: "Doctor's Visitation (flourish)",
        text: "Stride, then use Administer First Aid.",
      },
    ],
  },
];

(async () => {
  const dialogButtons = [];

  const slugify = (string) =>
    // Borrowed from https://gist.github.com/codeguy/6684588
    string
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const skillRoll = ({ name, skill, tags }) => {
    const options = [
      ...actor.getRollOptions(["all", "wis-based", "skill-check", skill.toLowerCase()]),
      ...(tags ? tags.map((tag) => slugify(tag)) : []),
      ...[`action:${slugify(name)}`],
    ];

    actor.data.data.skills[
      Object.entries(actor.data.data.skills).find(
        (entry) => entry[1].name === skill.toLowerCase()
      )[0]
    ].roll({ event, options });
  };

  const chatMessage = (content) => {
    ChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content,
    });
  };

  const damageRoll = (content, damage) => {
    game.pf2e.Dice.damageRoll({
      event,
      parts: [damage],
      actor,
      data: actor.data.data,
      title: `${content}<hr />`,
      speaker: ChatMessage.getSpeaker(),
    });
  };

  const formatActionHeader = ({ actions, name, tags }) => `
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

  const formatActionBody = ({ content }) => {
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

  const formatAction = ({ actions, name, tags, content }) => `
    <div style="font-size: 14px; line-height: 16.8px; color: #191813;">
      ${formatActionHeader({ actions, name, tags })}
      ${formatActionBody({ content })}
    </div>
  `;

  const executeAction = (action) => {
    if (action.damage || action.healing) {
      if (Array.isArray(action.damage ?? action.healing)) {
        for (const roll of action.damage ?? action.healing) {
          if (typeof roll === "object") {
            damageRoll(formatAction(roll.action), roll.roll);
          } else {
            damageRoll(formatAction(action), roll);
          }
        }
      } else {
        damageRoll(formatAction(action), action.damage ?? action.healing);
      }
    } else {
      chatMessage(formatAction(action));
    }

    if (action.skill) {
      skillRoll(action);
    }
  };

  const getButtonID = ({ name, buttonLabel }) =>
    `${slugify(name)}-${buttonLabel ? slugify(buttonLabel) : ""}`;

  const createActionButton = (action) => {
    const actionButton = {
      id: getButtonID(action),
      label: action.buttonLabel ?? action.name,
      callback: () => executeAction(action),
    };

    dialogButtons.push(actionButton);

    return actionButton;
  };

  const formatButtons = (buttons) => {
    let buttonFormat = "";

    for (const button of buttons) {
      buttonFormat += `
      <button
        class="dialog-button ${button.id}"
        data-button="${button.id}"
        style="margin-bottom:5px;"
      >
        ${button.label}
      </button>
    `;
    }

    return `<div class="dialog-buttons" style="margin-top: 5px;">${buttonFormat}</div>`;
  };

  const formatDialog = () => {
    let dialogFormat = "";

    for (const action of actions) {
      if (typeof action === "function") {
        dialogFormat += formatActionHeader(action());
        dialogFormat += formatButtons([
          createActionButton(action()),
          createActionButton(action(true)),
        ]);
      } else {
        dialogFormat += formatActionHeader(action);
        dialogFormat += formatButtons([createActionButton(action)]);
      }
    }

    dialogFormat += `<div style="margin-top: -5px"></div>`;

    return dialogFormat;
  };

  const dialog = new Dialog(
    {
      title: " ",
      content: formatDialog(),
      buttons: {},
    },
    { width: 300 }
  );
  dialog.render(true);

  for (const button of dialogButtons) {
    dialog.data.buttons[button.id] = {
      callback: button.callback,
    };
  }
})();
