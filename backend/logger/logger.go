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
	logger zerolog.Logger
	file   *os.File
	Path   string
}

func NewLogger(logDir string) (*Logger, error) {
	if logDir == "" {
		return nil, fmt.Errorf("log dir cannot be empty")
	}

	zerolog.TimeFieldFormat = time.DateTime

	logPath := filepath.Join(logDir, logFile)

	logFile, err := os.OpenFile(
		logPath,
		os.O_CREATE|os.O_WRONLY|os.O_APPEND,
		logFilePermMode,
	)

	if err != nil {
		return nil, err
	}

	logger := zerolog.New(io.MultiWriter(os.Stdout, logFile)).With().Timestamp().Caller().Logger()

	return &Logger{
		logger: logger,
		file:   logFile,
		Path:   logPath,
	}, nil
}

func (l *Logger) Info() *zerolog.Event {
	return l.logger.Info()
}

func (l *Logger) Error() *zerolog.Event {
	return l.logger.Error()
}

func (l *Logger) Debug() *zerolog.Event {
	return l.logger.Debug()
}

func (l *Logger) Close() {
	if l.file != nil {
		l.file.Close()
	}
}
