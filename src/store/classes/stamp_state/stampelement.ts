export default interface StampElement {
    uri: string;
    getOwner(): string;
    getName(): string;
}