import { copyFileSync, readdirSync, readFileSync, writeFile, writeFileSync } from "fs";
import { replaceProperties } from "./helper/src/util/utilities.js";
import { buildItemDatabase, extractPack } from "./helper/src/pack-extractor/pack-extractor.js";
import { PF2_DEFAULT_MAPPING } from "./helper/src/pack-extractor/constants.js";
import { ADVENTURE_CONFIG } from "../adventure-config.js";
import { spawn } from "child_process";
import { copyDirectory, getZipContentFromURL, deleteFolderRecursive } from "./helper/src/util/fileHandler.js";
import { resolvePath } from "path-value";

// Fetch assets from current pf2 release and get zip contents
const packs = await getZipContentFromURL(ADVENTURE_CONFIG.zipURL);

// Build item database in order to compare actor items with their comdendium entries
const itemDatabase = buildItemDatabase(packs, ADVENTURE_CONFIG.itemDatabase);

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
        const jsonFile = `${adventureModule.moduleId}-en.json`;
        const xliffFile = `${adventureModule.moduleId}.xliff`;
        const bestiarySourcePath = adventureModule.savePaths.bestiarySources;

        const adventurePack = JSON.parse(readFileSync(`${extractionPath}/${adventureModule.moduleId}.json`));

        // Extract the data
        console.warn("-----------------------------------");
        const extractedPackData = extractPack(
            adventureModule.moduleId,
            adventurePack,
            PF2_DEFAULT_MAPPING.adventure,
            itemDatabase
        );

        writeFileSync(`${xliffPath}/${jsonFile}`, JSON.stringify(extractedPackData.extractedPack, null, 2));

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

        // Cleanup html save location before copying the new files
        deleteFolderRecursive(journalPath);
        copyDirectory(`${extractionPath}/html`, journalPath);

        // Build dictionary for adventure actor sources
        adventureActorDictionary[bestiarySourcePath] = adventureActorDictionary[bestiarySourcePath] || {};
        adventurePack.forEach((adventure) => {
            adventure.actors.forEach((actor) => {
                if (
                    resolvePath(actor, "flags.core.sourceId").exists &&
                    actor.flags.core.sourceId.startsWith("Compendium.pf2e")
                ) {
                    // Initialize compendium entry if neccessary
                    const sourceIdComponents = actor.flags.core.sourceId.split(".");
                    adventureActorDictionary[bestiarySourcePath][sourceIdComponents[2]] =
                        adventureActorDictionary[bestiarySourcePath][sourceIdComponents[2]] || [];
                    adventureActorDictionary[bestiarySourcePath][sourceIdComponents[2]].push(sourceIdComponents[4]);
                }
            });
        });
    } else {
        console.warn(`No extracted pack found for ${adventureModule.moduleId}.`);
    }
});

// Remove duplicates from adventure actor sources and save the dictionary to the specified locations
Object.keys(adventureActorDictionary).forEach((savePath) => {
    const dictionary = {};
    Object.keys(adventureActorDictionary[savePath]).forEach((compendium) => {
        dictionary[compendium] = [...new Set(adventureActorDictionary[savePath][compendium].sort())];
        writeFileSync(`${savePath}/actorSources.json`, JSON.stringify(dictionary, null, 2));
    });
});
