import { copyFileSync, readdirSync, readFileSync } from "fs";
import { replaceProperties } from "./helper/src/util/utilities.js";
import { buildItemDatabase, extractPack } from "./helper/src/pack-extractor/pack-extractor.js";
import { PF2_DEFAULT_MAPPING } from "./helper/src/pack-extractor/constants.js";
import { ADVENTURE_CONFIG } from "../adventure-config.js";
import { spawn } from "child_process";
import {
    copyDirectory,
    getZipContentFromURL,
    deleteFolderRecursive,
    saveFileWithDirectories,
} from "./helper/src/util/fileHandler.js";
import { resolvePath } from "path-value";

// Fetch assets from current pf2 release and get zip contents
const packs = await getZipContentFromURL(ADVENTURE_CONFIG.zipURL);

// Build item database in order to compare actor items with their comdendium entries
const itemDatabase = buildItemDatabase(packs, ADVENTURE_CONFIG.itemDatabase);

// Build actor database in order to connect actor id to actor name
const actorDatabase = buildItemDatabase(packs, ADVENTURE_CONFIG.actorDatabase);

// Replace linked mappings and savePaths with actual data
replaceProperties(PF2_DEFAULT_MAPPING, ["subMapping"], PF2_DEFAULT_MAPPING);

// Read available adventure directories
const adventureDirectories = readdirSync(ADVENTURE_CONFIG.extractionFolder);

// Initialize adventure actor dictionary
const adventureActorDictionary = {};

// Loop through configured adventures and extract data if available
ADVENTURE_CONFIG.adventureModules.forEach((adventureModule) => {
    if (adventureDirectories.includes(adventureModule.moduleId)) {
        // Initialize directory and file paths
        const extractionPath = `${ADVENTURE_CONFIG.extractionFolder}/${adventureModule.moduleId}`;
        const xliffPath = adventureModule.savePaths.xliffTranslation;
        const journalPath = `${adventureModule.savePaths.extractedJournals}/${adventureModule.moduleId}`;
        const bestiarySourcePath = adventureModule.savePaths.bestiarySources;
        const jsonFile = `${adventureModule.moduleId}-en.json`;
        const xliffFile = `${adventureModule.moduleId}.xliff`;

        const adventurePack = JSON.parse(readFileSync(`${extractionPath}/${adventureModule.moduleId}.json`));

        // Extract the data
        if (xliffPath) {
            console.warn("-----------------------------------");
            const extractedPackData = extractPack(
                adventureModule.moduleId,
                adventurePack,
                PF2_DEFAULT_MAPPING.adventure,
                itemDatabase
            );

            saveFileWithDirectories(
                `${xliffPath}/${jsonFile}`,
                JSON.stringify(extractedPackData.extractedPack, null, 2)
            );

            // Run the Python xliff tool
            let script = "";

            // If the xliff file already exists, make a backup and update the xliff
            if (readdirSync(xliffPath).includes(xliffFile)) {
                console.warn("  - Creating backup and updating xliff file");
                script = [
                    ADVENTURE_CONFIG.xliffScript,
                    `${xliffPath}/${xliffFile}`,
                    "update-from",
                    "--tree",
                    `${xliffPath}/${jsonFile}`,
                ];

                // Make backup of the current xliff
                copyFileSync(
                    `${xliffPath}/${xliffFile}`,
                    `${xliffPath}/${xliffFile}`.replace(".xliff", "-sicherung.xliff")
                );

                // Create xliff file if not existing
            } else {
                console.warn("  - Creating xliff file");
                script = [
                    ADVENTURE_CONFIG.xliffScript,
                    `${xliffPath}/${xliffFile}`,
                    "create",
                    "-s",
                    "EN",
                    "-t",
                    "DE",
                    "--source-json",
                    `${xliffPath}/${jsonFile}`,
                    "--tree",
                ];
            }
            const pyProg = spawn("python", script);
            pyProg.stderr.on("data", (stderr) => {
                console.log(stderr);
            });
        }

        // Cleanup html save location before copying the new files
        if (journalPath) {
            deleteFolderRecursive(journalPath);
            copyDirectory(`${extractionPath}/html`, journalPath);
        }

        // Build dictionary for adventure actor sources if save location is specified
        if (bestiarySourcePath) {
            adventureActorDictionary[bestiarySourcePath] = adventureActorDictionary[bestiarySourcePath] || {};
            adventurePack.forEach((adventure) => {
                adventure.actors.forEach((actor) => {
                    if (
                        resolvePath(actor, "flags.core.sourceId").exists &&
                        actor.flags.core.sourceId.startsWith("Compendium.pf2e")
                    ) {
                        // Initialize compendium entry if neccessary
                        const sourceIdComponents = actor.flags.core.sourceId.split(".");
                        // Add Actor to sourceId link for old link notation
                        if (sourceIdComponents.length === 4) {
                            actor.flags.core.sourceId = `Compendium.pf2e.${sourceIdComponents[2]}.Actor.${sourceIdComponents[3]}`;
                        }
                        adventureActorDictionary[bestiarySourcePath][sourceIdComponents[2]] =
                            adventureActorDictionary[bestiarySourcePath][sourceIdComponents[2]] || [];
                        adventureActorDictionary[bestiarySourcePath][sourceIdComponents[2]] =
                            adventureActorDictionary[bestiarySourcePath][sourceIdComponents[2]] || [];
                        const actorName = actorDatabase[actor.flags.core.sourceId]?.name;
                        if (actorName) {
                            adventureActorDictionary[bestiarySourcePath][sourceIdComponents[2]].push(actorName);
                        }
                    }
                });
            });
        }
    } else {
        console.warn(`No extracted pack found for ${adventureModule.moduleId}.`);
    }
});

// Remove duplicates and empty compendium entries from adventure actor sources and save the dictionary to the specified locations
Object.keys(adventureActorDictionary).forEach((savePath) => {
    const dictionary = {};
    Object.keys(adventureActorDictionary[savePath]).forEach((compendium) => {
        const sortedEntries = [...new Set(adventureActorDictionary[savePath][compendium].sort())];
        if (sortedEntries.length > 0) {
            dictionary[compendium] = sortedEntries;
        }
    });
    saveFileWithDirectories(savePath, JSON.stringify(dictionary, null, 2));
});
