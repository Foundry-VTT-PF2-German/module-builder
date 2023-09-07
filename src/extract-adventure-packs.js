/**
 * A reference to the module.
 * @type {Module}
 */
let module;

Hooks.once("init", () => {
    module = game.modules.get("adventure-extractor");
    module.api = {
        extractAdventures,
    };
});

async function extractAdventures() {
    // Relevant adventures
    const extractedAdventures = [
        "pf2e-ap178-180-outlaws-of-alkenstar",
        "pf2e-ap178-punks-in-a-powderkeg",
        "pf2e-ap179-cradle-of-quartz",
        "pf2e-ap180-the-smoking-gun",
    ];

    extractedAdventures.forEach(async (extractedAdventure) => {
        const pack = game.packs.get(`${extractedAdventure}.adventures`);
        await pack.getDocuments();

        for (const adventure of pack.contents) {
            // Create a destination directory for extraction
            let i = 1;
            const path = `modules/adventure-extractor/adventures/${extractedAdventure}-${i}`;
            // Extract the adventure
            await FilePicker.createDirectory("data", path).catch((err) => {});
            const lf = _createFile(JSON.stringify(adventure.toObject(), null, 2), `${extractedAdventure}.json`);
            await FilePicker.upload("data", path, lf, {}, { notify: false });

            // Extract journal pages as html documents
            await FilePicker.createDirectory("data", `${path}/html`).catch((err) => {});
            for (const entry of adventure.data.journal) {
                for (const page of entry.pages) {
                    if (!page.text.content?.trim()) continue;
                    const hf = _createFile(
                        page.text.content,
                        `${page.id}-${page.name.slugify({ strict: true })}.html`,
                        "text/html"
                    );
                    await FilePicker.upload("data", `${path}/html`, hf, {}, { notify: false });
                }
            }
            i = i + 1;
        }
    });
}

function _createFile(content, fileName, dataType) {
    const blob = new Blob([content], { type: dataType });
    return new File([blob], fileName, { type: dataType });
}
