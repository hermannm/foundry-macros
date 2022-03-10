const action = {
  name: "Dragon's Rage Breath",
  actions: "TwoActions",
  save: "Basic Reflex",
  DC: "Class DC",
  damageType: "Cold",
  description:
    "You breathe deeply and exhale powerful energy in a 30-foot cone or 60-foot line, dealing 1d6 damage per level. The area and damage type match those of your dragon (see Table 3–4 on page 86). If you used this ability in the last hour, the area and the damage are halved (15-foot cone or 30-foot line; 1d6 damage for every 2 levels). Each creature in the area must attempt a basic Reflex save.",
  tags: ["Arcane", "Barbarian", "Concentrate", "Evocation", "Instinct", "Rage"],
};

(async () => {
  const actionHeader = `
    <header style="display: flex; font-size: 14px;">
      <img
        style="flex: 0 0 36px; margin-right: 5px;"
        src="systems/pf2e/icons/actions/${action.actions}.webp"
        title="${action.name}"
        width="36"
        height="36"
      >
      <h3
        style="flex: 1; line-height: 36px; margin: 0;"
      >
        ${action.name}
      </h3>
    </header>
  `;

  const damage = (damage, area) => {
    game.pf2e.Dice.damageRoll({
      event,
      parts: [`${damage}${action.damageType ? `[${action.damageType}]` : ""}`],
      actor,
      data: actor.data.data,
      title: `
        <hr style="margin-top: 0;" />
        <div style="
          color: #191813;
          font-style: normal;
          line-height: 16.8px;
        ">
          ${actionHeader}
          <hr />
          ${
            action.tags
              ? `
                <div class="tags" style="margin-bottom: 5px">
                  ${action.tags
                    .map(
                      (tag) => `
                        <span class="tag tag_alt"">${tag}</span>`
                    )
                    .join(" ")}
                </div>
              `
              : ""
          }
          <div style="
            font-weight: 500;
            font-size: 14px;
          ">
            ${action.trigger ? `<b>Trigger:</b> ${action.trigger}<hr />` : ""}
            ${action.description ? `${action.description}<hr />` : ""}
            ${
              area || action.save
                ? `
                  ${area ? `Area: ${area}<br />` : ""}
                  ${
                    action.save
                      ? `
                    ${action.save} save
                    ${
                      action.DC
                        ? ` DC: ${
                            action.DC === "Class DC"
                              ? actor.data.data.attributes?.classDC?.value
                              : action.DC
                          }`
                        : ""
                    }
                  `
                      : ""
                  }
                  <hr />
                `
                : ""
            }
          </div>
        </div>
      `,
      speaker: ChatMessage.getSpeaker(),
    });
  };

  const dialog = new Dialog({
    title: " ",
    content: `
      ${actionHeader}
      <hr />
      ${action.description ? `${action.description}<hr />` : ""}
      ${action.trigger ? `<b>Trigger:</b> ${action.trigger}<hr />` : ""}
    `,
    buttons: {
      standard: {
        label: "Standard",
        callback: () => {
          damage(`${actor.data.data.details?.level?.value ?? 0}d6`, "30-foot cone");
        },
      },
      hour: {
        label: "Used within last hour",
        callback: () => {
          damage(
            `${Math.floor((actor.data.data.details?.level?.value ?? 0) / 2)}d6`,
            "15-foot cone"
          );
        },
      },
    },
    default: "standard",
  });

  dialog.render(true);
})();
