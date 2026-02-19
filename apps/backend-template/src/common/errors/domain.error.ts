/**
 * Base class for all domain-layer errors.
 *
 * Domain errors represent business rule violations that are
 * framework-agnostic (pure TypeScript). The application layer
 * is responsible for catching these and mapping them to
 * appropriate HTTP exceptions (e.g. ConflictException, BadRequestException).
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Thrown when an operation would create a duplicate that violates
 * a domain uniqueness invariant.
 */
export class DuplicateResourceError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
