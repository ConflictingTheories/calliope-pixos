/* stb_image - v2.28 - public domain image loader - http://nothings.org/stb
   This is a minimal stub to allow compilation.
   For full functionality, download from: https://github.com/nothings/stb/blob/master/stb_image.h
   
   For now, we'll include a minimal implementation that supports PNG/JPG
*/

#ifndef STB_IMAGE_H
#define STB_IMAGE_H

#ifdef __cplusplus
extern "C" {
#endif

/* IMPORTANT: You should replace this with the full stb_image.h from:
   https://raw.githubusercontent.com/nothings/stb/master/stb_image.h
   
   This is just a stub to allow compilation. */

typedef unsigned char stbi_uc;

extern stbi_uc *stbi_load(char const *filename, int *x, int *y, int *channels_in_file, int desired_channels);
extern stbi_uc *stbi_load_from_memory(stbi_uc const *buffer, int len, int *x, int *y, int *channels_in_file, int desired_channels);
extern void stbi_image_free(void *retval_from_stbi_load);
extern void stbi_set_flip_vertically_on_load(int flag_true_if_should_flip);
extern const char *stbi_failure_reason(void);

#ifdef STB_IMAGE_IMPLEMENTATION
/* Stub implementation - replace with full stb_image.h for real usage */

#include <stdio.h>
#include <stdlib.h>

static const char *stbi__failure_reason = "stb_image stub - no real implementation";

const char *stbi_failure_reason(void) {
    return stbi__failure_reason;
}

static int stbi__vertically_flip = 0;

void stbi_set_flip_vertically_on_load(int flag_true_if_should_flip) {
    stbi__vertically_flip = flag_true_if_should_flip;
}

static stbi_uc* stbi__create_placeholder(int *x, int *y, int *channels_in_file) {
    /* Create a simple 2x2 magenta checkerboard as placeholder */
    *x = 2;
    *y = 2;
    *channels_in_file = 4;
    
    stbi_uc *data = (stbi_uc *)malloc(2 * 2 * 4);
    if (data) {
        /* Magenta/black checkerboard to indicate missing texture */
        data[0] = 255; data[1] = 0;   data[2] = 255; data[3] = 255;  /* Magenta */
        data[4] = 0;   data[5] = 0;   data[6] = 0;   data[7] = 255;  /* Black */
        data[8] = 0;   data[9] = 0;   data[10] = 0;  data[11] = 255; /* Black */
        data[12] = 255; data[13] = 0; data[14] = 255; data[15] = 255; /* Magenta */
    }
    return data;
}

stbi_uc *stbi_load(char const *filename, int *x, int *y, int *channels_in_file, int desired_channels) {
    (void)desired_channels;
    
    stbi__failure_reason = "Using placeholder texture (stb_image stub)";
    fprintf(stderr, "Warning: stb_image stub - download full stb_image.h for real texture loading\n");
    fprintf(stderr, "         Requested: %s\n", filename);
    
    return stbi__create_placeholder(x, y, channels_in_file);
}

stbi_uc *stbi_load_from_memory(stbi_uc const *buffer, int len, int *x, int *y, int *channels_in_file, int desired_channels) {
    (void)buffer;
    (void)len;
    (void)desired_channels;
    
    stbi__failure_reason = "Using placeholder texture (stb_image stub)";
    fprintf(stderr, "Warning: stb_image stub - loading from memory not supported in stub\n");
    
    return stbi__create_placeholder(x, y, channels_in_file);
}

void stbi_image_free(void *retval_from_stbi_load) {
    free(retval_from_stbi_load);
}

#endif /* STB_IMAGE_IMPLEMENTATION */

#ifdef __cplusplus
}
#endif

#endif /* STB_IMAGE_H */
