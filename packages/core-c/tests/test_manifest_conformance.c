/*
 * P6-08 — Native conformance: package manifest/load.
 *
 * Validates pixozine manifests (manifest.json) against the required-field
 * contract from packages/specs/formats/manifest.schema.json using the
 * vendored cJSON. This is a SUBSET of the JS validator: it pins the
 * required fields (title, version, initialZones) and formatVersion handling
 * that the native game_loader depends on — not the full JSON Schema.
 *
 * Fixtures are embedded (self-contained; no path dependence under CTest).
 * The JS conformance corpus (packages/specs/conformance/load.json) is
 * authoritative for the full validation semantics.
 *
 * Build: via CTest (tests/CMakeLists.txt). Returns 0 on success.
 */
#include <stdio.h>
#include <string.h>
#include "vendor/cJSON.h"

static int failures = 0;
static int checks = 0;

#define CHECK(cond) do { \
    checks++; \
    if (!(cond)) { failures++; printf("FAIL %s:%d: %s\n", __FILE__, __LINE__, #cond); } \
} while (0)

/* Mirror of the JS required-field contract (manifest.schema.json). */
static int manifest_valid(const char *json, char *errbuf, size_t errlen) {
    cJSON *root = cJSON_Parse(json);
    if (!root) {
        snprintf(errbuf, errlen, "unparseable JSON");
        return 0;
    }
    int ok = 1;
    cJSON *title = cJSON_GetObjectItemCaseSensitive(root, "title");
    cJSON *version = cJSON_GetObjectItemCaseSensitive(root, "version");
    cJSON *zones = cJSON_GetObjectItemCaseSensitive(root, "initialZones");
    if (!cJSON_IsString(title) || !title->valuestring || !title->valuestring[0]) {
        snprintf(errbuf, errlen, "missing-required: title");
        ok = 0;
    } else if (!cJSON_IsString(version) || !version->valuestring || !version->valuestring[0]) {
        snprintf(errbuf, errlen, "missing-required: version");
        ok = 0;
    } else if (!cJSON_IsArray(zones) || cJSON_GetArraySize(zones) == 0) {
        snprintf(errbuf, errlen, "missing-required: initialZones (non-empty array)");
        ok = 0;
    }
    cJSON_Delete(root);
    return ok;
}

static const char *VALID_MINIMAL =
    "{\"format\":\"pixozine\",\"formatVersion\":\"1.0.0\","
    "\"title\":\"Conformance Probe\",\"version\":\"1.0.0\","
    "\"initialZones\":[\"zone-1\"]}";

static const char *VALID_FULL =
    "{\"format\":\"pixozine\",\"formatVersion\":\"1.0.0\","
    "\"title\":\"Full Probe\",\"description\":\"all optional fields\","
    "\"version\":\"2.3.4\",\"author\":\"ctest\",\"license\":\"SEE LICENSE IN LICENSE\","
    "\"initialZones\":[\"zone-1\",\"zone-2\"],"
    "\"maps\":[\"map-1\"],\"scripts\":[\"main.pxs\"]}";

static const char *INVALID_NO_TITLE =
    "{\"formatVersion\":\"1.0.0\",\"version\":\"1.0.0\",\"initialZones\":[\"z\"]}";

static const char *INVALID_EMPTY_ZONES =
    "{\"title\":\"T\",\"version\":\"1.0.0\",\"initialZones\":[]}";

static const char *INVALID_NOT_JSON = "{not json";

static void test_valid_manifests(void) {
    char err[256];
    CHECK(manifest_valid(VALID_MINIMAL, err, sizeof err));
    CHECK(manifest_valid(VALID_FULL, err, sizeof err));

    /* formatVersion is informational at load time: present but not load-blocking. */
    cJSON *root = cJSON_Parse(VALID_MINIMAL);
    cJSON *fv = cJSON_GetObjectItemCaseSensitive(root, "formatVersion");
    CHECK(cJSON_IsString(fv) && strcmp(fv->valuestring, "1.0.0") == 0);
    cJSON_Delete(root);
}

static void test_invalid_manifests(void) {
    char err[256];
    CHECK(!manifest_valid(INVALID_NO_TITLE, err, sizeof err));
    CHECK(strstr(err, "title") != NULL);
    CHECK(!manifest_valid(INVALID_EMPTY_ZONES, err, sizeof err));
    CHECK(strstr(err, "initialZones") != NULL);
    CHECK(!manifest_valid(INVALID_NOT_JSON, err, sizeof err));
}

static void test_manifest_field_types(void) {
    /* version must be a non-empty string, not a number. */
    char err[256];
    const char *numeric_version =
        "{\"title\":\"T\",\"version\":42,\"initialZones\":[\"z\"]}";
    CHECK(!manifest_valid(numeric_version, err, sizeof err));
}

int main(void) {
    test_valid_manifests();
    test_invalid_manifests();
    test_manifest_field_types();
    printf("manifest_conformance: %d checks, %d failures\n", checks, failures);
    return failures ? 1 : 0;
}
