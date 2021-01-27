const action = {
  name: "Dragon's Rage Breath",
  actions: "2", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
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
      <span style="font-family: 'Pathfinder2eActions'; font-size: 5em; text-align: center;">${action.actions}</span>
      <h3
        style="flex: 1; line-height: 36px; margin: 0;"
      >
        ${action.name}
      </h3>
    </header>
  `;
  const damage = (dice, area) => {
    DicePF2e.damageRoll({
      event,
      parts: [`${dice}d6${action.damageType ? `[${action.damageType}]` : ""}`],
      actor,
      data: actor.data.data,
      title: `
        <hr style="margin-top: 0;" />
        <div style="
          color: #191813;
          font-style: normal;
          line-height: 120%;
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
    `,
    buttons: {
      standard: {
        label: "Standard",
        callback: () => {
          damage(actor.data.data.details?.level?.value, "30-foot cone");
        },
      },
      hour: {
        label: "Used within last hour",
        callback: () => {
          damage(
            Math.floor(actor.data.data.details?.level?.value / 2),
            "15-foot cone"
          );
        },
      },
    },
    default: "standard",
  });
  dialog.render(true);
})();
