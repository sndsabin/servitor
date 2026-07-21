package workspace

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

type Manifest struct {
	Version     string     `json:"version"`
	Build       int64      `json:"build"`
	CreatedAt   time.Time  `json:"created_at"`
	PublishedAt *time.Time `json:"published_at,omitempty"`
	Download    *Download  `json:"download,omitempty"`
}

type Download struct {
	File   string `json:"file"`
	Sha256 string `json:"sha256"`
}

func (w *Workspace) ManifestExists() bool {
	path := filepath.Join(w.RootDir, manifestFile)
	_, err := os.Stat(path)
	return err == nil
}

func (w *Workspace) createManifest() error {
	path := filepath.Join(w.RootDir, manifestFile)

	data, err := json.MarshalIndent(Manifest{
		Version:   w.schemaVersion,
		Build:     0,
		CreatedAt: time.Now(),
	}, "", "  ")
	if err != nil {
		return err
	}

	// O_EXCL ensures the operation fails if the file exists
	// O_CREATE creates file only if it's not present
	file, err := os.OpenFile(path, os.O_CREATE|os.O_EXCL|os.O_WRONLY, resourcePermissionMode)
	if err != nil {
		if os.IsExist(err) {
			// file already exist
			return nil
		}

		// some other issue (e.g, permission)
		return err
	}
	defer file.Close()

	_, err = file.Write(data)
	if err != nil {
		return err
	}

	return nil
}

func (w *Workspace) ReadManifest() (*Manifest, error) {
	path := filepath.Join(w.RootDir, manifestFile)

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("manifest missing or unreadable %s: %w", path, err)
	}

	var manifest Manifest

	err = json.Unmarshal(data, &manifest)
	if err != nil {
		return nil, fmt.Errorf("failed unmarshalling manifest %s: %w", path, err)
	}

	return &manifest, nil
}

func (w *Workspace) UpdateManifest(manifest *Manifest) error {
	path := filepath.Join(w.RootDir, manifestFile)

	data, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		return err
	}

	// os.O_TRUNC truncates the file before writing
	file, err := os.OpenFile(path, os.O_WRONLY|os.O_TRUNC, resourcePermissionMode)
	if err != nil {
		return fmt.Errorf("error opening manifest :%w", err)
	}
	defer file.Close()

	_, err = file.Write(data)
	if err != nil {
		return fmt.Errorf("error updating manifest: %w", err)
	}

	return nil
}
