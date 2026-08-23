package workspace

import (
	"archive/zip"
	"context"
	"crypto/sha256"
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/rand/v2"
	"net/http"
	"os"
	"path/filepath"
	"slices"
	"strconv"
	"time"
)

type ResourceSyncer struct {
	BaseUrl       string
	schemaVersion string
	client        *http.Client
	workspace     *Workspace
}

type ResourceSyncerConfig struct {
	BaseUrl       string
	SchemaVersion string
	Workspace     *Workspace
}

const (
	manifest        = "manifest.json"
	tempResourceZip = "temp-resource.zip"
)

func NewResourceSyncer(config *ResourceSyncerConfig) (*ResourceSyncer, error) {
	if err := validateConfig(config); err != nil {
		return nil, err
	}

	httpClient := &http.Client{}

	return &ResourceSyncer{
		BaseUrl:       config.BaseUrl,
		schemaVersion: config.SchemaVersion,
		client:        httpClient,
		workspace:     config.Workspace,
	}, nil
}

func (rs *ResourceSyncer) SyncWithRemote(ctx context.Context, resourceFS embed.FS, resourceRootDir string) error {
	remoteManifest, err := rs.fetchRemoteManifest(ctx)
	if err != nil {
		return err
	}

	localManifest, err := rs.workspace.ReadManifest()
	if err != nil {
		return err
	}

	// If local build is higher (e.g., manual edit), reset it
	// to avoid blocking future updates.
	if localManifest.Build > remoteManifest.Build {
		localManifest.Build = 0
	}

	// only sync if remote is newer
	if remoteManifest.Build <= localManifest.Build {
		return nil
	}

	resourceZipUrl := rs.BaseUrl + remoteManifest.Download.File
	resourceZip, err := rs.downloadResourceZip(ctx, resourceZipUrl)
	if err != nil {
		return err
	}

	if err := verifyChecksum(resourceZip, remoteManifest.Download.Sha256); err != nil {
		return err
	}

	remoteSyncedFiles, err := rs.syncFromZipArchive(resourceZip)
	if err != nil {
		return err
	}

	// sync deleted files from the remote
	if err := rs.syncDeletedFiles(remoteSyncedFiles, resourceFS, resourceRootDir); err != nil {
		return err
	}

	// update local manifest
	localManifest.Build = remoteManifest.Build
	localManifest.CreatedAt = time.Now()
	if err := rs.workspace.UpdateManifest(localManifest); err != nil {
		return err
	}

	// delete downloaded resource zip
	if err := os.Remove(resourceZip); err != nil {
		return err
	}

	return nil
}

func (rs *ResourceSyncer) fetchRemoteManifest(ctx context.Context) (Manifest, error) {
	manifestUrl := fmt.Sprintf("%s/%s/%s?t=%s",
		rs.BaseUrl,
		rs.schemaVersion,
		manifest,
		strconv.Itoa(rand.IntN(10000)),
	)

	resp, err := rs.sendGetRequest(ctx, manifestUrl, "application/json")
	if err != nil {
		return Manifest{}, err
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return Manifest{}, fmt.Errorf("error reading response :%w", err)
	}

	var manifest Manifest
	err = json.Unmarshal(data, &manifest)
	if err != nil {
		return Manifest{}, fmt.Errorf("error unmarshalling response body: %w", err)
	}

	return manifest, nil
}

func (rs *ResourceSyncer) downloadResourceZip(ctx context.Context, url string) (string, error) {
	resp, err := rs.sendGetRequest(ctx, url, "application/zip")
	if err != nil {
		return "", fmt.Errorf("failed fetching resource zip: %w", err)
	}
	defer resp.Body.Close()

	path := filepath.Join(rs.workspace.RootDir, tempResourceZip)
	file, err := os.Create(path)
	if err != nil {
		return "", fmt.Errorf("error creating temp zip file: %w", err)
	}
	defer file.Close()

	_, err = io.Copy(file, resp.Body)
	if err != nil {
		return "", err
	}

	return path, nil
}

func (rs *ResourceSyncer) sendGetRequest(ctx context.Context, url string, acceptHeader string) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("error creating get request :%w", err)
	}

	req.Header.Add("Accept", acceptHeader)

	resp, err := rs.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making request: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected response status code %d for %s", resp.StatusCode, url)
	}

	return resp, nil
}

func (rs *ResourceSyncer) syncFromZipArchive(src string) ([]string, error) {
	reader, err := zip.OpenReader(src)
	if err != nil {
		return nil, err
	}

	defer reader.Close()

	var filesSynced []string

	for _, file := range reader.File {
		if file.FileInfo().IsDir() {
			continue
		}

		syncedFilePath, err := rs.processZipFile(file)
		if err != nil {
			return nil, fmt.Errorf("error processing file %s:%w", file.Name, err)
		}

		if syncedFilePath != "" {
			filesSynced = append(filesSynced, syncedFilePath)
		}
	}

	return filesSynced, nil
}

func (rs *ResourceSyncer) processZipFile(file *zip.File) (string, error) {
	fileName := filepath.Base(file.Name)
	fileExt := filepath.Ext(fileName)

	var destDir string

	switch fileExt {
	case ".json":
		destDir = rs.workspace.Dirs.Blueprints.Path

	case ".svg":
		destDir = rs.workspace.Dirs.Logos.Path

	default:
		return "", nil

	}

	srcFile, err := file.Open()
	if err != nil {
		return "", err
	}
	defer srcFile.Close()

	destFilePath := filepath.Join(destDir, fileName)

	destFile, err := os.OpenFile(destFilePath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, resourcePermissionMode)
	if err != nil {
		return "", fmt.Errorf("error opening file %s: %w", destFilePath, err)
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, srcFile)
	if err != nil {
		return "", fmt.Errorf("error copying file %s: %w", destFilePath, err)
	}

	return destFilePath, nil
}

func (rs *ResourceSyncer) syncDeletedFiles(remoteFilesSynced []string, resourceFS embed.FS, resourceRootDir string) error {
	embeddedFiles, err := rs.workspace.GetManagedResourceFiles(resourceFS, resourceRootDir)
	if err != nil {
		return err
	}

	var errs []error
	// delete managed files that are no longer present remotely
	for _, entry := range embeddedFiles {
		if !slices.Contains(remoteFilesSynced, entry) {
			err := os.Remove(entry)
			if err != nil && !errors.Is(err, os.ErrNotExist) {
				errs = append(errs, fmt.Errorf("error deleting %s: %w", entry, err))
			}
		}
	}

	return errors.Join(errs...)
}

func verifyChecksum(filename string, expected string) error {
	file, err := os.Open(filename)
	if err != nil {
		return fmt.Errorf("error opening file %s: %w", filename, err)
	}
	defer file.Close()

	hasher := sha256.New()
	if _, err := io.Copy(hasher, file); err != nil {
		return err
	}

	actual := fmt.Sprintf("%x", hasher.Sum(nil))
	if actual != expected {
		return fmt.Errorf("checksum mismatch (actual: %s, expected:%s)", actual, expected)
	}

	return nil
}

func validateConfig(config *ResourceSyncerConfig) error {
	if config.BaseUrl == "" {
		return fmt.Errorf("base url cannot be empty")
	}

	if config.SchemaVersion == "" {
		return fmt.Errorf("schema version cannot be empty")
	}

	if config.Workspace == nil {
		return fmt.Errorf("workspace cannot be nil")
	}

	return nil
}
