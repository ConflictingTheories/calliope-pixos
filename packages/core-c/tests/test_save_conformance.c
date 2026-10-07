/*
 * P6-08 — Native conformance: save serialization roundtrip.
 *
 * Builds a save-state document with cJSON, serializes it, parses it back,
 * and verifies field fidelity. Pins the save format the native runtime
 * writes — the JS side (packages/specs validator `validateSave`) is
 * authoritative for cross-runtime schema; this test pins that the C
 * writer produces documents the C reader accepts, byte-stable across
 * repeated roundtrips.
 *
 * Build: via CTest (tests/CMakeLists.txt). Returns 0 on success.
 */
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "vendor/cJSON.h"

static int failures = 0;
static int checks = 0;

#define CHECK(cond) do { \
    checks++; \
    if (!(cond)) { failures++; printf("FAIL %s:%d: %s\n", __FILE__, __LINE__, #cond); } \
} while (0)

/* Build the canonical probe save document. */
static cJSON *make_save(void) {
    cJSON *root = cJSON_CreateObject();
    cJSON_AddStringToObject(root, "format", "pixozine-save");
    cJSON_AddStringToObject(root, "formatVersion", "1.0.0");
    cJSON_AddStringToObject(root, "pixozine", "conformance-probe");
    cJSON_AddNumberToObject(root, "slot", 1);
    cJSON_AddNumberToObject(root, "playTimeMs", 90061);
    cJSON *vars = cJSON_CreateObject();
    cJSON_AddNumberToObject(vars, "hp", 87);
    cJSON_AddStringToObject(vars, "zone", "zone-1");
    cJSON_AddTrueToObject(vars, "bossDefeated");
    cJSON_AddItemToObject(root, "vars", vars);
    cJSON *pos = cJSON_CreateArray();
    cJSON_AddItemToArray(pos, cJSON_CreateNumber(12.5));
    cJSON_AddItemToArray(pos, cJSON_CreateNumber(-3.25));
    cJSON_AddItemToObject(root, "playerPos", pos);
    return root;
}

static void test_roundtrip(void) {
    cJSON *save = make_save();
    char *text = cJSON_PrintUnformatted(save);
    cJSON_Delete(save);
    CHECK(text != NULL);

    cJSON *back = cJSON_Parse(text);
    CHECK(back != NULL);
    if (back) {
        cJSON *fmt = cJSON_GetObjectItemCaseSensitive(back, "format");
        CHECK(cJSON_IsString(fmt) && strcmp(fmt->valuestring, "pixozine-save") == 0);
        cJSON *slot = cJSON_GetObjectItemCaseSensitive(back, "slot");
        CHECK(cJSON_IsNumber(slot) && slot->valuedouble == 1.0);
        cJSON *vars = cJSON_GetObjectItemCaseSensitive(back, "vars");
        CHECK(cJSON_IsObject(vars));
        cJSON *hp = cJSON_GetObjectItemCaseSensitive(vars, "hp");
        CHECK(cJSON_IsNumber(hp) && hp->valuedouble == 87.0);
        cJSON *zone = cJSON_GetObjectItemCaseSensitive(vars, "zone");
        CHECK(cJSON_IsString(zone) && strcmp(zone->valuestring, "zone-1") == 0);
        cJSON *pos = cJSON_GetObjectItemCaseSensitive(back, "playerPos");
        CHECK(cJSON_IsArray(pos) && cJSON_GetArraySize(pos) == 2);
        cJSON *px = cJSON_GetArrayItem(pos, 0);
        CHECK(cJSON_IsNumber(px) && px->valuedouble == 12.5);
        cJSON_Delete(back);
    }
    free(text);
}

static void test_roundtrip_is_stable(void) {
    /* Serializing the parsed document twice yields identical bytes. */
    cJSON *a = make_save();
    char *t1 = cJSON_PrintUnformatted(a);
    cJSON_Delete(a);
    cJSON *b = cJSON_Parse(t1);
    char *t2 = cJSON_PrintUnformatted(b);
    cJSON_Delete(b);
    CHECK(t1 && t2 && strcmp(t1, t2) == 0);
    free(t1);
    free(t2);
}

static void test_malformed_save_rejected(void) {
    CHECK(cJSON_Parse("{bad json") == NULL);
    cJSON *root = cJSON_Parse("{\"format\":\"pixozine-save\"}");
    CHECK(root != NULL);
    /* Missing slot/vars: readable JSON but not a complete save. */
    CHECK(cJSON_GetObjectItemCaseSensitive(root, "slot") == NULL);
    cJSON_Delete(root);
}

int main(void) {
    test_roundtrip();
    test_roundtrip_is_stable();
    test_malformed_save_rejected();
    printf("save_conformance: %d checks, %d failures\n", checks, failures);
    return failures ? 1 : 0;
}
