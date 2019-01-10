import { Terminal } from 'xterm';
export interface ITerminalCore {
    buffer: any;
    selectionManager: any;
}
export interface ISearchAddonTerminal extends Terminal {
    __searchHelper?: ISearchHelper;
    _core: ITerminalCore;
}
export interface ISearchHelper {
    findNext(term: string): boolean;
    findPrevious(term: string): boolean;
}
