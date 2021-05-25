const weapon = {
  name: "Halberd",
  tags: ["Reach", "Versatile S"],
  actions: [
    {
      name: "Sudden Charge",
      actions: "TwoActions", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
      strike: true,
      tags: ["Fighter", "Flourish", "Open"],
      description:
        "With a quick sprint, you dash up to your foe and swing. Stride twice. If you end your movement within melee reach of at least one enemy, you can make a melee Strike against that enemy. You can use Sudden Charge while Burrowing, Climbing, Flying, or Swimming instead of Striding if you have the corresponding movement type.",
    },
    {
      name: "Intimidating Strike",
      actions: "TwoActions", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
      strike: true,
      tags: ["Emotion", "Fear", "Fighter", "Mental"],
      description:
        "Your blow not only wounds creatures but also shatters their confidence. Make a melee Strike. If you hit and deal damage, the target is frightened 1, or frightened 2 on a critical hit.",
    },
    {
      name: "Positioning Assault",
      actions: "TwoActions", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
      strike: true,
      tags: ["Fighter", "Flourish"],
      requirements:
        "You are wielding a two-handed melee weapon and your target is within your reach.",
      description:
        "With punishing blows, you force your opponent into position. Make a Strike with the required weapon. If you hit, you move the target 5 feet into a space in your reach. This follows the forced movement rules.",
    },
    {
      name: "Brutish Shove",
      actions: "OneAction", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
      strike: true,
      tags: ["Fighter", "Press"],
      requirements: "You are wielding a two-handed melee weapon.",
      description: [
        "Throwing your weight behind your attack, you hit your opponent hard enough to make it stumble back. Make a Strike with a two-handed melee weapon. If you hit a target that is up to two sizes larger than you, that creature is flat-footed until the end of your current turn, and you can automatically Shove it, with the same benefits as the Shove action (including the critical success effect, if your Strike was a critical hit). If you move to follow the target, your movement doesn’t trigger reactions.",
        {
          title: "Powerful Shove",
          text: "When a creature you Shove has to stop moving because it would hit an object, it takes damage equal to your Strength modifier (minimum 1). This happens regardless of how you Shoved the creature.",
        },
      ],
      failure:
        "The target becomes flat-footed until the end of your current turn.",
    },
  ],
};

const getStrikeItem = () =>
  (actor.data.data.actions ?? [])
    .filter((action) => action.type === "strike")
    .find((strike) => strike.name === weapon.name);

const modifiers = getStrikeItem().variants.map((variant) => {
  let modifier = getStrikeItem().totalModifier;
  const splitLabel = variant.label.split(" ");
  if (splitLabel[0] === "MAP") {
    modifier += parseInt(splitLabel[1]);
  }
  return modifier;
});

const dialogButtons = [];

const slugify = (string) =>
  // borrowed from https://gist.github.com/codeguy/6684588
  string
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const strike = (strikeIndex) => {
  const options = actor.getRollOptions([
    "all",
    "str-based",
    "attack",
    "attack-roll",
  ]);
  if (weapon.tags) {
    options.push(...weapon.tags.map((tag) => slugify(tag)));
  }
  getStrikeItem().variants[strikeIndex].roll({ event, options });
};

const executeWithEffect = async ({ effect, callback }) => {
  await actor.addCustomModifier(
    effect.modifier.stat,
    effect.name,
    effect.modifier.value,
    effect.modifier.type ?? "untyped"
  );
  callback();
  await actor.removeCustomModifier(effect.modifier.stat, effect.name);
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

const structureActionContent = (action) => {
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
  return content;
};

const damage = ({ crit, damageType }) => {
  const options = actor.getRollOptions([
    "all",
    "str-based",
    "damage",
    "damage-roll",
  ]);

  if (damageType) {
    const versatileTag = `versatile-${damageType}`;
    if ((weapon.tags ?? []).find((tag) => slugify(tag) === versatileTag)) {
      options.push(versatileTag);
    }
  }

  if (crit) {
    getStrikeItem().critical({
      event,
      options,
      callback: (rollData) => {
        if (weapon.criticalEffects) {
          for (const criticalEffect of weapon.criticalEffects) {
            const criticalEffectAction = {
              ...criticalEffect,
              actions: "Passive",
            };
            if (criticalEffect.rollData) {
              DicePF2e.damageRoll({
                event,
                parts: [
                  `${
                    criticalEffect.rollData.multiplier
                      ? `${criticalEffect.rollData.multiplier}*`
                      : ""
                  }${
                    rollData.diceResults[criticalEffect.rollData.selectors[0]][
                      criticalEffect.rollData.selectors[1]
                    ]
                  }`,
                ],
                actor,
                data: actor.data.data,
                title: `${formatAction(criticalEffectAction)}<hr />`,
                speaker: ChatMessage.getSpeaker(),
              });
            } else {
              ChatMessage.create({
                user: game.user._id,
                speaker: ChatMessage.getSpeaker(),
                content: formatAction(criticalEffectAction),
              });
            }
          }
        }
      },
    });
  } else {
    getStrikeItem().damage({ event, options });
  }
};

const modToString = (modifier) =>
  modifier >= 0 ? `+${modifier}` : `${modifier}`;

const strikeIndexToLabel = (strikeIndex) => {
  switch (strikeIndex) {
    case 0:
      return "1st";
    case 1:
      return "2nd";
    case 2:
      return "3rd";
  }
};

const createActionButton = ({ action, modifier, strikeIndex, effect }) => {
  let id = slugify(action.name);
  if (effect) {
    id += `-${slugify(effect.name)}`;
  }
  if (strikeIndex !== undefined) {
    id += `-${strikeIndex}`;
  }

  let label =
    strikeIndex !== undefined && action.strike && action.actions !== "Reactions"
      ? strikeIndexToLabel(strikeIndex)
      : action.name;
  if (strikeIndex !== undefined || modifier) {
    let appliedModifier = modifier ?? modifiers[strikeIndex];
    if (effect) {
      appliedModifier += effect.modifier.value;
    }
    label += ` (${modToString(appliedModifier)})`;
  }

  let disabled = false;
  if (strikeIndex !== undefined) {
    if (strikeIndex === 0) {
      if ((action.tags ?? []).includes("Press")) {
        disabled = true;
      }
    } else {
      if (
        action.actions === "ThreeActions" ||
        (action.tags ?? []).includes("Open")
      ) {
        disabled = true;
      } else if (strikeIndex === 2 && action.actions === "TwoActions") {
        disabled = true;
      }
    }
  }

  const actionButton = {
    id,
    label,
    disabled,
    callback: () => {
      if (action.name !== `${weapon.name} Strike`) {
        ChatMessage.create({
          user: game.user._id,
          speaker: ChatMessage.getSpeaker(),
          content: `
            ${formatAction({
              ...action,
              content: structureActionContent(action),
            })}
          `,
        });
      }
      if (strikeIndex !== undefined) {
        if (effect) {
          executeWithEffect({ effect, callback: () => strike(strikeIndex) });
        } else {
          strike(strikeIndex);
        }
      }
    },
  };

  if (!actionButton.disabled) {
    dialogButtons.push(actionButton);
  }

  return actionButton;
};

const createActionButtons = ({ action, effect }) => {
  const actionButtons = [];

  if (action.actions === "Reaction") {
    actionButtons.push(createActionButton({ action, strikeIndex: 0, effect }));
  } else {
    for (let strikeIndex = 0; strikeIndex < 3; strikeIndex++) {
      actionButtons.push(createActionButton({ action, strikeIndex, effect }));
    }
  }

  return actionButtons;
};

const createDamageButton = ({ crit, damageType, effect }) => {
  let id = crit ? "critical" : "damage";
  if (effect) {
    id += `-${slugify(effect.name)}`;
  }
  if (damageType) {
    id += `-${damageType}`;
  }

  const damageButton = {
    id,
    label: crit ? `💥` : `✔️`,
    callback: () => {
      if (effect) {
        executeWithEffect({
          effect,
          callback: () => damage({ crit, damageType }),
        });
      } else {
        damage({ crit, damageType });
      }
    },
    effect,
  };

  dialogButtons.push(damageButton);

  return damageButton;
};

const createDamageButtons = ({ damageType, effect }) => {
  const damageButtons = [
    createDamageButton({ crit: false, damageType, effect }),
    createDamageButton({ crit: true, damageType, effect }),
  ];
  return damageButtons;
};

const formatButtons = (buttons) => {
  let buttonFormat = "";
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    buttonFormat += button.disabled
      ? `
        <div style="
          margin-bottom: 5px;
          ${i === buttons.length - 1 ? "" : "margin-right: 5px;"}
          padding: 1px 6px;
          border: 2px groove #f0f0e0;
          border-radius: 3px;
          text-align: center;
          font-family: Signika, sans-serif;
          font-size: 14px;
          color: #4b4a44;
          line-height: 28px;
        ">
          ${button.label}
        </div>
      `
      : `
        <button
          class="dialog-button ${button.id}"
          data-button="${button.id}"
          style="
            margin-bottom: 5px;
            ${button.disabled ? "visibility: hidden;" : ""}
          "
        >${button.label}</button>
      `;
  }
  return `<div class="dialog-buttons" style="margin-top: 5px;">${buttonFormat}</div>`;
};

const formatTitle = (title) => `
  <div style="
    display: flex;
    justify-content: center;
    margin-bottom: 5px;
  "><strong>${title}</strong></div>
`;

const formatDialogAction = (action) => {
  let actionFormat = "";

  actionFormat += formatActionHeader(action);
  actionFormat += formatButtons(createActionButtons({ action }));

  if (weapon.effects) {
    for (const effect of weapon.effects) {
      if (effect.modifier.stat === "attack") {
        actionFormat += formatTitle(effect.name);
        actionFormat += formatButtons(createActionButtons({ action, effect }));
      }
    }
  }

  return actionFormat;
};

const formatDialog = () => {
  let dialogFormat = "";

  if (weapon.strikeAction) {
    dialogFormat += formatDialogAction({
      actions: "OneAction",
      name: `${weapon.name} Strike`,
      strike: true,
      tags: weapon.tags,
    });
  }

  if (weapon.actions) {
    for (const action of weapon.actions) {
      dialogFormat += formatDialogAction(action);
    }
  }

  if (weapon.damage) {
    dialogFormat += formatActionHeader({
      actions: "Passive",
      name: "Damage",
    });
    if (Array.isArray(weapon.damage)) {
      for (const damageType of weapon.damage) {
        dialogFormat += formatTitle(damageType);
        dialogFormat += formatButtons(
          createDamageButtons({
            damageType: damageType.charAt(0).toLowerCase(),
          })
        );
      }
      if (weapon.effects) {
        for (const effect of weapon.effects) {
          if (effect.modifier.stat === "damage") {
            dialogFormat += formatTitle(effect.name.toUpperCase());
            for (const damageType of weapon.damage) {
              dialogFormat += formatTitle(damageType);
              dialogFormat += formatButtons(
                createDamageButtons({
                  damageType: damageType.charAt(0).toLowerCase(),
                  effect,
                })
              );
            }
          }
        }
      }
    } else {
      dialogFormat += formatButtons(createDamageButtons({}));
      if (weapon.effects) {
        for (const effect of weapon.effects) {
          if (effect.modifier.stat === "damage") {
            dialogFormat += formatTitle(effect.name);
            dialogFormat += formatButtons(createDamageButtons({ effect }));
          }
        }
      }
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
