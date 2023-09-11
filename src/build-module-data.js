import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { resolvePath } from "path-value";
import { ADVENTURE_CONFIG } from "../adventure-config.js";
import { spawnSync } from "child_process";
import { sluggify } from "./helper/src/util/utilities.js";

// Loop through configured adventures and build localized data for the module
ADVENTURE_CONFIG.adventureModules.forEach((adventureModule) => {
    // Initialize directory and file paths
    const xliffPath = adventureModule.savePaths.xliffTranslation;
    const moduleCompendiumPath = adventureModule.savePaths.moduleCompendium;
    const localizedJournalPath = `${adventureModule.savePaths.localizedJournals}/${adventureModule.moduleId}`;
    const localizedJsonFile = `${adventureModule.moduleId}.adventures.json`;
    const xliffFile = `${adventureModule.moduleId}.xliff`;

    // Build localized data
    console.warn("-----------------------------------");
    console.warn(`Building ${adventureModule.moduleId}`);
    // Check for existing xliff
    if (existsSync(`${xliffPath}/${xliffFile}`)) {
        // Create localized adventure json from xliff
        const script = [
            ADVENTURE_CONFIG.xliffScript,
            `${xliffPath}/${xliffFile}`,
            "export-to",
            `${moduleCompendiumPath}/${localizedJsonFile}`,
            "--tree",
            "-i",
        ];
        spawnSync("python", script);

        // Find journal entry pages within the created json files and insert the localized html data
        const adventures = JSON.parse(readFileSync(`${moduleCompendiumPath}/${localizedJsonFile}`));
        if (resolvePath(adventures, "entries").exists) {
            Object.keys(adventures.entries).forEach((entryKey) => {
                const adventure = adventures.entries[entryKey];
                if (existsSync(`${localizedJournalPath}/${entryKey}`)) {
                    if (resolvePath(adventure, "journal").exists) {
                        Object.keys(adventure.journal).forEach((journalKey) => {
                            const journal = adventure.journal[journalKey];
                            if (resolvePath(journal, "pages").exists) {
                                Object.keys(journal.pages).forEach((pageKey) => {
                                    const page = journal.pages[pageKey];
                                    const journalFileName = `${page.id}-${sluggify(pageKey)}.html`;
                                    if (readdirSync(`${localizedJournalPath}/${entryKey}`).includes(journalFileName)) {
                                        const journalFile = readFileSync(
                                            `${localizedJournalPath}/${entryKey}/${journalFileName}`,
                                            "utf8"
                                        );
                                        page.text = journalFile;
                                        delete page.id;
                                    } else {
                                        console.warn(`  - Localized journal file for ${journalFileName} missing`);
                                    }
                                });
                            }
                        });
                    }
                } else {
                    console.warn("  - Localized journals directory missing!");
                }
            });
        }
        writeFileSync(`${moduleCompendiumPath}/${localizedJsonFile}`, JSON.stringify(adventures, null, 2));
    } else {
        console.warn("  - Xliff file missing!");
    }
});
