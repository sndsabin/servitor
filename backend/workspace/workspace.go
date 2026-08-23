package workspace

import (
	"embed"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"slices"
)

type Workspace struct {
	RootDir       string
	schemaVersion string
	Dirs          WorkspaceDirs
}

type WorkspaceDirs struct {
	Blueprints Directory
	Logos      Directory
	Logs       Directory
}

type Directory struct {
	Path  string
	Files []string
}

const (
	resourcePermissionMode = 0644
	manifestFile           = "manifest.json"
	blueprintsDirName      = "blueprints"
	assetsDirName          = "assets"
	logosDirName           = "logos"
	logsDirName            = "logs"
)

func New(appName string, schemaVersion string) (*Workspace, error) {
	if appName == "" || schemaVersion == "" {
		return nil, fmt.Errorf("app name or app version cannot be empty")
	}

	userConfigDir, err := os.UserConfigDir()
	if err != nil {
		return nil, err
	}

	// create necessary directories
	rootDir := filepath.Join(userConfigDir, appName)
	logsDir := filepath.Join(rootDir, "logs")
	blueprintsDir := filepath.Join(rootDir, blueprintsDirName)
	logosDir := filepath.Join(rootDir, assetsDirName, logosDirName)

	for _, dir := range []string{rootDir, logsDir, blueprintsDir, logosDir} {
		err = os.MkdirAll(dir, 0755)
		if err != nil {
			return nil, fmt.Errorf("error creating directory %q: %w", dir, err)
		}
	}

	return &Workspace{
		RootDir:       rootDir,
		schemaVersion: schemaVersion,
		Dirs: WorkspaceDirs{
			Blueprints: Directory{
				Path: blueprintsDir,
			},
			Logos: Directory{
				Path: logosDir,
			},
			Logs: Directory{
				Path: logsDir,
			},
		},
	}, nil
}

func (w *Workspace) SyncEmbeddedResources(resourceFS embed.FS, resourceRootDir string) error {
	if resourceRootDir == "" {
		return fmt.Errorf("resource root dir cannot be empty")
	}

	var errs []error

	err := fs.WalkDir(resourceFS, resourceRootDir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			errs = append(errs, err)
			return nil // continue
		}

		if d.IsDir() {
			return nil // continue
		}

		fileName := filepath.Base(path)
		fileExt := filepath.Ext(path)

		data, err := fs.ReadFile(resourceFS, path)
		if err != nil {
			errs = append(errs, fmt.Errorf("error reading file %s: %w", path, err))
			return nil // continue walking
		}

		var destination string

		switch fileExt {
		case ".json":
			destination = filepath.Join(w.Dirs.Blueprints.Path, fileName)
			w.Dirs.Blueprints.Files = append(w.Dirs.Blueprints.Files, destination)

		case ".svg":
			destination = filepath.Join(w.Dirs.Logos.Path, fileName)
			w.Dirs.Logos.Files = append(w.Dirs.Logos.Files, destination)

		default:
			return nil // continue
		}

		err = os.WriteFile(destination, data, resourcePermissionMode)
		if err != nil {
			errs = append(errs, fmt.Errorf("error writing to file %s: %w", destination, err))
			return nil // continue
		}

		return nil
	})

	if err != nil {
		errs = append(errs, fmt.Errorf("error while syncing resources: %w", err))
	}

	// create manifest
	err = w.createManifest()
	if err != nil {
		errs = append(errs, err)
	}

	return errors.Join(errs...)
}

func (w *Workspace) GetManagedResourceFiles(resourceFS embed.FS, resourceRootDir string) ([]string, error) {
	if resourceRootDir == "" {
		return nil, fmt.Errorf("resource root dir cannot be empty")
	}

	if len(w.Dirs.Blueprints.Files) > 0 && len(w.Dirs.Logos.Files) > 0 {
		return slices.Concat(w.Dirs.Blueprints.Files, w.Dirs.Logos.Files), nil
	}

	var errs []error

	err := fs.WalkDir(resourceFS, resourceRootDir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			errs = append(errs, err)
			return nil // continue walking
		}

		if d.IsDir() {
			return nil // continue walking
		}

		fileName := filepath.Base(path)
		fileExt := filepath.Ext(path)

		switch fileExt {
		case ".json":
			jsonFilePath := filepath.Join(w.Dirs.Blueprints.Path, fileName)
			w.Dirs.Blueprints.Files = append(w.Dirs.Blueprints.Files, jsonFilePath)

		case ".svg":
			svgFilePath := filepath.Join(w.Dirs.Logos.Path, fileName)
			w.Dirs.Logos.Files = append(w.Dirs.Logos.Files, svgFilePath)

		default:
			return nil
		}

		return nil
	})
	if err != nil {
		errs = append(errs, fmt.Errorf("error fetching managed resource file paths: %w", err))
	}

	if len(errs) > 0 {
		return nil, errors.Join(errs...)
	}

	return slices.Concat(w.Dirs.Blueprints.Files, w.Dirs.Logos.Files), nil
}
