export interface RealTimeTransport {
  connect(): void;
  disconnect(): void;
  on<T>(event: string, handler: (data: T) => void): void;
  off<T>(event: string, handler: (data: T) => void): void;
}
