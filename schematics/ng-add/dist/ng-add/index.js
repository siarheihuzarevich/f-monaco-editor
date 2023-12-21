"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ngAdd = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const dependencies_1 = require("@schematics/angular/utility/dependencies");
const workspace_1 = require("@schematics/angular/utility/workspace");
const tasks_2 = require("@angular-devkit/schematics/tasks");
function addDependency() {
    return (host, _context) => {
        const dependency = { type: dependencies_1.NodeDependencyType.Default, version: '^0.0.1', name: '@foblex/monaco-editor' };
        (0, dependencies_1.addPackageJsonDependency)(host, dependency);
        return host;
    };
}
function updateAngularJson(projectName) {
    return (0, workspace_1.updateWorkspace)(workspace => {
        const project = workspace.projects.get(projectName);
        if (project && project.targets.get('build')) {
            const buildTarget = project.targets.get('build');
            if (!buildTarget.options) {
                throw new Error(`Cannot read options of build target in angular.json for project "${projectName}"`);
            }
            const assets = (buildTarget.options.assets || []);
            assets.push({
                "glob": "**/*",
                "input": "node_modules/monaco-editor",
                "output": "./assets/monaco-editor"
            });
            buildTarget.options.assets = assets;
        }
    });
}
function ngAdd(_options) {
    return (host, context) => __awaiter(this, void 0, void 0, function* () {
        let projectName = _options.projectName;
        context.logger.info(`Project name received: ${projectName}`);
        const workspace = yield (0, workspace_1.getWorkspace)(host);
        const allProjectNames = Array.from(workspace.projects.keys());
        const allProjects = Array.from(workspace.projects.values()).map((x, index) => {
            return Object.assign(Object.assign({}, x), { name: allProjectNames[index] });
        });
        const appProjects = allProjects.filter((p) => {
            return p.extensions['projectType'] === 'application';
        });
        const libProjects = allProjects.filter((p) => {
            return p.extensions['projectType'] === 'library';
        });
        if (!appProjects.length) {
            throw new Error('No application projects found. Please add a project of type "application" to your workspace.');
        }
        workspace.extensions['defaultProject'] = appProjects[0].name;
        if (!projectName && workspace.extensions['defaultProject']) {
            projectName = workspace.extensions['defaultProject'];
        }
        if (projectName) {
            if (libProjects.find((x) => x.name === projectName)) {
                throw new Error(`The specified project "${projectName}" is a library project. Please specify an application project.`);
            }
            if (!appProjects.find((p) => p.name === projectName)) {
                throw new Error(`The specified project "${projectName}" does not exist.`);
            }
        }
        else {
            if (appProjects.length === 1) {
                projectName = appProjects[0].name;
            }
            else {
                throw new Error('Multiple application projects found. Please specify the project name.');
            }
        }
        return (0, schematics_1.chain)([
            addDependency(),
            updateAngularJson(projectName),
            (_host, _context) => {
                _context.addTask(new tasks_2.NodePackageLinkTask('@foblex/monaco-editor'));
                _context.addTask(new tasks_1.NodePackageInstallTask());
                _context.logger.info(`✔️Added @foblex/monaco-editor to dependencies and updated angular.json for ${projectName}`);
            },
        ]);
    });
}
exports.ngAdd = ngAdd;
//# sourceMappingURL=index.js.map