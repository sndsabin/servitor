package backend

type LogLevel string

const (
	LogInfo  LogLevel = "INFO"
	LogDebug LogLevel = "DEBUG"
	LogError LogLevel = "ERROR"
)

func (a *App) Log(logLevel LogLevel, message string) {
	switch logLevel {
	case LogInfo:
		a.logger.Info().Msg(message)
	case LogDebug:
		a.logger.Debug().Msg(message)
	case LogError:
		a.logger.Error().Msg(message)
	}
}
