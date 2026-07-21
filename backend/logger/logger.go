package logger

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/rs/zerolog"
)

const (
	logFile         = "app.log"
	logFilePermMode = 0644
)

type Logger struct {
	log zerolog.Logger
}

func NewLogger(logDir string) (*Logger, error) {
	if logDir == "" {
		return nil, fmt.Errorf("log dir cannot be empty")
	}

	zerolog.TimeFieldFormat = time.DateTime

	logPath := filepath.Join(logDir, logFile)

	logFile, err := os.OpenFile(
		logPath,
		os.O_CREATE|os.O_APPEND,
		logFilePermMode,
	)

	if err != nil {
		return nil, err
	}

	logger := zerolog.New(io.MultiWriter(os.Stdout, logFile)).With().Timestamp().Caller().Logger()

	return &Logger{
		log: logger,
	}, nil
}

func (l *Logger) Info() *zerolog.Event {
	return l.log.Info()
}

func (l *Logger) Error() *zerolog.Event {
	return l.log.Error()
}

func (l *Logger) Debug() *zerolog.Event {
	return l.log.Debug()
}
