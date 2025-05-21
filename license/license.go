package license

import (
	_ "embed"
	"os"

	"github.com/lestrrat-go/jwx/v3/jwa"
	"github.com/lestrrat-go/jwx/v3/jwk"
	"github.com/lestrrat-go/jwx/v3/jwt"
)

type (
	ClaimHiphops struct {
		Identity  string `json:"identity"`
		ProjectID string `json:"project_id"`
	}

	ClaimLicense map[string]interface{}

	LicenseInfo struct {
		Verified       bool         `json:"verified"`
		VerifyFailures []string     `json:"verify_failures"`
		License        ClaimLicense `json:"license"`
		Hiphops        ClaimHiphops `json:"hiphops"`
	}
)

//go:embed assets/license_key.pem
var licenseKey []byte
var _licenseInfo *LicenseInfo

func GetLicenseInfo() (licenseInfo *LicenseInfo) {
	if _licenseInfo != nil {
		licenseInfo = _licenseInfo
		return
	}

	// Assign whatever the latest license info is to the global variable
	defer func() {
		if licenseInfo != nil {
			_licenseInfo = licenseInfo
		}
	}()

	jwt.RegisterCustomField("license", ClaimLicense{})
	jwt.RegisterCustomField("hiphops.io", ClaimHiphops{})

	licenseInfo = &LicenseInfo{
		Verified:       true,
		VerifyFailures: []string{},
	}

	licenseToken := []byte(os.Getenv("LICENSE_TOKEN"))
	if len(licenseToken) == 0 {
		licenseInfo.Verified = false
		licenseInfo.VerifyFailures = []string{"missing_license_token"}
		return
	}

	pemKey, err := jwk.ParseKey(licenseKey, jwk.WithPEM(true))
	if err != nil {
		licenseInfo.Verified = false
		licenseInfo.VerifyFailures = []string{"invalid_public_key"}
		return
	}

	token, err := jwt.Parse(licenseToken, jwt.WithKey(jwa.RS256(), pemKey), jwt.WithValidate(true))
	if err != nil {
		licenseInfo.Verified = false
		licenseInfo.VerifyFailures = []string{"invalid_license_token"}
		return
	}

	if err := token.Get("license", &licenseInfo.License); err != nil {
		licenseInfo.Verified = false
		licenseInfo.VerifyFailures = append(licenseInfo.VerifyFailures, "missing_license_claim")
	}

	if err := token.Get("hiphops.io", &licenseInfo.Hiphops); err != nil {
		licenseInfo.Verified = false
		licenseInfo.VerifyFailures = append(licenseInfo.VerifyFailures, "missing_hiphops_claim")
	}

	return
}
