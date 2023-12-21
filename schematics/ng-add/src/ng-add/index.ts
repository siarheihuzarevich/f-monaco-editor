import { Rule, SchematicContext, Tree, chain } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addPackageJsonDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { updateWorkspace, getWorkspace } from '@schematics/angular/utility/workspace';
import { NodePackageLinkTask } from '@angular-devkit/schematics/tasks';
import { ISchemaProperties } from './i-schema-properties';
import { IProjectDefinition } from './i-project-definition';

function addDependency(): Rule {
  return (host: Tree, _context: SchematicContext) => {
    const dependency = { type: NodeDependencyType.Default, version: '^0.0.1', name: '@foblex/monaco-editor' };
    addPackageJsonDependency(host, dependency);
    return host;
  };
}

function updateAngularJson(projectName: string): Rule {
  return updateWorkspace(workspace => {
    const project = workspace.projects.get(projectName);

    if (project && project.targets.get('build')) {
      const buildTarget = project.targets.get('build')!;
      if (!buildTarget.options) {
        throw new Error(`Cannot read options of build target in angular.json for project "${ projectName }"`);
      }
      const assets = (buildTarget.options.assets || []) as Array<any>;
      assets.push({
        "glob": "**/*",
        "input": "node_modules/monaco-editor",
        "output": "./assets/monaco-editor"
      });
      buildTarget.options.assets = assets;
    }
  });
}

export function ngAdd(_options: ISchemaProperties): Rule {
  return async (host: Tree, context: SchematicContext) => {

    let projectName = _options.projectName;
    context.logger.info(`Project name received: ${ projectName }`);

    const workspace = await getWorkspace(host);
    const allProjectNames = Array.from(workspace.projects.keys());
    const allProjects = Array.from(workspace.projects.values()).map((x, index) => {
      return {
        ...x,
        name: allProjectNames[ index ],
      } as unknown as IProjectDefinition
    });
    const appProjects = allProjects.filter((p: IProjectDefinition) => {
      return p.extensions[ 'projectType' ] === 'application';
    });
    const libProjects = allProjects.filter((p: IProjectDefinition) => {
      return p.extensions[ 'projectType' ] === 'library';
    });
    if (!appProjects.length) {
      throw new Error('No application projects found. Please add a project of type "application" to your workspace.');
    }
    workspace.extensions[ 'defaultProject' ] = appProjects[ 0 ].name;

    if (!projectName && workspace.extensions[ 'defaultProject' ]) {
      projectName = workspace.extensions[ 'defaultProject' ] as string;
    }

    if (projectName) {
      if (libProjects.find((x) => x.name === projectName)) {
        throw new Error(`The specified project "${ projectName }" is a library project. Please specify an application project.`);
      }

      if (!appProjects.find((p: IProjectDefinition) => p.name === projectName)) {
        throw new Error(`The specified project "${ projectName }" does not exist.`);
      }
    } else {
      if (appProjects.length === 1) {
        projectName = appProjects[ 0 ].name;
      } else {
        throw new Error('Multiple application projects found. Please specify the project name.');
      }
    }

    return chain([
      addDependency(),
      updateAngularJson(projectName),
      (_host: Tree, _context: SchematicContext) => {
        _context.addTask(new NodePackageLinkTask('@foblex/monaco-editor'));
        _context.addTask(new NodePackageInstallTask());
        _context.logger.info(`✔️Added @foblex/monaco-editor to dependencies and updated angular.json for ${ projectName }`);
      },
    ]);
  };
}
