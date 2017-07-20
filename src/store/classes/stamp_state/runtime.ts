import StampElement from './stampelement';
export default class Runtime implements StampElement {
    uri: string;
    owner: string;
    name: string;
    version: string;
    constructor(uri: string) {
        this.uri = uri;
        let splitted: Array<string> = this.uri.split('/');
        this.owner = splitted[2];
        this.name = splitted[3];
        for (let i = 4; i < splitted.length - 1; i++) {
            this.name += '.' + splitted[i];
        }
        this.version = splitted[splitted.length - 1];
    }
}