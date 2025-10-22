export class Logger {
  constructor(private prefix?: string) {}

  private formatArgs(args: unknown[]) {
    if (!this.prefix) return args;
    return [`[${this.prefix}]`, ...args];
  }

  info(...args: unknown[]) {
    console.log(...this.formatArgs(args));
  }

  warn(...args: unknown[]) {
    console.warn(...this.formatArgs(args));
  }

  error(...args: unknown[]) {
    console.error(...this.formatArgs(args));
  }
}

const logger = new Logger('patient-api');

export default logger;

