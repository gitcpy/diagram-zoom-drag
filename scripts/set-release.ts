import { execSync } from 'node:child_process';
import fs from 'node:fs';
import * as process from 'node:process';
import readline from 'node:readline';
import semver from 'semver';
import blessed from 'blessed';

const MANIFEST_PATH = 'manifest.json';
const PACKAGE_PATH = 'package.json';
const README_PATH = 'README.md';
const CHANGELOG_PATH = 'CHANGELOG.md';

interface JsonFile {
    version: string;
}

/**
 * Reads a JSON file, updates its "version" property, and writes it back.
 *
 * @param jsonPath - Path to the JSON file to be updated.
 * @param release - New version number to be written.
 *
 * @throws If there is an error reading the JSON file, it will be logged to console
 *          and the process will exit with code 1.
 */
function changeReleaseInJson(jsonPath: string, release: string) {
    try {
        const json = fs.readFileSync(jsonPath, 'utf8');
        const data: JsonFile = JSON.parse(json);
        data.version = release;
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    } catch (err: any) {
        console.error('Error reading JSON file:', err);
        process.exit(1);
    }
}

/**
 * Asks a question to the user and returns their answer as a Promise.
 *
 * @param question - The question to ask the user.
 *
 * @returns A Promise that resolves with the user's answer.
 */
async function askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

/**
 * Runs a sequence of Git commands to commit and tag a new plugin version.
 *
 * @param RELEASE_VERSION - New version number to be written.
 * @param branch - Name of the Git branch to commit to.
 *
 * @throws If any of the Git commands fail, the error will be logged to console
 *          and the process will exit with code 1.
 */
async function performGitCommands(RELEASE_VERSION: string, branch: string) {
    try {
        execSync('git reset', { stdio: 'inherit' });
        execSync(`git add ${PACKAGE_PATH} ${MANIFEST_PATH}`, {
            stdio: 'inherit',
        });
        execSync(`git commit -m 'chore: update plugin version'`, {
            stdio: 'inherit',
        });
        execSync('git push', { stdio: 'inherit' });
        execSync(`git tag ${RELEASE_VERSION}`, { stdio: 'inherit' });
        execSync(`git push origin ${branch} ${RELEASE_VERSION}`, {
            stdio: 'inherit',
        });
    } catch (error) {
        console.error('An error occurred during git operations:', error);
        process.exit(1);
    }
}

/**
 * Asks user for a new version number until a valid, non-existing and
 * greater than the current version number is entered.
 *
 * @param previousVersions - An array of all previous version numbers.
 * @param currentVersion - The current version number.
 *
 * @returns A Promise that resolves with the new version number as a string.
 */
async function getNewVersion(
    previousVersions: string[],
    currentVersion: string
) {
    while (true) {
        const answer = await askQuestion(
            'Enter new version number or type exit to quit: '
        ).then((answer) => answer.toLowerCase());

        if (answer === 'exit') {
            console.log('See you later!');
            process.exit(0);
        }

        if (!semver.valid(answer)) {
            console.log(
                'Invalid version format. Please try again. It should be semantic versioning (e.g., 1.2.3)\n'
            );
            continue;
        }

        if (previousVersions.includes(answer)) {
            console.log('Version already exists. Please try again.\n');
            continue;
        }

        if (semver.lt(answer, currentVersion)) {
            console.log(
                `Version must be greater than current version. Current version is: ${currentVersion}. Please try again.\n`
            );
            continue;
        }
        return answer;
    }
}

/**
 * Presents a menu to the user to update the current version.
 *
 * It offers the following options:
 * 1. Patch (bug fixes)
 * 2. Minor (new functionality)
 * 3. Major (significant changes)
 * 4. Manual update (enter version)
 * 5. View previous versions
 * 6. Exit
 *
 * The function will return the new version number as a string.
 *
 * @param previousVersions - An array of strings representing the previous version numbers.
 * @param currentVersion - The current version number as a string.
 *
 * @returns A Promise that resolves with the new version number as a string.
 */
async function versionMenu(
    previousVersions: string[],
    currentVersion: string
): Promise<string> {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    while (true) {
        console.log(
            `Update current version ${currentVersion} or perform other actions:`
        );
        console.log('1. Patch (bug fixes)');
        console.log(
            `   Example: ${major}.${minor}.${patch} → ${major}.${minor}.${patch + 1} (increment last number)`
        );
        console.log('2. Minor (new functionality)');
        console.log(
            `   Example: ${major}.${minor}.${patch} → ${major}.${minor + 1}.0 (increment middle number)`
        );
        console.log('3. Major (significant changes)');
        console.log(
            `   Example: ${major}.${minor}.${patch} → ${major + 1}.0.0 (increment first number)`
        );
        console.log('4. Manual update (enter version)');
        console.log('5. View previous versions');
        console.log('6. Exit');

        const choice = await askQuestion('Your choice (1-6): ');

        if (choice === '1') {
            return `${major}.${minor}.${patch + 1}`;
        } else if (choice === '2') {
            return `${major}.${minor + 1}.0`;
        } else if (choice === '3') {
            return `${major + 1}.0.0`;
        } else if (choice === '4') {
            return getNewVersion(previousVersions, currentVersion);
        } else if (choice === '5') {
            console.clear();
            console.log('Previous versions:');
            for (const version of previousVersions) {
                console.log(`- ${version}`);
            }
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            console.log('Press Enter to go back to the menu...');
            await new Promise<void>((resolve) => {
                rl.on('line', () => {
                    rl.close();
                    resolve();
                });
            });
            rl.close();
            console.clear();
            continue;
        } else if (choice === '6') {
            console.log('See you later!');
            process.exit(0);
        } else {
            console.log('Invalid choice. Please try again.');
            continue;
        }
    }
}

/**
 * Get the new version of the plugin. If there are no tags, it asks the user to choose the new
 * version. Otherwise, it shows a version menu
 * or pick a new version by entering a number.
 *
 * @returns The new version of the plugin.
 */
async function getVersion(): Promise<string> {
    const tagOutput = execSync('git tag', { stdio: 'pipe' }).toString().trim();
    const tags = tagOutput ? tagOutput.split('\n') : [];

    const currentVersion = tags[tags.length - 1];

    if (tags.length === 0) {
        return getNewVersion(tags, '0.0.0');
    }

    return versionMenu(tags, currentVersion);
}

/**
 * Show a full-screen menu with the given content. The content is displayed in a box that spans
 * the whole screen, and the user can navigate through the content using the arrow keys or mouse wheel. If the
 * content is too long to fit in the screen, the user can scroll through it. The menu also
 * displays a footer with instructions on how to quit. When the user presses q, the menu is
 * closed.
 *
 * @param content The content of the menu, which is displayed in a box that spans the whole
 *                screen.
 *
 * @returns A promise that resolves when the menu is closed.
 */
async function showFullScreenMenu(content: string): Promise<void> {
    const lines: string[] = content.split('\n');
    const screen = blessed.screen({
        smartCSR: true,
    });

    const box = blessed.box({
        top: '0',
        left: '0',
        right: '0',
        bottom: '1',
        content: '',
        tags: true,
        scrollable: true,
        alwaysScroll: true,
        mouse: true,
        keys: true,
        border: {
            type: 'line',
        },
        style: {
            border: {
                fg: 'cyan',
            },
            focus: {
                border: {
                    fg: 'yellow',
                },
            },
        },
    });

    const footer = blessed.box({
        bottom: 0,
        left: '0',
        right: '0',
        height: 1,
        content: '(Use arrow keys or mouse wheel to navigate, q to quit)',
        style: {
            fg: 'white',
            bg: 'black',
            bold: true,
        },
    });

    screen.append(box);
    screen.append(footer);

    const contentHeight = (screen.height as number) - 3;
    const needsScrolling = lines.length > contentHeight;

    const renderContent = (): void => {
        box.setContent(`Changes since last release:\n\n${content}`);
        screen.render();
    };

    screen.key(['q', 'C-c'], () => process.exit(0));

    if (needsScrolling) {
        screen.key(['up', 'k'], () => {
            box.scroll(-1);
            screen.render();
        });

        screen.key(['down', 'j'], () => {
            box.scroll(1);
            screen.render();
        });
    } else {
        footer.setContent('(Press q to quit)');
    }

    renderContent();

    return new Promise((resolve) => {
        screen.on('destroy', () => {
            resolve();
        });
    });
}

/**
 * Get the changes since the last release in a string format.
 * If there is an error, return a string saying that.
 * @returns A string of changes.
 */
async function getChangesSinceLastRelease() {
    try {
        const lastTag = execSync('git describe --tags --abbrev=0', {
            encoding: 'utf-8',
        }).trim();

        return execSync(
            `git log ${lastTag}..HEAD --pretty=format:"%h - %an, %ar : %s%n%n%b"`,
            { encoding: 'utf-8' }
        );
    } catch (error) {
        console.error('Error getting changes:', error);
        return 'Unable to fetch changes.';
    }
}

/**
 * Display a menu to the user to manually update the README.md and CHANGELOG.md files if needed.
 *
 * It offers the following options:
 * 1. Check out all changes from last release to update README.md and CHANGELOG.md manually
 * 2. Exit
 *
 * The function will call itself if the user selects invalid input.
 *
 * @returns A Promise that resolves when the user exits the menu.
 */
async function docsMenu(): Promise<void> {
    console.clear();
    console.log('Updating README.md and CHANGELOG.md...');
    console.log('Select following options:');
    console.log(
        '1. Check out all changes from last release to update README.md and CHANGELOG.md manually'
    );
    console.log('2. Exit');

    const answer = (await askQuestion('Your choice (1 or 2): ')).trim();

    if (answer === '1') {
        const changes = await getChangesSinceLastRelease();
        await showFullScreenMenu(changes);
        await docsMenu();
    } else if (answer === '2') {
        console.log('Exiting...');
    } else {
        console.log('Invalid choice. Please select a valid option.');
        await docsMenu();
    }
}

/**
 * Check if README.md and CHANGELOG.md exist, if not, throw an error.
 * If they exist, call `docsMenu`.
 *
 * @returns A Promise that resolves when the user exits the menu.
 */
async function checkDocs() {
    try {
        fs.accessSync(README_PATH, fs.constants.F_OK);
        fs.accessSync(CHANGELOG_PATH, fs.constants.F_OK);
        return docsMenu();
    } catch (err: any) {
        console.error('Please create README.md and CHANGELOG.md first');
        process.exit(1);
    }
}

/**
 * Update the version of the plugin in package.json and manifest.json.
 * It will ask the user to choose a new version number and if the user
 * wants to continue with git operations.
 *
 * If the user chooses to continue, it will commit the changes, create a
 * new tag and push it to the remote repository.
 *
 * @returns A Promise that resolves when the user exits the menu.
 */
async function setRelease() {
    await checkDocs();

    console.clear();

    const RELEASE_VERSION = await getVersion();

    const confirmedContinue = await askQuestion(
        `You entered version ${RELEASE_VERSION}. Continue? Yes/No/Retry (y/n/r): `
    ).then((answer) => answer.toLowerCase());

    while (true) {
        if (confirmedContinue.match(/y(es)?/gi)) {
            break;
        } else if (confirmedContinue.match(/n(o)?/gi)) {
            console.log('See you later!');
            process.exit(0);
        } else if (confirmedContinue.match(/r(etry)?/gi)) {
            return setRelease();
        } else {
            console.log('Invalid choice. Please try again.');
            continue;
        }
    }

    changeReleaseInJson(PACKAGE_PATH, RELEASE_VERSION);
    changeReleaseInJson(MANIFEST_PATH, RELEASE_VERSION);

    console.log(
        `Version updated to ${RELEASE_VERSION} in package.json and manifest.json`
    );

    const confirmContinue = await askQuestion(
        'Do you want to continue with git operations? Yes/No (y/n): '
    );

    if (!confirmContinue.match(/y(es)?/gi)) {
        console.log('See you later!');
        process.exit(1);
    }

    console.log('Committing changes...');
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
        stdio: 'pipe',
    })
        .toString()
        .trim();

    while (true) {
        console.log(
            `You are currently on branch ${currentBranch}. The new tag will be created on remote ${currentBranch}.`
        );
        const confirmation = await askQuestion(
            'Are you sure you want to continue? Yes/No (y/n): '
        );
        if (confirmation.match(/y(es)?/gi)) {
            break;
        } else if (confirmation.match(/n(o)?/gi)) {
            console.log('See you later!');
            process.exit(1);
        }
        console.clear();
    }
    await performGitCommands(RELEASE_VERSION, currentBranch);

    console.log(
        `Release ${RELEASE_VERSION} has been successfully created and pushed.`
    );
}

setRelease().catch((error) => {
    console.error('An unexpected error occurred:', error);
    process.exit(1);
});
