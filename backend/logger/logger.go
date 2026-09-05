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
	fileName     = "app.log"
	filePermMode = 0644
)

type Logger struct {
	logger   zerolog.Logger
	file     *os.File
	FilePath string
}

func NewLogger(logDir string) (*Logger, error) {
	if logDir == "" {
		return nil, fmt.Errorf("log dir cannot be empty")
	}

	zerolog.TimeFieldFormat = time.DateTime

	logPath := filepath.Join(logDir, fileName)

	logFile, err := os.OpenFile(
		logPath,
		os.O_CREATE|os.O_WRONLY|os.O_APPEND,
		filePermMode,
	)

	if err != nil {
		return nil, err
	}

	logger := zerolog.New(io.MultiWriter(os.Stdout, logFile)).With().Timestamp().Caller().Logger()

	return &Logger{
		logger:   logger,
		file:     logFile,
		FilePath: logPath,
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
