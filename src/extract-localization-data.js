import { copyFileSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { replaceProperties } from "./helper/src/util/utilities.js";
import { buildItemDatabase, extractPack } from "./helper/src/pack-extractor/pack-extractor.js";
import { PF2_DEFAULT_MAPPING } from "./helper/src/pack-extractor/constants.js";
import { ADVENTURE_CONFIG } from "../adventure-config.js";
import { spawn } from "child_process";
import { copyDirectory, getZipContentFromURL, deleteFolderRecursive } from "./helper/src/util/fileHandler.js";

// Fetch assets from current pf2 release and get zip contents
const packs = await getZipContentFromURL(ADVENTURE_CONFIG.zipURL);

// Build item database in order to compare actor items with their comdendium entries
const itemDatabase = buildItemDatabase(packs, ADVENTURE_CONFIG.itemDatabase);

// Replace linked mappings and savePaths with actual data
replaceProperties(PF2_DEFAULT_MAPPING, ["subMapping"], PF2_DEFAULT_MAPPING);

// Read available adventure directories
const adventureDirectories = readdirSync(ADVENTURE_CONFIG.extractionFolder);

// Loop through configured adventures and extract data if available
ADVENTURE_CONFIG.adventureModules.forEach((adventureModule) => {
    if (adventureDirectories.includes(adventureModule.moduleId)) {
        // Initialize directory and file paths
        const extractionPath = `${ADVENTURE_CONFIG.extractionFolder}/${adventureModule.moduleId}`;
        const xliffPath = adventureModule.savePaths.xliffTranslation;
        const journalPath = `${adventureModule.savePaths.extractedJournals}/${adventureModule.moduleId}`;
        const jsonFile = `${adventureModule.moduleId}-en.json`;
        const xliffFile = `${adventureModule.moduleId}.xliff`;

        const adventurePack = JSON.parse(readFileSync(`${extractionPath}/${adventureModule.moduleId}.json`));

        // Extract the data
        console.warn("-----------------------------------");
        const extractedPackData = extractPack(adventureModule.moduleId, adventurePack, PF2_DEFAULT_MAPPING.adventure, itemDatabase);

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
    } else {
        console.warn(`No extracted pack found for ${adventureModule.moduleId}.`);
    }
});
