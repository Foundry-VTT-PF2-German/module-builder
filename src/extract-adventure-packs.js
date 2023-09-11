import { ADVENTURE_CONFIG } from "../adventure-config.js";

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
    // Get relevant adventures
    const extractedAdventures = ADVENTURE_CONFIG.adventureModules.map((advModule) => advModule.moduleId);

    extractedAdventures.forEach(async (extractedAdventure) => {
        const pack = game.packs.get(`${extractedAdventure}.adventures`);
        if (pack !== undefined) {
            await pack.getDocuments();

            // Create a destination directory for extraction
            const path = `modules/adventure-extractor/${ADVENTURE_CONFIG.extractionFolder.replace(
                "./",
                ""
            )}/${extractedAdventure}`;

            // Extract the adventure
            await FilePicker.createDirectory("data", path).catch((err) => {});
            const lf = _createFile(JSON.stringify(pack.contents, null, 2), `${extractedAdventure}.json`);
            await FilePicker.upload("data", path, lf, {}, { notify: false });

            // Extract journal pages as html documents
            await FilePicker.createDirectory("data", `${path}/html`).catch((err) => {});
            pack.contents.forEach(async (adventure) => {
                await FilePicker.createDirectory("data", `${path}/html/${adventure.name}`).catch((err) => {});
                for (const entry of adventure.data.journal) {
                    for (const page of entry.pages) {
                        if (!page.text.content?.trim()) continue;
                        const hf = _createFile(
                            page.text.content,
                            `${page.id}-${page.name.slugify({ strict: true })}.html`,
                            "text/html"
                        );
                        await FilePicker.upload("data", `${path}/html/${adventure.name}`, hf, {}, { notify: false });
                    }
                }
            });
        } else {
            console.warn(`Module ${extractedAdventure} not activated.`);
        }
    });
}

function _createFile(content, fileName, dataType) {
    const blob = new Blob([content], { type: dataType });
    return new File([blob], fileName, { type: dataType });
}
