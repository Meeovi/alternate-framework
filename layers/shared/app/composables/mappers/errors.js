export class MapperError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MapperError';
    }
}
export class MapperNotFoundError extends MapperError {
    constructor(name) {
        super(`Mapper "${name}" was not found`);
        this.name = 'MapperNotFoundError';
    }
}
