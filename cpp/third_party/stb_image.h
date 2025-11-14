/* stb_image - v2.28 - public domain image loader - http://nothings.org/stb
   For brevity in this task I'll include a minimal shim that declares the API we need
   and rely on system libs or placeholders. In a full change I'd add the full stb_image
   implementation. */

#ifndef STB_IMAGE_H_INCLUDED
#define STB_IMAGE_H_INCLUDED

#ifdef __cplusplus
extern "C" {
#endif

extern unsigned char *stbi_load(const char *filename, int *x, int *y, int *comp, int req_comp);
extern void stbi_image_free(void *retval_from_stbi_load);

#ifdef __cplusplus
}
#endif

#endif // STB_IMAGE_H_INCLUDED
