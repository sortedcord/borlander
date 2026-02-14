import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] ?? path.join(process.cwd(), 'borlander'));
const SITES_DIR = path.join(ROOT, 'sites');
const OUT_FILE = path.join(ROOT, 'themes.json');

/**
 * Heuristics for themes that don't map 1:1 to a hostname.
 * Keyed by folder name under sites/.
 */
const HEURISTICS = {
    'sonarr.local': {
        type: 'heuristic',
        detect: {
            titleIncludes: 'sonarr',
            cssVarNonEmpty: '--sonarrBlue'
        }
    },
    'gitea.local': {
        type: 'heuristic',
        detect: {
            metaContentIncludes: 'gitea',
            hostnameIncludes: 'gitea'
        }
    }
};

const HOSTNAME_ALIASES = {
    // folderName: hostnameIncludes
    'web.whatsapp.com': 'web.whatsapp.com'
};

async function fileExists(p) {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
}

const entries = [];
const siteFolders = (await fs.readdir(SITES_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

for (const folder of siteFolders) {
    const cssPath = path.join(SITES_DIR, folder, 'styles.css');
    if (!(await fileExists(cssPath))) continue;

    const relCssPath = `sites/${folder}/styles.css`;

    if (HEURISTICS[folder]) {
        entries.push({
            id: folder,
            cssPath: relCssPath,
            ...HEURISTICS[folder]
        });
        continue;
    }

    const hostnameIncludes = HOSTNAME_ALIASES[folder] ?? folder;
    entries.push({
        id: folder,
        type: 'hostname',
        hostnameIncludes,
        cssPath: relCssPath
    });
}

const payload = {
    version: 1,
    themes: entries
};

await fs.writeFile(OUT_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf8');
console.log(`Wrote ${entries.length} themes to ${path.relative(process.cwd(), OUT_FILE)}`);
