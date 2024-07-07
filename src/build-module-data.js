import { existsSync, readdirSync, readFileSync } from "fs";
import { resolvePath } from "path-value";
import { CONFIG } from "../config.js";
import { sluggify, unflattenObject } from "./helper/src/util/utilities.js";
import { parsePath, saveFileWithDirectories } from "./helper/src/util/file-handler.js";
import { xliffToJson } from "./helper/src/util/xliff-tool.js";

// Get the paths to the bestiary json files
const bestiaryModulePaths = CONFIG.bestiaryPaths;

// Loop through configured adventures and build localized data for the module
CONFIG.modules.forEach((currentModule) => {
    // Initialize directory and file paths
    const xliffPath = currentModule.savePaths.xliffTranslation;
    const moduleCompendiumPath = currentModule.savePaths.moduleCompendium;
    const bestiarySourcePath = currentModule.savePaths.bestiarySources;
    const bestiaryCompendiumsPath = currentModule.savePaths.bestiaryCompendiums;

    // Build localized data
    console.warn("-----------------------------------");
    console.warn(`Building ${currentModule.moduleId}`);
    // Check for existing xliff
    if (moduleCompendiumPath) {
        currentModule.adventurePacks.forEach((adventurePack) => {
            const localizedJournalPath = `${currentModule.savePaths.localizedJournals}/${currentModule.moduleId}.${adventurePack.name}`;
            const localizedJsonFile = `${currentModule.moduleId}.${adventurePack.name}.json`;
            const xliffFile = `${currentModule.moduleId}.${adventurePack.name}.xliff`;
            if (existsSync(`${xliffPath}/${xliffFile}`)) {
                // Create localized adventure json from xliff
                const source = unflattenObject(xliffToJson(readFileSync(`${xliffPath}/${xliffFile}`, "utf-8")));
                saveFileWithDirectories(
                    `${moduleCompendiumPath}/${localizedJsonFile}`,
                    JSON.stringify(source, null, 4)
                );

                // Find journal entry pages within the created json files and insert the localized html data
                const adventures = JSON.parse(readFileSync(`${moduleCompendiumPath}/${localizedJsonFile}`));
                if (resolvePath(adventures, "entries").exists) {
                    Object.keys(adventures.entries).forEach((entryKey) => {
                        const adventure = adventures.entries[entryKey];
                        if (existsSync(`${localizedJournalPath}/${sluggify(entryKey)}`)) {
                            if (resolvePath(adventure, "journal").exists) {
                                Object.keys(adventure.journal).forEach((journalKey) => {
                                    const journal = adventure.journal[journalKey];
                                    if (resolvePath(journal, "pages").exists) {
                                        Object.keys(journal.pages).forEach((pageKey) => {
                                            let pageEntries = journal.pages[pageKey];
                                            let deleteId = false;
                                            if (!Array.isArray(pageEntries)) {
                                                pageEntries = Array(pageEntries);
                                                deleteId = true;
                                            }
                                            pageEntries.forEach((page) => {
                                                if (page.id) {
                                                    if (page.id.startsWith("no-text-")) {
                                                        page.id = page.id.replace("no-text-", "");
                                                    } else {
                                                        const journalFileName = `${page.id}-${sluggify(pageKey)}.html`;
                                                        if (
                                                            readdirSync(
                                                                `${localizedJournalPath}/${sluggify(entryKey)}`
                                                            ).includes(journalFileName)
                                                        ) {
                                                            page.text = unifyHTML(
                                                                readFileSync(
                                                                    `${localizedJournalPath}/${sluggify(
                                                                        entryKey
                                                                    )}/${journalFileName}`,
                                                                    "utf8"
                                                                )
                                                            );
                                                        } else {
                                                            console.warn(
                                                                `  - Localized journal file for ${journalFileName} missing`
                                                            );
                                                        }
                                                    }
                                                    if (deleteId) {
                                                        delete page.id;
                                                    }
                                                }
                                                if (pageEntries.length === 1) {
                                                    pageEntries = pageEntries[0];
                                                }
                                            });
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
        });
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
                    JSON.stringify(extractedBestiaryData, null, 4)
                );
            }
        });
    }
});

function unifyHTML(str) {
    return str
        .replace(/(\r\n|\n|\r)/g, "\n")
        .replace(/\n\n/g, "\n")
        .replace(/(^\n|\n$)/g, "");
}
