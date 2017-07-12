export default class Resource {
    realName: string;
    parameters: Object;
    constructor(realName: string, parameters: Object) {
        this.realName = realName;
        this.parameters = parameters;
    }
}