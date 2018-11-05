/**
 * Generated using theia-extension-generator
 */

import { TheiaServeExtCommandContribution, TheiaServeExtMenuContribution } from './theia-serve-ext-contribution';
import {
    CommandContribution,
    MenuContribution
} from "@theia/core/lib/common";

import { ContainerModule } from "inversify";

export default new ContainerModule(bind => {
    // add your contribution bindings here
    
    bind(CommandContribution).to(TheiaServeExtCommandContribution);
    bind(MenuContribution).to(TheiaServeExtMenuContribution);
    
});