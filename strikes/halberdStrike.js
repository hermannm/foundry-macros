const weapon = {
  name: "Halberd",
  damageTypes: ["Piercing", "Slashing"],
  tags: ["Attack", "Polearm", "Reach", "Versatile S"],
  description:
    "This polearm has a relatively short, 5-foot shaft. The business end is a long spike with an axe blade attached.",
  criticalSpecialization: {
    group: "Polearm",
    description:
      "The target is moved 5 feet in a direction of your choice. This is forced movement.",
  },
};
(async () => {
  const strikeItem = (actor.data.data.actions ?? [])
    .filter((action) => action.type === "strike")
    .find((strike) => strike.name === weapon.name);
  const shortDamageTypes = weapon.damageTypes.map((damageType) =>
    damageType.charAt(0).toLowerCase()
  );
  console.log(shortDamageTypes);
  const actionFormat = ({ actions, name, tags, content }) => `
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
      ${content.join("<hr />")}
    </div>
  `;
  const strike = (MAP) => {
    switch (MAP) {
      case 1:
        strikeItem.attack(event);
        break;
      case 2:
        strikeItem.variants[1]?.roll(event);
        break;
      case 3:
        strikeItem.variants[2]?.roll(event);
        break;
    }
  };
  const damage = ({ crit, type }) => {
    let options = actor.getRollOptions([
      "all",
      "str-based",
      "damage",
      "damage-roll",
    ]);
    if (type !== shortDamageTypes[0]) {
      if (!options.includes(`versatile-${type}`)) {
        options.push(`versatile-${type}`);
      }
      for (const damageType of shortDamageTypes) {
        if (type !== damageType) {
          if (options.includes(`versatile-${damageType}`)) {
            options = options.filter(
              (option) => option !== `versatile-${damageType}`
            );
          }
        }
      }
    }
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
      strikeItem.critical(event, options, (rollData) => {
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
      });
    } else {
      strikeItem.damage(event, options);
    }
    if (versatileTrait) {
      strikeItem.traits.find(
        (trait) => trait.name === `not-${versatileTrait}`
      ).name = versatileTrait;
      console.log(strikeItem);
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
            weapon.description,
            `<strong>Critical Specialization</strong>
             ${weapon.criticalSpecialization.description}`,
          ].join(`<div style="margin-bottom: 5px;"></div>`),
        ],
      })}
      <div class="dialog-buttons" style="margin-top: 5px;">
        <button
          class="dialog-button firstStrike"
          data-button="firstStrike"
          style="margin-bottom:5px;"
        >
          1st (${modToString(modifiers[0])})
        </button>
        <button
          class="dialog-button secondStrike"
          data-button="secondStrike"
          style="margin-bottom:5px;"
        >
          2nd (${modToString(modifiers[1])})
        </button>
        <button
          class="dialog-button thirdStrike"
          data-button="thirdStrike"
          style="margin-bottom:5px;"
        >
          3rd (${modToString(modifiers[2])})
        </button>
      </div>
      <hr />
      <div style="font-weight: 500; font-size: 14px;">
        <strong>Versatile </strong>
         A versatile weapon can be used to deal a different type of damage than that listed in the Damage entry. You choose the damage type each time you make an attack.
      </div>
      <div style="
        display: flex;
        margin-top: 5px;
      ">
        ${weapon.damageTypes
          .map(
            (damageType) => `
              <div style="
                flex-basis: 50%;
                display: flex;
                justify-content: center;
              ">
                <strong>${damageType}</strong>
              </div>
            `
          )
          .join("")}
      </div>
      <div class="dialog-buttons">
        ${shortDamageTypes
          .map(
            (damageType) => `
              <button
                class="dialog-button damage-${damageType}"
                data-button="damage-${damageType}"
                style="margin-bottom:5px;"
              >
                ✔️
              </button>
            `
          )
          .join("")}
      </div>
    `,
    buttons: {},
  });
  for (const damageType of shortDamageTypes) {
    dialog.data.buttons[`critical-${damageType}`] = {
      label: "💥",
      callback: () => {
        damage(true, damageType);
      },
    };
  }
  dialog.render(true);
  for (const damageType of shortDamageTypes) {
    dialog.data.buttons[`damage-${damageType}`] = {
      callback: () => {
        damage(false, damageType);
      },
    };
  }
  dialog.data.buttons.firstStrike = {
    callback: () => {
      strike(1);
    },
  };
  dialog.data.buttons.secondStrike = {
    callback: () => {
      strike(2);
    },
  };
  dialog.data.buttons.thirdStrike = {
    callback: () => {
      strike(3);
    },
  };
})();
