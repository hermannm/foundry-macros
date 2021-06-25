const action = {
  name: "Retributive Strike",
  actions: "Reaction", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
  trigger: "An enemy damages your ally, and both are within 15 feet of you.",
  description: [
    "You protect your ally and strike your foe. The ally gains resistance to all damage against the triggering damage equal to 2 + your level. If the foe is within reach, make a melee Strike against it.",
    {
      title: "Ranged Reprisal",
      text: "You can use Retributive Strike with a ranged weapon. In addition, if the foe that triggered your reaction is within 5 feet of your reach but not in your reach, as part of your reaction you can Step to put the foe in your reach before making a melee Retributive Strike.",
    },
  ],
  tags: ["Champion"],
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
  const damage = (damage, area) => {
    game.pf2e.Dice.damageRoll({
      event,
      parts: [`${damage}${action.damageType ? `[${action.damageType}]` : ""}`],
      actor,
      data: actor.data.data,
      title: actionFormat(contentFormat(action)),
      speaker: ChatMessage.getSpeaker(),
    });
  };
  damage(`2+${actor.data.data.details?.level?.value}`);
})();
