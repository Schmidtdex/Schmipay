type LogLevel = "error" | "warn" | "info" | "debug";

type LogContext = {
  [key: string]: unknown;
};

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private isProduction = process.env.NODE_ENV === "production";

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ) {
    const formattedMessage = this.formatMessage(level, message, context);

    if (error) {
      const errorContext = {
        ...context,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      };
      const errorMessage = this.formatMessage(level, message, errorContext);

      if (this.isDevelopment) {
        console.error(errorMessage);
      } else if (this.isProduction && level === "error") {
        // Em produção, você pode enviar para um serviço de logging
        // Por exemplo: Sentry, DataDog, CloudWatch, etc.
        console.error(formattedMessage);
      }
      return;
    }

    if (this.isDevelopment) {
      switch (level) {
        case "error":
          console.error(formattedMessage);
          break;
        case "warn":
          console.warn(formattedMessage);
          break;
        case "info":
          console.info(formattedMessage);
          break;
        case "debug":
          console.debug(formattedMessage);
          break;
      }
    } else if (this.isProduction && (level === "error" || level === "warn")) {
      // Em produção, log apenas erros e warnings
      if (level === "error") {
        console.error(formattedMessage);
      } else {
        console.warn(formattedMessage);
      }
    }
  }

  error(message: string, context?: LogContext, error?: Error) {
    this.log("error", message, context, error);
  }

  warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  }

  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  debug(message: string, context?: LogContext) {
    this.log("debug", message, context);
  }
}

export const logger = new Logger();
