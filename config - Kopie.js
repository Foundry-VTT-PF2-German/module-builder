export const CONFIG = {
    zipURL: "https://github.com/foundryvtt/pf2e/releases/latest/download/json-assets.zip",
    bestiaryPaths: {
        "pathfinder-bestiary":
            "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-b1-german/compendium/pf2e.pathfinder-bestiary.json",
        "pathfinder-bestiary-2":
            "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-b2-german/compendium/pf2e.pathfinder-bestiary-2.json",
        "pathfinder-bestiary-3":
            "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-b3-german/compendium/pf2e.pathfinder-bestiary-3.json",
        "blog-bestiary":
            "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-other-bestiaries/compendium/pf2e.blog-bestiary.json",
    },
    modules: [
        {
            moduleId: "pf2e-abomination-vaults",
            modulePath: "C:/Users/marco/OneDrive/Dokumente/RPG/FoundryVTT/Data/modules",
            modulePacks: [{ name: "av", path: "packs/av" }],
            savePaths: {
                bestiarySources:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-abomination-vaults-german/dev/bestiarySources.json",
                extractedJournals:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-abomination-vaults-german/dev/journals/source",
                localizedJournals:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-abomination-vaults-german/dev/journals/target",
                xliffTranslation: "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-abomination-vaults-german/dev",
                moduleCompendium:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-abomination-vaults-german/compendium",
                bestiaryCompendiums:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-abomination-vaults-german/compendium/actors",
            },
            htmlModifications: {
                "abomination-vaults": {
                    "Paizo Credits": [
                        {
                            base: '<h3>Creative Director</h3>\n<p>James Jacobs</p>\n<h3>Publisher</h3>\n<p>Erik Mona</p>',
                            mod: '<h3>Creative Director</h3>\n<p>James Jacobs</p>\n<h3>Publisher</h3>\n<p>Erik Mona</p>\n<h3>Deutsche Ausgabe</h3>\n<p>Ulisses Spiele GmbH</p>\n<h3>Originaltitel</h3>\n<p>Pathfinder Adventure Path 163–165: Abomination Vaults – Ruins of Gauntlight, Hands of the Devil, Eyes of Empty Death</p>\n<h3>Übersetzung</h3>\n<p>Tom Ganz, Stefan Rademacher, Ulrich-Alexander Schmidt und Klaus Singvogel</p>\n<h3>Lektorat und Korrektorat</h3>\n<p>Moritz Bednarski, Claudia Feld, Mara Felske, Tom Ganz, Ulrich-Alexander Schmidt und Klaus Singvogel</p>\n<h3>Layout</h3>\n<p>Nadine Hoffmann</p>\n<h3>Deutsche Foundry-Umsetzung</h3>\n<p>Marco Seither</p>',
                        },
                    ],
                    "Licensing Information": [
                        {
                            base: "<p><strong><em>Abomination Vaults Adventure Path</em>:</strong> © 2022, Paizo Inc.; Authors: Vanessa Hoskins, James Jacobs, and Stephen Radney-MacFarland, with Ron Lundeen.</p>",
                            mod: "<p><strong><em>Abomination Vaults Adventure Path</em>:</strong> © 2022, Paizo Inc.; Authors: Vanessa Hoskins, James Jacobs, and Stephen Radney-MacFarland, with Ron Lundeen.</p>\n<p>Deutsche Ausgabe <strong>Pathfinder-Abenteuerpfad <em>Das Schreckensgewölbe</em></strong> © 2022 von Ulisses Spiele GmbH, Waldems, unter Lizenz von Paizo Inc., USA.</p>",
                        },
                    ],
                },
            },
        },
        {
            moduleId: "pf2e-ap178-180-outlaws-of-alkenstar",
            modulePath: "C:/Users/marco/OneDrive/Dokumente/RPG/FoundryVTT/Data/modules",
            modulePacks: [{ name: "adventures", path: "packs/adventures" }],
            savePaths: {
                bestiarySources:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/dev/bestiarySources.json",
                extractedJournals:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/dev/journals/source",
                localizedJournals:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/dev/journals/target",
                xliffTranslation: "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/dev",
                moduleCompendium:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/compendium",
                bestiaryCompendiums:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/compendium/actors",
            },
            htmlModifications: {
                "outlaws-of-alkenstar-players-guide": {
                    Credits: [
                        {
                            base: "<p>Paizo Inc.</p>\n    <p>7120 185th Ave NE Ste 120</p>\n    <p>Redmond, WA 98052-0577</p>\n    <p>paizo.com</p>\n  </div>",
                            mod: '<p>Paizo Inc.</p>\n    <p>7120 185th Ave NE Ste 120</p>\n    <p>Redmond, WA 98052-0577</p>\n    <p>paizo.com</p>\n  </div>\n  <div style="text-align:center">\n    <img src="modules/pf2e-outlaws-of-alkenstar-german/assets/art/ulisses-logo.webp" alt="" />\n    <p>Ulisses Medien & Spiel Distribution GmbH</p>\n    <p>Industriestraße 11</p>\n    <p>65529 Waldems / Steinfischbach</p>\n    <p>ulisses-spiele.de</p>\n  </div>',
                        },
                    ],
                },
            },
        },
        {
            moduleId: "pf2e-ap178-punks-in-a-powderkeg",
            modulePath: "C:/Users/marco/OneDrive/Dokumente/RPG/FoundryVTT/Data/modules",
            modulePacks: [{ name: "adventures", path: "packs/adventures" }],
            savePaths: {
                bestiarySources:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/dev/bestiarySources.json",
                extractedJournals:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/dev/journals/source",
                localizedJournals:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/dev/journals/target",
                xliffTranslation: "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/dev",
                moduleCompendium:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/compendium",
            },
            htmlModifications: {
                "outlaws-of-alkenstar-punks-in-a-powderkeg": {
                    Frontmatter: [
                        {
                            base: '<section style="text-align:center">\n  <img class="center" src="modules/pf2e-ap178-punks-in-a-powderkeg/assets/art/Correct Paizo Logo.webp" alt="" />\n  <p>Paizo Inc.</p>\n  <p>7120 185th Ave NE Ste 120</p>\n  <p>Redmond, WA 98052-0577</p>\n  <p>paizo.com</p>\n  </section>',
                            mod: '<p><strong>Deutsche Ausgabe</strong> Ulisses Spiele GmbH</p>\n  <p><strong>Titel der Originalausgabe</strong> Pathfinder Adventure Path #178: Punks in a Powder Keg</p>\n  <p><strong>Übersetzung</strong> Mara Felske, Stefan Radermacher, Jasmine Rechberger, Ulrich-Alexander Schmidt und Klaus Singvogel</p>\n  <p><strong>Lektorat und Korrektorat</strong> Christian Brüggen, Claudia Feld, Mara Felske, Stefan Radermacher und Jasmine Rechberger</p>\n  <p><strong>Deutsche Foundry-Umsetzung</strong> Marco Seither</p>\n  <section style="text-align:center">\n  <img class="center" src="modules/pf2e-ap178-punks-in-a-powderkeg/assets/art/Correct Paizo Logo.webp" alt="">\n  <p>Paizo Inc.</p>\n  <p>7120 185th Ave NE Ste 120</p>\n  <p>Redmond, WA 98052-0577</p>\n  <p>paizo.com</p>\n  </section>\n  <section style="text-align:center">\n  <img class="center" src="modules/pf2e-outlaws-of-alkenstar-german/assets/art/ulisses-logo.webp" alt="">\n  <p>Ulisses Medien & Spiel Distribution GmbH</p>\n  <p>Industriestraße 11</p>\n  <p>65529 Waldems / Steinfischbach</p>\n  <p>ulisses-spiele.de</p>\n  </section>',
                        },
                    ],
                    Landing: [
                        {
                            base: "       <p>\n         <strong>To report bugs or other issues with this product, please fill out a support request with our service\n           desk.</strong>\n       </p>",
                            mod: "       <p>\n         <strong>To report bugs or other issues with this product, please fill out a support request with our service\n           desk. Solltest du einen Fehler in der Deutschen Übersetzung feststellen, dann lege hier ein Ticket an: https://github.com/Foundry-VTT-PF2-German/premium-modules</strong>\n       </p>"
                        },
                    ],
                    License: [
                        {
                            base: "<p>\n    Outlaws of Alkenstar Player’s Guide © 2022, Paizo Inc.; Author: Patrick\n    Renie.\n  </p>",
                            mod: "<p>\n    Outlaws of Alkenstar Player’s Guide © 2022, Paizo Inc.; Author: Patrick\n    Renie.\n  </p>\n  <p>Deutsche Ausgabe Pathfinder Abenteuerpfad Die Gesetzlosen von Alkenstern © 2023 von Ulisses Spiele GmbH, Waldems, unter Lizenz von Paizo Inc., USA.</p>",
                        },
                    ],
                },
            },
        },
        {
            moduleId: "pf2e-ap179-cradle-of-quartz",
            modulePath: "C:/Users/marco/OneDrive/Dokumente/RPG/FoundryVTT/Data/modules",
            modulePacks: [{ name: "adventures", path: "packs/adventures" }],
            savePaths: {
                bestiarySources:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/dev/bestiarySources.json",
                extractedJournals:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/dev/journals/source",
                localizedJournals:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/dev/journals/target",
                xliffTranslation: "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/dev",
                moduleCompendium:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/compendium",
            },
            htmlModifications: {
                "outlaws-of-alkenstar-cradle-of-quartz": {
                    Frontmatter: [
                        {
                            base: '<img class="centered" src="modules/pf2e-ap179-cradle-of-quartz/assets/art/Correct_Paizo_Logo.webp" alt=" " style="shape-outside:url(\'modules/pf2e-ap179-cradle-of-quartz/assets/art/Correct_Paizo_Logo.webp\')" />\n    <p>Paizo Inc.</p>\n    <p>7120 185th Ave NE Ste</p>\n    <p>Redmond, WA 98052-</p>\n    <p>paizo.com</p>',
                            mod: '<p><strong>Deutsche Ausgabe</strong> Ulisses Spiele GmbH</p>\n    <p><strong>Titel der Originalausgabe</strong> Pathfinder Adventure Path #179: Cradle of Quartz</p>\n    <p><strong>Übersetzung</strong> Mara Felske, Stefan Radermacher, Jasmine Rechberger, Ulrich-Alexander Schmidt und Klaus Singvogel</p>\n    <p><strong>Lektorat und Korrektorat</strong> Christian Brüggen, Claudia Feld, Mara Felske, Stefan Radermacher und Jasmine Rechberger</p>\n    <p><strong>Deutsche Foundry-Umsetzung</strong> Marco Seither</p>\n    <img class="centered" src="modules/pf2e-ap179-cradle-of-quartz/assets/art/Correct_Paizo_Logo.webp" alt=" " style="shape-outside:url(\'modules/pf2e-ap179-cradle-of-quartz/assets/art/Correct_Paizo_Logo.webp\')" />\n    <p>Paizo Inc.</p>\n    <p>7120 185th Ave NE Ste</p>\n    <p>Redmond, WA 98052-</p>\n    <p>paizo.com</p>\n    <img class="centered" src="modules/pf2e-outlaws-of-alkenstar-german/assets/art/ulisses-logo.webp" alt="">\n    <p>Ulisses Medien & Spiel Distribution GmbH</p>\n    <p>Industriestraße 11</p>\n    <p>65529 Waldems / Steinfischbach</p>\n    <p>ulisses-spiele.de</p>',
                        },
                    ],
                    Landing: [
                        {
                            base: "    <p>\n      <strong>To report bugs or other issues with this product, please fill out a support request with our service\n        desk.</strong>\n    </p>",
                            mod: "    <p>\n      <strong>To report bugs or other issues with this product, please fill out a support request with our service\n        desk. Solltest du einen Fehler in der Deutschen Übersetzung feststellen, dann lege hier ein Ticket an: https://github.com/Foundry-VTT-PF2-German/premium-modules</strong>\n    </p>"
                        },
                    ],
                    License: [
                        {
                            base: "<p><strong>Pathfinder Adventure Path #179</strong>: Cradle of Quartz 2022, Paizo Inc.; Authors: Scott D. Young<br />and Ron Lundeen.</p>",
                            mod: "<p><strong>Pathfinder Adventure Path #179</strong>: Cradle of Quartz 2022, Paizo Inc.; Authors: Scott D. Young<br />and Ron Lundeen.</p>\n<p>Deutsche Ausgabe Pathfinder Abenteuerpfad Die Gesetzlosen von Alkenstern © 2023 von Ulisses Spiele GmbH, Waldems, unter Lizenz von Paizo Inc., USA.</p>",
                        },
                    ],
                },
            },
        },
        {
            moduleId: "pf2e-ap180-the-smoking-gun",
            modulePath: "C:/Users/marco/OneDrive/Dokumente/RPG/FoundryVTT/Data/modules",
            modulePacks: [{ name: "adventures", path: "packs/adventures" }],
            savePaths: {
                bestiarySources:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/dev/bestiarySources.json",
                extractedJournals:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/dev/journals/source",
                localizedJournals:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/dev/journals/target",
                xliffTranslation: "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/dev",
                moduleCompendium:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-outlaws-of-alkenstar-german/compendium",
            },
            htmlModifications: {
                "outlaws-of-alkenstar-the-smoking-gun": {
                    Frontmatter: [
                        {
                            base: '<img class="centered" src="modules/pf2e-ap180-the-smoking-gun/assets/art/Correct_Paizo_Logo.webp" alt=" " style="shape-outside:url(\'modules/pf2e-ap180-the-smoking-gun/assets/art/Correct_Paizo_Logo.webp\')" />\n    <p>Paizo Inc.</p>\n    <p>7120 185th Ave NE Ste</p>\n    <p>Redmond, WA 98052-</p>\n    <p>paizo.com</p>',
                            mod: '<p><strong>Deutsche Ausgabe</strong> Ulisses Spiele GmbH</p>\n    <p><strong>Titel der Originalausgabe</strong> Pathfinder Adventure Path #180: The Smoking Gun</p>\n    <p><strong>Übersetzung</strong> Mara Felske, Stefan Radermacher, Jasmine Rechberger, Ulrich-Alexander Schmidt und Klaus Singvogel</p>\n    <p><strong>Lektorat und Korrektorat</strong> Christian Brüggen, Claudia Feld, Mara Felske, Stefan Radermacher und Jasmine Rechberger</p>\n    <p><strong>Deutsche Foundry-Umsetzung</strong> Marco Seither</p>\n    <img class="centered" src="modules/pf2e-ap180-the-smoking-gun/assets/art/Correct_Paizo_Logo.webp" alt=" " style="shape-outside:url(\'modules/pf2e-ap180-the-smoking-gun/assets/art/Correct_Paizo_Logo.webp\')" />\n    <p>Paizo Inc.</p>\n    <p>7120 185th Ave NE Ste</p>\n    <p>Redmond, WA 98052-</p>\n    <p>paizo.com</p>\n    <img class="centered" src="modules/pf2e-outlaws-of-alkenstar-german/assets/art/ulisses-logo.webp" alt="">\n    <p>Ulisses Medien & Spiel Distribution GmbH</p>\n    <p>Industriestraße 11</p>\n    <p>65529 Waldems / Steinfischbach</p>\n    <p>ulisses-spiele.de</p>',
                        },
                    ],
                    Landing: [
                        {
                            base: "       <p>\n         <strong>To report bugs or other issues with this product, please fill out a support request with our service\n           desk.</strong>\n       </p>",
                            mod: "       <p>\n         <strong>To report bugs or other issues with this product, please fill out a support request with our service\n           desk. Solltest du einen Fehler in der Deutschen Übersetzung feststellen, dann lege hier ein Ticket an: https://github.com/Foundry-VTT-PF2-German/premium-modules</strong>\n       </p>"
                        },
                    ],
                    License: [
                        {
                            base: "<p><strong>Pathfinder Adventure Path #180:</strong> The Smoking Gun © 2022, Paizo Inc.; Author: Cole Kronewitter.</p>",
                            mod: "<p><strong>Pathfinder Adventure Path #180:</strong> The Smoking Gun © 2022, Paizo Inc.; Author: Cole Kronewitter.</p>\n<p>Deutsche Ausgabe Pathfinder Abenteuerpfad Die Gesetzlosen von Alkenstern © 2023 von Ulisses Spiele GmbH, Waldems, unter Lizenz von Paizo Inc., USA.</p>",
                        },
                    ],
                },
            },
        },
        {
            moduleId: "pf2e-rusthenge",
            modulePath: "C:/Users/marco/OneDrive/Dokumente/RPG/FoundryVTT/Data/modules",
            modulePacks: [{ name: "adventures", path: "packs/adventures" }],
            savePaths: {
                bestiarySources:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-rusthenge-german/dev/bestiarySources.json",
                extractedJournals:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-rusthenge-german/dev/journals/source",
                localizedJournals:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-rusthenge-german/dev/journals/target",
                xliffTranslation: "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-rusthenge-german/dev",
                moduleCompendium: "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-rusthenge-german/compendium",
                bestiaryCompendiums:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-rusthenge-german/compendium/actors",
            },
            htmlModifications: {
                rusthenge: {
                    Credits: [
                        {
                            base: "<p>\n  <strong>Warehouse Team</strong>\n  Alexander Crain, Summer Foerch, James Mafi, Evan Panek, and Jesus Reynoso Ortiz\n</p>",
                            mod: '<p>\n  <strong>Warehouse Team</strong>\n  Alexander Crain, Summer Foerch, James Mafi, Evan Panek, and Jesus Reynoso Ortiz\n</p>\n<h2 class="no-toc">Ulisses Mitarbeiter:innen</h2>\n<p>\n  Zoe Adamietz, Philipp Baas, Mirko Bader, Tania Bogomazova, Steffen Brand, Bill Bridges, Martin Brunninger, Leamon Crafton, Carlos Diaz, Nico Dreßen, Christian Elsässer, Cora Elsässer, Daniel Friedrich, Frauke Forster, Jan Gawlik, Vanessa Heilmaier, Nils Herzmann, Nikolai Hoch, David Hofmann, Curtis Howard, Jan Hulverscheidt, Nadine Indlekofer, Philipp Jerulank, Johannes Kaub, Nele Klumpe, Christian Lonsing, Matthias Lück, Thomas Michalski, Carolina Möbis, Vincent Modler, Carsten Moos, Johanna Moos, Sven Paff, Felix Pietsch, Markus Plötz, Marlies Plötz, Hanna Riehm, Annika Richter, Nadine Schäkel, Maik Schmidt, Ulrich-Alexander Schmidt, Thomas Schwertfeger, Alex Spohr, Stefan Tannert, Victoria Umbach, Hannah van den Höövel, Jan Wagner, Carina Wittrin\n</p>',
                        },
                    ],
                    Landing: [
                        {
                            base: "  <p>\n    <strong>To report bugs or other issues with this product, please fill out a support request with our service\n      desk.</strong>\n  </p>",
                            mod: "  <p>\n    <strong>To report bugs or other issues with this product, please fill out a support request with our service\n      desk. Solltest du einen Fehler in der Deutschen Übersetzung feststellen, dann lege hier ein Ticket an: https://github.com/Foundry-VTT-PF2-German/premium-modules</strong>\n  </p>",
                        },
                    ],
                    "Open Game License Version 1.0a": [
                        {
                            base: "<p><strong>Pathfinder Adventure: Rusthenge</strong> © 2023, Paizo Inc.; Author: Vanessa Hoskins.</p>",
                            mod: "<p><strong>Pathfinder Adventure: Rusthenge</strong> © 2023, Paizo Inc.; Author: Vanessa Hoskins.</p>\n<p><strong>Deutsche Ausgabe Pathfinder Abenteuermodul: Rusthenge</strong> © 2024 von Ulisses Spiele GmbH, Waldems, unter Lizenz von Paizo Inc. , USA.",
                        },
                    ],
                    Rusthenge: [
                        {
                            base: "  <p><strong>PUBLISHER</strong></p>\n  <p>Erik Mona</p>",
                            mod: "  <p><strong>PUBLISHER</strong></p>\n  <p>Erik Mona</p>\n  <p><strong>DEUTSCHE AUSGABE</strong></p>\n  <p>Ulisses Spiele GmbH</p>\n  <p><strong>TITEL DER ORIGINALAUSGABE</strong></p>\n  <p>Rusthenge</p>\n  <p><strong>TEXTBEARBEITUNG</strong></p>\n  <p>Ulrich-Alexander Schmidt</p>\n  <p><strong>LAYOUT</strong></p>\n  <p>Vincent Modler</p>\n  <p><strong>DEUTSCHE FOUNDRY-UMSETZUNG</strong></p>\n  <p>Leon Peuser, Marco Seither</p>",
                        },
                    ],
                },
            },
        },
        {
            moduleId: "pf2e-ap200-seven-dooms-for-sandpoint",
            modulePath: "C:/Users/marco/OneDrive/Dokumente/RPG/FoundryVTT/Data/modules",
            modulePacks: [{ name: "adventures", path: "packs/adventures" }],
            savePaths: {
                bestiarySources:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-seven-dooms-for-sandpoint-german/dev/bestiarySources.json",
                extractedJournals:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-seven-dooms-for-sandpoint-german/dev/journals/source",
                localizedJournals:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-seven-dooms-for-sandpoint-german/dev/journals/target",
                xliffTranslation: "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-seven-dooms-for-sandpoint-german/dev",
                moduleCompendium: "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-seven-dooms-for-sandpoint-german/compendium",
                bestiaryCompendiums:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-seven-dooms-for-sandpoint-german/compendium/actors",
            },
            htmlModifications: {
                "seven-dooms-for-sandpoint": {
                    TODO: [
                        {
                            base: "<p>\n  <strong>Warehouse Team</strong>\n  Alexander Crain, Summer Foerch, James Mafi, Evan Panek, and Jesus Reynoso Ortiz\n</p>",
                            mod: '<p>\n  <strong>Warehouse Team</strong>\n  Alexander Crain, Summer Foerch, James Mafi, Evan Panek, and Jesus Reynoso Ortiz\n</p>\n<h2 class="no-toc">Ulisses Mitarbeiter:innen</h2>\n<p>\n  Zoe Adamietz, Philipp Baas, Mirko Bader, Tania Bogomazova, Steffen Brand, Bill Bridges, Martin Brunninger, Leamon Crafton, Carlos Diaz, Nico Dreßen, Christian Elsässer, Cora Elsässer, Daniel Friedrich, Frauke Forster, Jan Gawlik, Vanessa Heilmaier, Nils Herzmann, Nikolai Hoch, David Hofmann, Curtis Howard, Jan Hulverscheidt, Nadine Indlekofer, Philipp Jerulank, Johannes Kaub, Nele Klumpe, Christian Lonsing, Matthias Lück, Thomas Michalski, Carolina Möbis, Vincent Modler, Carsten Moos, Johanna Moos, Sven Paff, Felix Pietsch, Markus Plötz, Marlies Plötz, Hanna Riehm, Annika Richter, Nadine Schäkel, Maik Schmidt, Ulrich-Alexander Schmidt, Thomas Schwertfeger, Alex Spohr, Stefan Tannert, Victoria Umbach, Hannah van den Höövel, Jan Wagner, Carina Wittrin\n</p>',
                        },
                    ]
                },
            },
        },
        {
            moduleId: "pf2e-zda",
            modulePath: "C:/Users/marco/OneDrive/Dokumente/RPG/FoundryVTT/Data/modules",
            modulePacks: [{ name: "adventures", path: "packs/adventures" }],
            savePaths: {
                bestiarySources:
                    "C:/Users/marco/OneDrive/Dokumente/RPG/Pathfinder - Arbeit/Abenteuer/Zeit der Asche/bestiarySources.json",
                bestiaryCompendiums:
                    "C:/Users/marco/OneDrive/Dokumente/RPG/Pathfinder - Arbeit/Abenteuer/Zeit der Asche/fertiges Kompendium/actors",
            },
        },
        {
            moduleId: "pf2e-beginner-box",
            modulePath: "C:/Users/marco/OneDrive/Dokumente/RPG/FoundryVTT/Data/modules",
            modulePacks: [{ name: "adventures", path: "packs/adventures" }],
            savePaths: {
                bestiarySources:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-beginner-box-german/actors/bestiarySources.locked.json",
                bestiaryCompendiums: "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-beginner-box-german/actors",
                extractedJournals:
                    "C:/Users/marco/OneDrive/Dokumente/GitHub/pf2e-beginner-box-german/journals/source",
            },
            htmlModifications: {
                "menace-under-otari": {
                    "Paizo Credits": [
                        {
                            base: "<h3>Publisher:</h3><p>Erik Mona</p>",
                            mod: "<h3>Publisher:</h3><p>Erik Mona</p><h3>Deutsche Ausgabe:</h3><p>Ulisses-Spiele</p><h3>Originaltitel:</h3><p>Pathfinder Beginners Box (Second Edition)</p><h3>Übersetzung:</h3><p>Claudia Feld, Ulrich-Alexander Schmidt</p><h3>Lektorat und Korrektorat:</h3><p>Moritz Bednarski, Maik Siegmund-Malcherek</p><h3>Layout:</h3><p>Maria Söntgenrath</p>",
                        },
                    ],
                },
            },
        },
    ],
    actorDatabase: {
        fields: ["name"],
        packs: {
            "pathfinder-bestiary": "pf2e.pathfinder-bestiary",
            "pathfinder-bestiary-2": "pf2e.pathfinder-bestiary-2",
            "pathfinder-bestiary-3": "pf2e.pathfinder-bestiary-3",
            "blog-bestiary": "pf2e.blog-bestiary",
        },
        blacklist: [],
    },
    itemDatabase: {
        fields: ["name"],
        packs: {
            equipment: "pf2e.equipment-srd",
            spells: "pf2e.spells-srd",
            "bestiary-ability-glossary-srd": "pf2e.bestiary-ability-glossary-srd",
            "bestiary-family-ability-glossary": "pf2e.bestiary-family-ability-glossary",
        },
        blacklist: [
            "Compendium.pf2e.spells-srd.Item.o0l57UfBm9ScEUMW",
            "Compendium.pf2e.spells-srd.Item.6dDtGIUerazSHIOu",
        ],
    },
};
