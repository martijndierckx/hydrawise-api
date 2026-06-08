/** Specific error thrown by the Hydrawise API binding when the server replies with messageType === 'error'. */
export class HydrawiseCommandException extends Error {
  public readonly date: Date;

  constructor(message: string) {
    super(message);
    this.name = 'HydrawiseCommandException';
    this.date = new Date();
    Error.captureStackTrace?.(this, HydrawiseCommandException);
  }
}
