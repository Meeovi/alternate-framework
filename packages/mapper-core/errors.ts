export class MapperError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MapperError'
  }
}

export class MapperNotFoundError extends MapperError {
  constructor(name: string) {
    super(`Mapper "${name}" was not found`)
    this.name = 'MapperNotFoundError'
  }
}