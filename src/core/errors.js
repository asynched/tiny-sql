export class DatabaseError extends Error {}

export class TableDoesNotExistError extends DatabaseError {}

export class InvalidValueError extends DatabaseError {}

export class MissingValueError extends DatabaseError {}
