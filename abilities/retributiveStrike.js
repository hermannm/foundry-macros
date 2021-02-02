const action = {
  name: "Retributive Strike",
  actions: "Reaction", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
  damageType: "Resistance",
  trigger: "An enemy damages your ally, and both are within 15 feet of you.",
  description:
    "You protect your ally and strike your foe. The ally gains resistance to all damage against the triggering damage equal to 2 + your level. If the foe is within reach, make a melee Strike against it.",
  tags: ["Champion"],
};
(async () => {
  const actionHeader = `
    <header style="display: flex; font-size: 14px;">
      <img
        style="flex: 0 0 36px; margin-right: 5px;"
        src="systems/pf2e/icons/actions/${action.actions}.png"
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
  const damage = (level, area) => {
    DicePF2e.damageRoll({
      event,
      parts: [`2+${level}`],
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
    `,
    buttons: {
      standard: {
        label: "Standard",
        callback: () => {
          damage(actor.data.data.details?.level?.value);
        },
      },
    },
    default: "standard",
  });
  dialog.render(true);
})();
