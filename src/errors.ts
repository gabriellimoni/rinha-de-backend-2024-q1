export class LimitNotAvailableError extends Error {
  constructor() {
    super("Limit not available");
    this.name = "Limit not available error";
  }
}
