const weapon = {
  name: "Halberd",
  tags: ["Attack", "Versatile S"],
  damageTypes: ["Piercing", "Slashing"],
  criticalEffects: [
    {
      name: "Shock",
      content: [
        "On a critical hit, electricity arcs out to deal an equal amount of electricity damage to up to two other creatures of your choice within 10 feet of the target.",
      ],
      rollData: {
        selectors: ["electricity", "energy"],
        multiplier: 2,
      },
    },
  ],
  actions: [
    {
      name: "Sudden Charge",
      actions: "TwoActions", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
      attack: true,
      tags: ["Fighter", "Flourish", "Open"],
      description:
        "With a quick sprint, you dash up to your foe and swing. Stride twice. If you end your movement within melee reach of at least one enemy, you can make a melee Strike against that enemy. You can use Sudden Charge while Burrowing, Climbing, Flying, or Swimming instead of Striding if you have the corresponding movement type.",
    },
    {
      name: "Intimidating Strike",
      actions: "TwoActions", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
      attack: true,
      tags: ["Emotion", "Fear", "Fighter", "Mental"],
      description:
        "Your blow not only wounds creatures but also shatters their confidence. Make a melee Strike. If you hit and deal damage, the target is frightened 1, or frightened 2 on a critical hit.",
    },
    {
      name: "Positioning Assault",
      actions: "TwoActions", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
      attack: true,
      tags: ["Fighter", "Flourish"],
      requirements:
        "You are wielding a two-handed melee weapon and your target is within your reach.",
      description:
        "With punishing blows, you force your opponent into position. Make a Strike with the required weapon. If you hit, you move the target 5 feet into a space in your reach. This follows the forced movement rules.",
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
  const damage = ({ crit, damageType }) => {
    console.log(strikeItem);
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
      strikeItem.critical({
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
                      rollData.diceResults[
                        criticalEffect.rollData.selectors[0]
                      ][criticalEffect.rollData.selectors[1]]
                    }`,
                  ],
                  actor,
                  data: actor.data.data,
                  title: `${actionFormat(criticalEffectAction)}<hr />`,
                  speaker: ChatMessage.getSpeaker(),
                });
              } else {
                ChatMessage.create({
                  user: game.user._id,
                  speaker: ChatMessage.getSpeaker(),
                  content: actionFormat(criticalEffectAction),
                });
              }
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
      ${
        weapon.damageTypes
          ? `
            ${weapon.damageTypes
              .slice(0, -1)
              .map(
                (damageType) => `
                  <div style="
                    display: flex;
                    justify-content: center;
                    margin-bottom: 5px;
                  "><strong>${damageType}</strong></div>
                  <div class="dialog-buttons">
                    <button
                      class="dialog-button damage-${damageType
                        .charAt(0)
                        .toLowerCase()}"
                      data-button="damage-${damageType.charAt(0).toLowerCase()}"
                      style="margin-bottom:5px;"
                    >
                      ✔️
                    </button>
                    <button
                      class="dialog-button critical-${damageType
                        .charAt(0)
                        .toLowerCase()}"
                      data-button="critical-${damageType
                        .charAt(0)
                        .toLowerCase()}"
                      style="margin-bottom:5px;"
                    >
                      💥
                    </button>
                  </div>
                `
              )
              .join("")}
            <div style="
              display: flex;
              justify-content: center;
              margin-bottom: 5px;
            "><strong>${
              weapon.damageTypes[weapon.damageTypes.length - 1]
            }</strong></div>
            `
          : ""
      }
    `,
      buttons: {},
    },
    { width: 300 }
  );
  if (weapon.damageTypes) {
    const lastDamageType = weapon.damageTypes[weapon.damageTypes.length - 1]
      .charAt(0)
      .toLowerCase();
    dialog.data.buttons[`damage-${lastDamageType}`] = {
      label: "✔️",
      callback: () => {
        damage({ crit: false, damageType: lastDamageType });
      },
    };
    dialog.data.buttons[`critical-${lastDamageType}`] = {
      label: "💥",
      callback: () => {
        damage({ crit: true, damageType: lastDamageType });
      },
    };
  } else {
    dialog.data.buttons.damage = {
      label: "✔️",
      callback: () => {
        damage({ crit: false });
      },
    };
    dialog.data.buttons.critical = {
      label: "💥",
      callback: () => {
        damage({ crit: true });
      },
    };
  }
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
  if (weapon.damageTypes) {
    for (const fullDamageType of weapon.damageTypes.slice(0, -1)) {
      const damageType = fullDamageType.charAt(0).toLowerCase();
      dialog.data.buttons[`damage-${damageType}`] = {
        callback: () => {
          damage({
            crit: false,
            damageType: damageType,
          });
        },
      };
      dialog.data.buttons[`critical-${damageType}`] = {
        callback: () => {
          damage({
            crit: true,
            damageType: damageType,
          });
        },
      };
    }
  }
})();
