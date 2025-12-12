export const PIXOSCRIPT_API = {
    'Zone Management': [
        { name: 'pixos.load_zone(zone_name)', docs: 'Loads a new zone.', snippet: 'load_zone("${1:zone_path.json}")' },
        { name: 'pixos.get_current_zone()', docs: 'Returns the name of the current zone.', snippet: 'get_current_zone()' },
    ],
    'Flags & State': [
        { name: 'pixos.set_flag(flag, value)', docs: 'Sets a game state flag.', snippet: 'set_flag("${1:flag_name}", ${2:true})' },
        { name: 'pixos.get_flag(flag)', docs: 'Gets the value of a game state flag.', snippet: 'get_flag("${1:flag_name}")' },
        { name: 'pixos.has_item(item_id)', docs: 'Checks if the player has an item.', snippet: 'has_item("${1:item_id}")' },
        { name: 'pixos.give_item(item_id, quantity)', docs: 'Gives an item to the player.', snippet: 'give_item("${1:item_id}", ${2:1})' },
        { name: 'pixos.take_item(item_id, quantity)', docs: 'Takes an item from the player.', snippet: 'take_item("${1:item_id}", ${2:1})' },
    ],
    'Cutscenes & Dialogue': [
        { name: 'pixos.run_cutscene(cutscene_path)', docs: 'Runs a cutscene from a .pxc file.', snippet: 'run_cutscene("${1:cutscene.pxc}")' },
        { name: 'pixos.sprite_dialogue(sprite_id, text)', docs: 'Shows a dialogue bubble above a sprite.', snippet: 'sprite_dialogue("${1:sprite_id}", "${2:Hello}")' },
        { name: 'pixos.show_dialogue(title, text)', docs: 'Shows a full-screen dialogue box.', snippet: 'show_dialogue("${1:title}", "${2:text}")' },
    ],
    'Sprite & Actor Control': [
        { name: 'pixos.move_sprite(sprite_id, x, y)', docs: 'Moves a sprite to a specific coordinate.', snippet: 'move_sprite("${1:sprite_id}", ${2:x}, ${3:y})' },
        { name: 'pixos.get_sprite_pos(sprite_id)', docs: 'Gets the position of a sprite.', snippet: 'get_sprite_pos("${1:sprite_id}")' },
        { name: 'pixos.set_sprite_visible(sprite_id, visible)', docs: 'Sets a sprite\'s visibility.', snippet: 'set_sprite_visible("${1:sprite_id}", ${2:true})' },
        { name: 'pixos.play_sprite_animation(sprite_id, anim_name)', docs: 'Plays a specific animation for a sprite.', snippet: 'play_sprite_animation("${1:sprite_id}", "${2:walk}")' },
    ],
    'Audio': [
        { name: 'pixos.play_sfx(sfx_path)', docs: 'Plays a sound effect.', snippet: 'play_sfx("${1:sound.wav}")' },
        { name: 'pixos.play_music(music_path)', docs: 'Plays background music.', snippet: 'play_music("${1:music.mp3}")' },
        { name: 'pixos.stop_music()', docs: 'Stops the current background music.', snippet: 'stop_music()' },
    ],
    'Camera': [
        { name: 'pixos.camera_shake(intensity, duration)', docs: 'Shakes the camera.', snippet: 'camera_shake(${1:5}, ${2:300})' },
        { name: 'pixos.camera_pan(x, y, duration)', docs: 'Pans the camera to a position.', snippet: 'camera_pan(${1:x}, ${2:y}, ${3:1000})' },
        { name: 'pixos.camera_follow(sprite_id)', docs: 'Makes the camera follow a sprite.', snippet: 'camera_follow("${1:player}")' },
    ],
    'Utility': [
        { name: 'pixos.wait(milliseconds)', docs: 'Pauses script execution.', snippet: 'wait(${1:1000})' },
        { name: 'pixos.sync(block)', docs: 'Executes a block of code that requires synchronization.', snippet: 'sync(function()\n  -- code\nend)' },
        { name: 'print(message)', docs: 'Prints a message to the console.', snippet: 'print("${1:message}")' },
    ]
};

const allApiFunctions = Object.values(PIXOSCRIPT_API).flat();

export const PixoScriptLanguage = {
    id: 'pixoscript',

    register: (monaco) => {
        monaco.languages.register({ id: 'pixoscript' });

        monaco.languages.setMonarchTokensProvider('pixoscript', {
            keywords: [
                'local', 'function', 'if', 'then', 'else', 'elseif', 'end',
                'for', 'while', 'do', 'repeat', 'until', 'return', 'and',
                'or', 'not', 'nil', 'true', 'false', 'in', 'break'
            ],

            pixosApi: allApiFunctions.map(fn => fn.name.split('(')[0]),

            tokenizer: {
                root: [
                    [/[a-zA-Z_]\w*/, {
                        cases: {
                            '@keywords': 'keyword',
                            '@pixosApi': 'pixos-api',
                            '@default': 'identifier'
                        }
                    }],
                    [/"[^"]*"/, 'string'],
                    [/'[^']*'/, 'string'],
                    [/--\[\[/, 'comment', '@comment'],
                    [/--.*$/, 'comment'],
                    [/[{}()\[\]]/, '@brackets'],
                    [/[\.,;]/, 'delimiter'],
                    [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
                    [/0[xX][0-9a-fA-F]+/, 'number.hex'],
                    [/\d+/, 'number'],
                ],
                comment: [
                    [/[^\]]+/, 'comment'],
                    [/\]\]/, 'comment', '@pop'],
                    [/\]/, 'comment']
                ],
            }
        });

        monaco.languages.registerCompletionItemProvider('pixoscript', {
            provideCompletionItems: (model, position) => {
                const suggestions = [];

                // Add API functions
                for (const category in PIXOSCRIPT_API) {
                    PIXOSCRIPT_API[category].forEach(fn => {
                        suggestions.push({
                            label: fn.name,
                            kind: monaco.languages.CompletionItemKind.Function,
                            insertText: fn.snippet,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: {
                                value: `**${category}**\n\n${fn.docs}`
                            },
                            detail: fn.docs,
                        });
                    });
                }

                // Add keywords
                const keywords = ['local', 'function', 'if', 'then', 'else', 'end', 'for', 'while', 'return'];
                keywords.forEach(kw => {
                    suggestions.push({
                        label: kw,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: kw,
                    });
                });

                return { suggestions };
            }
        });

        monaco.languages.registerHoverProvider('pixoscript', {
            provideHover: (model, position) => {
                const word = model.getWordAtPosition(position);
                if (!word) return;

                const func = allApiFunctions.find(fn => fn.name.startsWith(word.word));
                if (func) {
                    const category = Object.keys(PIXOSCRIPT_API).find(key => PIXOSCRIPT_API[key].some(f => f.name === func.name));
                    return {
                        contents: [
                            { value: `\`\`\`lua\n${func.name}\n\`\`\`` },
                            { value: `**${category}**` },
                            { value: func.docs },
                        ]
                    };
                }
            }
        });

        monaco.editor.defineTheme('pixoscript-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'pixos-api', foreground: '9CDCFE' }, // Light blue for API calls
                { token: 'keyword', foreground: 'C586C0' }, // Purple for keywords
                { token: 'string', foreground: 'CE9178' }, // Orange for strings
                { token: 'comment', foreground: '6A9955' }, // Green for comments
                { token: 'number', foreground: 'B5CEA8' }, // Light green for numbers
            ],
            colors: {
                'editor.background': '#1E1E1E'
            }
        });
    }
};

// Backwards-compatible named export expected by the editor
export function registerPixoScriptLanguage(monaco) {
    if (!monaco) return;
    PixoScriptLanguage.register(monaco);
}

export default registerPixoScriptLanguage;