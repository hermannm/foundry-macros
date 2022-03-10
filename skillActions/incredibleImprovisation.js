(async () => {
  const dialogButtons = [];

  const modToString = (modifier) => (modifier >= 0 ? `+${modifier}` : `${modifier}`);

  const postChatMessage = ({ content }) => {
    ChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content,
    });
  };

  const formatActionHeader = ({ actions, name, tags }) => `
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
                  <span class="tag tag_alt"">${tag}</span>
                `
              )
              .join(" ")}
          </div>
        `
        : `<hr style="margin-top: 3px;" />`
    }
  `;

  const formatActionBody = ({ content }) => {
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

  const formatAction = ({ actions, name, tags, content }) => `
    <div style="font-size: 14px; line-height: 16.8px; color: #191813;">
      ${formatActionHeader({ actions, name, tags })}
      ${formatActionBody({ content })}
    </div>
  `;

  const createAttributeButton = async ({ category, attributeName, incredibleImprovisation }) => {
    const attribute = actor.data.data[category][attributeName];

    const attributeButton = {
      id: attributeName,
      label: `${attributeName.charAt(0).toUpperCase()}${attributeName.slice(1)} ${modToString(
        attribute.totalModifier
      )}`,
      disabled: incredibleImprovisation,
      callback: async ($html) => {
        const options = await actor.getRollOptions([
          "all",
          `${attribute.ability}-based`,
          attributeName,
        ]);

        if ($html.find('[name="hermannm-secret-check"]')[0]?.checked) {
          options.push("secret");
        }

        if (
          $html.find('[name="hermannm-initiative"]')[0]?.checked &&
          attributeName === "perception"
        ) {
          await actor.update({
            "data.attributes.initiative.ability": attributeName,
          });
          actor.data.data.attributes.initiative.roll({ event, options });
        } else {
          actor.data.data[category][attributeName].roll({ event, options });
        }
      },
    };

    dialogButtons.push(attributeButton);

    return attributeButton;
  };

  const createSkillButton = async ({ skillKey, skill, incredibleImprovisation }) => {
    const skillButton = {
      id: skillKey,
      label: `${skill.name.charAt(0).toUpperCase()}${skill.name.slice(1)} ${modToString(
        skill.totalModifier + (skill.rank === 0 && incredibleImprovisation ? 4 : 0)
      )}`,
      disabled: skill.rank !== 0 && incredibleImprovisation,
      callback: async ($html) => {
        if (incredibleImprovisation) {
          postChatMessage({
            content: formatAction({
              actions: "FreeAction",
              name: "Incredible Improvisation",
              tags: ["Human"],
              content: [
                {
                  title: "Frequency",
                  text: "once per day",
                },
                {
                  title: "Trigger",
                  text: "You attempt a check using a skill you're untrained in.",
                },
                "A stroke of brilliance gives you a major advantage with a skill despite your inexperience. Gain a +4 circumstance bonus to the triggering skill check.",
              ],
            }),
          });

          await actor.addCustomModifier(
            "skill-check",
            "Incredible Improvisation",
            4,
            "circumstance"
          );
        }

        const options = await actor.getRollOptions([
          "all",
          "skill-check",
          `${skill.ability}-based`,
          skill.name,
        ]);

        if ($html.find('[name="hermannm-secret-check"]')[0]?.checked) {
          options.push("secret");
        }

        if ($html.find('[name="hermannm-initiative"]')[0]?.checked) {
          await actor.update({
            "data.attributes.initiative.ability": skillKey,
          });
          actor.data.data.attributes.initiative.roll({ event, options });
        } else {
          actor.data.data.skills[skillKey].roll({ event, options });
        }

        if (incredibleImprovisation) {
          await actor.removeCustomModifier("skill-check", "Incredible Improvisation");
        }
      },
    };

    dialogButtons.push(skillButton);

    return skillButton;
  };

  const createSkillButtons = async ({ incredibleImprovisation }) => {
    const skillButtons = [];

    for (let [skillKey, skill] of Object.entries(actor.data.data.skills)) {
      skillButtons.push(await createSkillButton({ skillKey, skill, incredibleImprovisation }));
    }

    return skillButtons;
  };

  const formatButtons = (buttons) => {
    let buttonFormat = "";

    const rows = Math.ceil(buttons.length / 3);

    for (let row = 0; row < rows; row++) {
      buttonFormat += `<div class="dialog-buttons" style="margin-top: 5px;">`;

      for (let column = 0; column < 3; column++) {
        if (row * 3 + column < buttons.length) {
          const button = buttons[row * 3 + column];

          buttonFormat += button.disabled
            ? `
              <div style="
                margin-bottom: 5px;
                ${column === 2 ? "" : "margin-right: 5px;"}
                padding: 1px 6px;
                border: 2px groove #f0f0e0;
                border-radius: 3px;
                text-align: center;
                font-family: Signika, sans-serif;
                font-size: 14px;
                color: #4b4a44;
                line-height: 28px;
              ">
                ${button.label}
              </div>
            `
            : `
              <button
                class="dialog-button ${button.id}"
                data-button="${button.id}"
                style="margin-bottom: 5px;"
              >${button.label}</button>
            `;
        } else {
          buttonFormat += `
            <button
              class="dialog-button"
              style="margin-bottom: 5px; visibility: hidden;"
            ></button>
          `;
        }
      }

      buttonFormat += "</div>";
    }

    return buttonFormat;
  };

  const formatCheckbox = ({ id, label, checked }) => `
    <form>
        <div class="form-group">
          <input
            type="checkbox"
            id="${id}"
            name="${id}"
            ${checked ? "checked" : ""}
          ></input>
          <label>${label}</label>
        </div>
      </form>
  `;

  const formatDialog = async ({ incredibleImprovisation, secretCheck, initiative }) => {
    let dialogFormat = "";

    dialogFormat += formatCheckbox({
      id: "hermannm-secret-check",
      label: "Secret Check",
      checked: secretCheck,
    });

    dialogFormat += formatCheckbox({
      id: "hermannm-initiative",
      label: "Initiative",
      checked: initiative,
    });

    dialogFormat += formatCheckbox({
      id: "hermannm-incredible-improvisation",
      label: "Incredible Improvisation",
      checked: incredibleImprovisation,
    });

    dialogFormat += formatButtons([
      await createAttributeButton({
        category: "attributes",
        attributeName: "perception",
        incredibleImprovisation,
      }),
    ]);

    dialogFormat += formatButtons([
      await createAttributeButton({
        category: "saves",
        attributeName: "fortitude",
        incredibleImprovisation,
      }),
      await createAttributeButton({
        category: "saves",
        attributeName: "reflex",
        incredibleImprovisation,
      }),
      await createAttributeButton({
        category: "saves",
        attributeName: "will",
        incredibleImprovisation,
      }),
    ]);

    dialogFormat += formatButtons(await createSkillButtons({ incredibleImprovisation }));

    return dialogFormat;
  };

  const dialog = new Dialog(
    {
      title: "Skills",
      content: "",
      buttons: {},
    },
    { width: 400 }
  );

  const setupDialog = async ({ incredibleImprovisation, secretCheck, initiative }) => {
    dialog.data.content = await formatDialog({
      incredibleImprovisation,
      secretCheck,
      initiative,
    });
    dialog.data.buttons = {};

    dialog.render(true);

    for (const button of dialogButtons) {
      dialog.data.buttons[button.id] = {
        callback: button.callback,
      };
    }

    setTimeout(() => {
      document
        .getElementById("hermannm-incredible-improvisation")
        .addEventListener("change", (event) => {
          const { checked: secretCheckChecked } = document.getElementById("hermannm-secret-check");
          const { checked: initiativeChecked } = document.getElementById("hermannm-initiative");

          setupDialog({
            incredibleImprovisation: event.target.checked,
            secretCheck: secretCheckChecked,
            initiative: initiativeChecked,
          });
        });
    }, 0);
  };

  setupDialog({ incredibleImprovisation: false });
})();
