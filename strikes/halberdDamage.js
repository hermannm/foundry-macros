const weapon = {
  name: "Halberd",
  damageType: ["Piercing", "Slashing"],
  tags: ["Attack", "Reach", "Versatile S"],
  criticalSpecialization: {
    group: "Polearm",
    description:
      "The target is moved 5 feet in a direction of your choice. This is forced movement.",
  },
};
(async () => {
  const versatile = Array.isArray(weapon.damageType)
    ? weapon.damageType.map((damageType) => damageType.charAt(0).toLowerCase())
    : false;
  const damage = (crit, damageType) => {
    let options = actor.getRollOptions([
      "all",
      "str-based",
      "damage",
      "damage-roll",
    ]);
    if (damageType && versatile) {
      if (damageType !== versatile[0]) {
        if (!options.includes(`versatile-${damageType}`)) {
          options.push(`versatile-${damageType}`);
        }
        for (const type of versatile) {
          if (type !== damageType) {
            if (options.includes(`versatile-${type}`)) {
              options = options.filter(
                (option) => option !== `versatile-${type}`
              );
            }
          }
        }
      }
    }
    const strikeItem = (actor.data.data.actions ?? [])
      .filter((action) => action.type === "strike")
      .find((strike) => strike.name === weapon.name);
    // temporary fix until versatile is fixed
    const versatileTrait = strikeItem.traits.find(
      (trait) =>
        trait.name.startsWith("versatile-") && !options.includes(trait.name)
    )?.name;
    console.log(versatileTrait);
    if (versatileTrait) {
      strikeItem.traits.find(
        (trait) => trait.name === versatileTrait
      ).name = `not-${versatileTrait}`;
      console.log(strikeItem);
    }
    if (crit) {
      strikeItem.critical(event, options, (rollData) => {
        if (weapon.criticalSpecialization) {
          ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: `
            <hr style="margin-top: 0; margin-bottom: 3px;" />
              <header style="display: flex;">
                <img
                  style="flex: 0 0 36px; margin-right: 5px;"
                  src="systems/pf2e/icons/actions/Passive.png"
                  title="Critical Specialization"
                  width="36"
                  height="36"
                >
                <h3 style="flex: 1; line-height: 36px; margin: 0;">
                  Critical Specialization (${weapon.criticalSpecialization.group})
                </h3>
              </header>
              <hr style="margin-top: 3px;" />
              <div style="font-weight: 500; font-size: 14px;">
                ${weapon.criticalSpecialization.description}
              </div>
            `,
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
  const dialog = new Dialog({
    title: `${weapon.name} Damage`,
    content: `
      <header style="display: flex;">
        <img
          style="flex: 0 0 36px; margin-right: 5px;"
          src="systems/pf2e/icons/actions/Passive.png"
          title="${weapon.name} Damage"
          width="36"
          height="36"
        >
        <h3 style="flex: 1; line-height: 36px; margin: 0;">
          ${weapon.name} Damage
        </h3>
      </header>
      <div style="font-weight: 500; font-size: 14px;">
        ${
          weapon.tags
            ? `
              <hr style="margin-top: 3px; margin-bottom: 1px;" />
              <div class="tags" style="margin-bottom: 5px;">
                ${weapon.tags
                  .map(
                    (tag) => `
                      <span class="tag tag_alt"">${tag}</span>`
                  )
                  .join(" ")}
              </div>
            `
            : ""
        }
      </div>
      ${
        versatile
          ? versatile
              .map((damageType, index) =>
                index !== versatile.length - 1
                  ? `
                  <div class="dialog-buttons">
                    <button
                      class="dialog-button damage-${damageType}"
                      data-button="damage-${damageType}"
                      style="margin-bottom:5px;"
                    >
                      Damage ${damageType.toUpperCase()}
                    </button>
                    <button
                      class="dialog-button critical-${damageType}"
                      data-button="critical-${damageType}"
                      style="margin-bottom:5px;"
                    >
                      Critical ${damageType.toUpperCase()}
                    </button>
                  </div>
                `
                  : ""
              )
              .join("")
          : ""
      }
    `,
    buttons: {
      [`damage${versatile ? `-${versatile[versatile.length - 1]}` : ""}`]: {
        label: `Damage${
          versatile ? ` ${versatile[versatile.length - 1].toUpperCase()}` : ""
        }`,
        callback: () => {
          damage(
            false,
            ...[versatile ? versatile[versatile.length - 1] : [false]]
          );
        },
      },
      [`critical${versatile ? `-${versatile[versatile.length - 1]}` : ""}`]: {
        label: `Critical${
          versatile ? ` ${versatile[versatile.length - 1].toUpperCase()}` : ""
        }`,
        callback: () => {
          damage(
            true,
            ...[versatile ? versatile[versatile.length - 1] : [false]]
          );
        },
      },
    },
  });
  dialog.render(true);
  if (versatile) {
    for (const damageType of versatile.slice(0, versatile.length - 1)) {
      dialog.data.buttons[`damage-${damageType}`] = {
        callback: () => {
          damage(false, damageType);
        },
      };
      dialog.data.buttons[`critical-${damageType}`] = {
        callback: () => {
          damage(true, damageType);
        },
      };
    }
  }
})();
