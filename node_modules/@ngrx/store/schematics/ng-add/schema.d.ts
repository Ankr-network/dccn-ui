/// <amd-module name="@ngrx/store/schematics/ng-add/schema" />
export interface Schema {
    name: string;
    skipPackageJson?: boolean;
    path?: string;
    project?: string;
    module?: string;
    statePath?: string;
    stateInterface?: string;
}
