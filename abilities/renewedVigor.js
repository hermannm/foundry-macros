const action = {
  name: "Renewed Vigor",
  actions: "OneAction",
  tags: ["Barbarian", "Concentrate", "Rage"],
  description:
    "You pause to recover your raging vigor. You gain temporary Hit Points equal to half your level plus your Constitution modifier.",
  effect: {
    tempHP: Math.floor(actor.data.data.details.level.value / 2) + actor.data.data.abilities.con.mod,
  },
};

(async () => {
  if (actor.data.data.attributes.hp.temp < action.effect.tempHP) {
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

    const actionFormat = ({ actions, name, tags, content }) => `
      <div style="font-size: 14px; line-height: 16.8px; color: #191813;">
        ${actionHeader({ actions, name, tags })}${actionBody({ content })}
      </div>
    `;

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

    ChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: `
        ${actionFormat(contentFormat(action))}
      `,
    });

    await actor.update({ "data.attributes.hp.temp": action.effect.tempHP });
  } else {
    ui.notifications.warn(
      `Previous temporary hit points exceed what you would gain from ${action.name}.`
    );
  }
})();
