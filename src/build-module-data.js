import { existsSync, readdirSync, readFileSync } from "fs";
import { resolvePath } from "path-value";
import { ADVENTURE_CONFIG } from "../adventure-config.js";
import { spawnSync } from "child_process";
import { sluggify } from "./helper/src/util/utilities.js";
import { parsePath, saveFileWithDirectories } from "./helper/src/util/fileHandler.js";

// Get the paths to the bestiary json files
const bestiaryModulePaths = ADVENTURE_CONFIG.bestiaryPaths;

// Loop through configured adventures and build localized data for the module
ADVENTURE_CONFIG.adventureModules.forEach((adventureModule) => {
    // Initialize directory and file paths
    const xliffPath = adventureModule.savePaths.xliffTranslation;
    const moduleCompendiumPath = adventureModule.savePaths.moduleCompendium;
    const localizedJournalPath = `${adventureModule.savePaths.localizedJournals}/${adventureModule.moduleId}`;
    const bestiarySourcePath = adventureModule.savePaths.bestiarySources;
    const bestiaryCompendiumsPath = adventureModule.savePaths.bestiaryCompendiums;
    const localizedJsonFile = `${adventureModule.moduleId}.adventures.json`;
    const xliffFile = `${adventureModule.moduleId}.xliff`;

    // Build localized data
    console.warn("-----------------------------------");
    console.warn(`Building ${adventureModule.moduleId}`);
    // Check for existing xliff
    if (moduleCompendiumPath) {
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
                                        if (
                                            readdirSync(`${localizedJournalPath}/${sluggify(entryKey)}`).includes(
                                                journalFileName
                                            )
                                        ) {
                                            const journalFile = readFileSync(
                                                `${localizedJournalPath}/${sluggify(entryKey)}/${journalFileName}`,
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
            saveFileWithDirectories(
                `${moduleCompendiumPath}/${localizedJsonFile}`,
                JSON.stringify(adventures, null, 2)
            );
        } else {
            console.warn("  - No xliff file for this adventure");
        }
    } else {
        console.warn("  - No localized compendium path specified for this adventure");
    }
    // Create localized data for the required actors from configured bestiaries
    if (bestiaryCompendiumsPath && bestiarySourcePath) {
        const bestiarySources = JSON.parse(readFileSync(bestiarySourcePath, "utf8"));
        Object.keys(bestiarySources).forEach((bestiarySource) => {
            if (bestiaryModulePaths[bestiarySource]) {
                const bestiaryModuleData = JSON.parse(readFileSync(bestiaryModulePaths[bestiarySource], "utf8"));
                const extractedBestiaryData = {
                    label: bestiaryModuleData.label,
                    entries: {},
                    mapping: bestiaryModuleData.mapping,
                };
                bestiarySources[bestiarySource].forEach((actorName) => {
                    extractedBestiaryData.entries[actorName] = bestiaryModuleData.entries[actorName];
                });

                // Get the json file name from the module
                const moduleFileName = parsePath(bestiaryModulePaths[bestiarySource]);

                // Save the required localized data to the configured destination
                saveFileWithDirectories(
                    `${bestiaryCompendiumsPath}/${bestiarySource}/${moduleFileName.fileName}.${moduleFileName.fileType}`,
                    JSON.stringify(extractedBestiaryData, null, 2)
                );
            }
        });
    }
});
