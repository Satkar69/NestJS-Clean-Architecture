export class CoreWsResponse {
  static success<T>(data: T) {
    return {
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
