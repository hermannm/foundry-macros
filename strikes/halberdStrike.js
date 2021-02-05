const weapon = {
  name: "Halberd",
  damageTypes: ["Piercing", "Slashing"],
  tags: ["Attack", "Reach", "Versatile S"],
  description: [
    "This polearm has a relatively short, 5-foot shaft. The business end is a long spike with an axe blade attached.",
    {
      title: "Versatile",
      text:
        "A versatile weapon can be used to deal a different type of damage than that listed in the Damage entry. You choose the damage type each time you make an attack.",
    },
  ],
  criticalSpecialization: {
    group: "Polearm",
    description:
      "The target is moved 5 feet in a direction of your choice. This is forced movement.",
  },
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
  const strike = (MAP) => {
    const options = [
      ...actor.getRollOptions(["all", "str-based", "attack", "attack-roll"]),
      ...(weapon.tags ? weapon.tags.map((tag) => slugify(tag)) : []),
    ];
    strikeItem.variants[MAP].roll({ event, options });
  };
  const damage = ({ crit, damageType }) => {
    const options = [
      ...actor.getRollOptions(["all", "str-based", "damage", "damage-roll"]),
      ...(weapon.tags ? weapon.tags.map((tag) => slugify(tag)) : []).filter(
        (tag) => !tag.startsWith("versatile") || tag.slice(-1) === damageType
      ),
    ];
    // temporary fix until versatile is fixed
    const versatileTrait = strikeItem.traits.find(
      (trait) =>
        trait.name.startsWith("versatile-") && !options.includes(trait.name)
    )?.name;
    if (versatileTrait) {
      strikeItem.traits.find(
        (trait) => trait.name === versatileTrait
      ).name = `not-${versatileTrait}`;
    }
    //
    if (crit) {
      strikeItem.critical({
        event,
        options,
        callback: () => {
          if (weapon.criticalSpecialization) {
            ChatMessage.create({
              user: game.user._id,
              speaker: ChatMessage.getSpeaker(),
              content: actionFormat({
                actions: "Passive",
                name: `Critical Specialization`,
                tags: [weapon.criticalSpecialization.group],
                content: [weapon.criticalSpecialization.description],
              }),
            });
          }
        },
      });
    } else {
      strikeItem.damage({ event, options });
    }
    if (versatileTrait) {
      strikeItem.traits.find(
        (trait) => trait.name === `not-${versatileTrait}`
      ).name = versatileTrait;
    }
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
    content: `
      ${actionFormat({
        actions: "OneAction",
        name: `${weapon.name} Strike`,
        tags: weapon.tags,
        content: [
          [
            ...weapon.description,
            {
              title: "Critical Specialization",
              text: weapon.criticalSpecialization.description,
            },
          ],
        ],
      })}
      <div class="dialog-buttons" style="margin-top: 5px;">
        ${["1st", "2nd", "3rd"]
          .map(
            (buttonText, index) => `
            <button
              class="dialog-button strike${index}"
              data-button="strike${index}"
              style="margin-bottom:5px;"
            >
              ${buttonText} (${modToString(modifiers[index])})
            </button>
          `
          )
          .join("")}
      </div>
      <hr />
      ${weapon.damageTypes
        .slice(0, -1)
        .map(
          (damageType) => `
            <div style="
              display: flex;
              justify-content: center;
              margin-bottom: 5px;
            "><strong>${damageType}</strong></div>
          `
        )
        .join("")}
      <div class="dialog-buttons">
        ${weapon.damageTypes
          .slice(0, -1)
          .map(
            (damageType) => `
              <button
                class="dialog-button damage-${damageType.toLowerCase()}"
                data-button="damage-${damageType.toLowerCase()}"
                style="margin-bottom:5px;"
              >
                ✔️
              </button>
              <button
                class="dialog-button critical-${damageType.toLowerCase()}"
                data-button="critical-${damageType.toLowerCase()}"
                style="margin-bottom:5px;"
              >
                💥
              </button>
            `
          )
          .join("")}
      </div>
      <div style="
        display: flex;
        justify-content: center;
        margin-bottom: 5px;
      "><strong>${
        weapon.damageTypes[weapon.damageTypes.length - 1]
      }</strong></div>
    `,
    buttons: {
      [`damage-${weapon.damageTypes[
        weapon.damageTypes.length - 1
      ].toLowerCase()}`]: {
        label: "✔️",
        callback: () => {
          damage({
            crit: false,
            damageType: weapon.damageTypes[weapon.damageTypes.length - 1]
              .charAt(0)
              .toLowerCase(),
          });
        },
      },
      [`critical-${weapon.damageTypes[
        weapon.damageTypes.length - 1
      ].toLowerCase()}`]: {
        label: "💥",
        callback: () => {
          damage({
            crit: true,
            damageType: weapon.damageTypes[weapon.damageTypes.length - 1]
              .charAt(0)
              .toLowerCase(),
          });
        },
      },
    },
  });
  dialog.render(true);
  for (const damageType of weapon.damageTypes.slice(0, -1)) {
    dialog.data.buttons[`damage-${damageType.toLowerCase()}`] = {
      callback: () => {
        damage({ crit: false, damageType: damageType.charAt(0).toLowerCase() });
      },
    };
    dialog.data.buttons[`critical-${damageType.toLowerCase()}`] = {
      callback: () => {
        damage({ crit: true, damageType: damageType.charAt(0).toLowerCase() });
      },
    };
  }
  for (let i = 0; i < 3; i++) {
    dialog.data.buttons[`strike${i}`] = {
      callback: () => {
        strike(i);
      },
    };
  }
})();
