/**
 * Generated using theia-extension-generator
 */

import { TheiaServeExtCommandContribution } from './theia-serve-ext-contribution';
import {
    CommandContribution,
    MenuContribution
} from "@theia/core/lib/common";

import { ContainerModule } from "inversify";
import { KeybindingContribution } from '@theia/core/lib/browser';

export default new ContainerModule(bind => {
    // add your contribution bindings here
    bind(TheiaServeExtCommandContribution).toSelf().inSingletonScope();
    [CommandContribution, KeybindingContribution, MenuContribution].forEach(serviceIdentifier =>
        bind(serviceIdentifier).toDynamicValue(ctx => ctx.container.get(TheiaServeExtCommandContribution)).inSingletonScope()
    );
});