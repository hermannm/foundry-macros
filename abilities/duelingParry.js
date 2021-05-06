const action = {
  name: "Dueling Parry",
  actions: "OneAction",
  tags: ["Fighter"],
  requirements:
    "You are wielding only a single one-handed melee weapon and have your other hand or hands free.",
  description:
    "You can parry attacks against you with your one-handed weapon. You gain a +2 circumstance bonus to AC until the start of your next turn as long as you continue to meet the requirements.",
  effect: {
    modifier: {
      stat: "ac",
      value: 2,
      type: "circumstance",
    },
    iconPath: "systems/pf2e/icons/features/classes/deific-weapon.webp",
  },
};
(async () => {
  if (
    (actor.data.data.customModifiers[action.effect.modifier.stat] || []).some(
      (customModifier) => customModifier.name === action.name
    )
  ) {
    if (token.data.effects.includes(action.effect.iconPath)) {
      await token.toggleEffect(action.effect.iconPath);
    }
    await actor.removeCustomModifier(action.effect.modifier.stat, action.name);
  } else {
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
    ChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: `
        ${actionFormat(contentFormat(action))}
      `,
    });
    if (!token.data.effects.includes(action.effect.iconPath)) {
      await token.toggleEffect(action.effect.iconPath);
    }
    await actor.addCustomModifier(
      action.effect.modifier.stat,
      action.name,
      action.effect.modifier.value,
      action.effect.modifier.type
    );
  }
})();
