import { injectable, inject, } from "inversify";
import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry, MessageService } from "@theia/core/lib/common";
import { WorkspaceService } from "@theia/workspace/lib/browser";
import { NavigationLocationService } from "@theia/editor/lib/browser/navigation/navigation-location-service";
import { CommonMenus } from "@theia/core/lib/browser";
import { EditorManager, EditorWidget } from '@theia/editor/lib/browser';
import URI from '@theia/core/lib/common/uri';

export const TheiaServeExtCommand = {
    id: 'TheiaServeExt.command',
    label: 'Run current file'
};

const runModule = async (path: string, port = 4000) => {
    const url = `${location.protocol}//${location.hostname}:${port}/${path.replace(/^\//, '')}`;
    await eval(`import("${url}?${Date.now()}")`);
};

@injectable()
export class TheiaServeExtCommandContribution implements CommandContribution {

    @inject(EditorManager) protected readonly editors: EditorManager;
    @inject(WorkspaceService) private readonly workspaceService: WorkspaceService;
    @inject(NavigationLocationService) private readonly navigationLocationService: NavigationLocationService;
    @inject(MessageService) private readonly messageService: MessageService;

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
}

@injectable()
export class TheiaServeExtMenuContribution implements MenuContribution {

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
            commandId: TheiaServeExtCommand.id,
            label: TheiaServeExtCommand.label
        });
    }
}