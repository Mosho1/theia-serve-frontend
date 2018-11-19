import { injectable, inject, } from "inversify";
import { MAIN_MENU_BAR, CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry, MessageService } from "@theia/core/lib/common";
import { WorkspaceService } from "@theia/workspace/lib/browser";
import { EditorManager, EditorKeybindingContexts } from '@theia/editor/lib/browser';

import URI from '@theia/core/lib/common/uri';
import { KeybindingRegistry, KeybindingContribution } from "@theia/core/lib/browser";


export const TheiaServeExtCommand = {
    id: 'TheiaServeExt.command',
    label: 'Run current file'
};

export namespace RunMenus {
    export const RUN = [...MAIN_MENU_BAR, '4_run'];
}

let iframe: HTMLIFrameElement | null = null;
const runModule = async (path: string, port = 4000) => {
    if (iframe) document.body.removeChild(iframe);
    const url = `${location.protocol}//${location.hostname}:${port}/${path.replace(/^\//, '')}`;
    iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const script = document.createElement('script');
    script.type = 'module';
    script.src = url;
    if (iframe.contentWindow)
        iframe.contentWindow.document.body.appendChild(script);
};

@injectable()
export class TheiaServeExtCommandContribution implements CommandContribution, KeybindingContribution, MenuContribution {
    constructor(
        @inject(EditorManager) protected readonly editors: EditorManager,
        @inject(WorkspaceService) private readonly workspaceService: WorkspaceService,
        @inject(MessageService) private readonly messageService: MessageService,
    ) { }

    get currentRelativePath() {
        const { currentEditor } = this.editors;
        if (!currentEditor) return null;

        const resourceUri = currentEditor.getResourceUri();
        if (!resourceUri) return null;

        const { workspace } = this.workspaceService;
        if (!workspace) return null;

        const workspaceUri = new URI(workspace.uri);
        return workspaceUri.relative(resourceUri);
    }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(TheiaServeExtCommand, {
            execute: async () => {
                const path = this.currentRelativePath;
                if (path) {
                    const rawPath = (path as any).raw;
                    try {
                        await runModule(rawPath);
                    } catch (e) {
                        this.messageService.error('could not run file!');
                        console.error(e);
                    }
                } else {
                    this.messageService.info('nothing open!')
                }
            }
        });
    }

    registerKeybindings(keybindings: KeybindingRegistry) {
        keybindings.registerKeybinding({
            command: TheiaServeExtCommand.id,
            keybinding: 'ctrl+f6',
            context: EditorKeybindingContexts.editorTextFocus
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerSubmenu(RunMenus.RUN, 'Run');
        menus.registerMenuAction(RunMenus.RUN, {
            commandId: TheiaServeExtCommand.id,
            label: TheiaServeExtCommand.label,
        });
    }
}

