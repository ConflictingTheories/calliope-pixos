/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

/* ARM Linux platform implementation using EGL + GBM + DRM/KMS */
/* For Anbernic RG353V and similar ARM devices */

#include "platform.h"

#ifdef USE_EGL_GBM

#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <errno.h>
#include <time.h>
#include <sys/mman.h>
#include <sys/ioctl.h>
#include <sys/mount.h>
#include <sys/stat.h>
#include <sys/time.h>
#include <sys/select.h>
#include <dirent.h>
#include <linux/input.h>

#include <xf86drm.h>
#include <xf86drmMode.h>
#include <gbm.h>

/* DRM framebuffer structure */
typedef struct DrmFramebuffer {
    struct gbm_bo* bo;
    uint32_t fb_id;
} DrmFramebuffer;

/* Platform context structure */
struct PlatformContext {
    /* DRM/KMS */
    int drm_fd;
    drmModeModeInfo drm_mode;
    drmModeCrtc* saved_crtc;
    uint32_t connector_id;
    uint32_t crtc_id;
    
    /* GBM */
    struct gbm_device* gbm_dev;
    struct gbm_surface* gbm_surf;
    struct gbm_bo* current_bo;
    struct gbm_bo* prev_bo;
    
    /* EGL */
    EGLDisplay egl_display;
    EGLContext egl_context;
    EGLSurface egl_surface;
    EGLConfig egl_config;
    
    /* Display info */
    int width;
    int height;
    bool fullscreen;
    
    /* Timing */
    struct timespec start_time;
    
    /* Input */
    int input_fds[16];
    int input_fd_count;
    PlatformInputCallback input_callback;
    void* input_user_data;
    
    /* State */
    bool should_close;
    bool initialized;
    
    /* Software rendering mode (for QEMU/testing) */
    bool software_mode;
    /* Headless mode (no graphics at all, for testing) */
    bool headless_mode;
    int frame_count;
};

/* Forward declarations */
static void drm_fb_destroy_callback(struct gbm_bo* bo, void* data);
static DrmFramebuffer* drm_fb_get(PlatformContext* ctx, struct gbm_bo* bo);
static int init_drm(PlatformContext* ctx);
static int init_gbm(PlatformContext* ctx);
static int init_egl(PlatformContext* ctx);
static int init_software_egl(PlatformContext* ctx);
static void init_input_devices(PlatformContext* ctx);
static void mount_filesystems(void);

/* Mount essential filesystems (when running as init/PID 1) */
static void mount_filesystems(void) {
    mkdir("/proc", 0755);
    mkdir("/sys", 0755);
    mkdir("/dev", 0755);
    mkdir("/dev/dri", 0755);
    mkdir("/dev/input", 0755);
    
    mount("proc", "/proc", "proc", 0, NULL);
    mount("sysfs", "/sys", "sysfs", 0, NULL);
    mount("devtmpfs", "/dev", "devtmpfs", 0, NULL);
}

/* Find and open DRM device */
static int open_drm_device(PlatformContext* ctx) {
    const char* cards[] = {
        "/dev/dri/card0",
        "/dev/dri/card1",
        "/dev/dri/renderD128",
        NULL
    };
    
    for (int i = 0; cards[i]; i++) {
        ctx->drm_fd = open(cards[i], O_RDWR | O_CLOEXEC);
        if (ctx->drm_fd >= 0) {
            printf("[Platform] Opened DRM device: %s\n", cards[i]);
            return 0;
        }
    }
    
    fprintf(stderr, "[Platform] Failed to open any DRM device\n");
    return -1;
}

/* Initialize DRM/KMS */
static int init_drm(PlatformContext* ctx) {
    if (open_drm_device(ctx) < 0) return -1;
    
    drmModeRes* resources = drmModeGetResources(ctx->drm_fd);
    if (!resources) {
        fprintf(stderr, "[Platform] drmModeGetResources failed\n");
        return -1;
    }
    
    /* Find connected connector */
    drmModeConnector* connector = NULL;
    for (int i = 0; i < resources->count_connectors; i++) {
        connector = drmModeGetConnector(ctx->drm_fd, resources->connectors[i]);
        if (connector && connector->connection == DRM_MODE_CONNECTED &&
            connector->count_modes > 0) {
            ctx->connector_id = connector->connector_id;
            break;
        }
        if (connector) drmModeFreeConnector(connector);
        connector = NULL;
    }
    
    if (!connector) {
        fprintf(stderr, "[Platform] No connected display found\n");
        drmModeFreeResources(resources);
        return -1;
    }
    
    printf("[Platform] Found display: %dx%d @ %dHz\n",
           connector->modes[0].hdisplay,
           connector->modes[0].vdisplay,
           connector->modes[0].vrefresh);
    
    /* Use first mode (typically native resolution) */
    memcpy(&ctx->drm_mode, &connector->modes[0], sizeof(ctx->drm_mode));
    ctx->width = ctx->drm_mode.hdisplay;
    ctx->height = ctx->drm_mode.vdisplay;
    
    /* Find encoder and CRTC */
    drmModeEncoder* encoder = NULL;
    if (connector->encoder_id) {
        encoder = drmModeGetEncoder(ctx->drm_fd, connector->encoder_id);
    }
    
    if (encoder) {
        ctx->crtc_id = encoder->crtc_id;
        drmModeFreeEncoder(encoder);
    } else {
        /* Find available CRTC */
        for (int i = 0; i < resources->count_crtcs; i++) {
            if (connector->encoders) {
                for (int j = 0; j < connector->count_encoders; j++) {
                    encoder = drmModeGetEncoder(ctx->drm_fd, connector->encoders[j]);
                    if (encoder && (encoder->possible_crtcs & (1 << i))) {
                        ctx->crtc_id = resources->crtcs[i];
                        drmModeFreeEncoder(encoder);
                        break;
                    }
                    if (encoder) drmModeFreeEncoder(encoder);
                }
            }
            if (ctx->crtc_id) break;
        }
    }
    
    if (!ctx->crtc_id) {
        fprintf(stderr, "[Platform] No CRTC found\n");
        drmModeFreeConnector(connector);
        drmModeFreeResources(resources);
        return -1;
    }
    
    /* Save current CRTC for restore on shutdown */
    ctx->saved_crtc = drmModeGetCrtc(ctx->drm_fd, ctx->crtc_id);
    
    drmModeFreeConnector(connector);
    drmModeFreeResources(resources);
    
    return 0;
}

/* Initialize GBM (Generic Buffer Management) */
static int init_gbm(PlatformContext* ctx) {
    ctx->gbm_dev = gbm_create_device(ctx->drm_fd);
    if (!ctx->gbm_dev) {
        fprintf(stderr, "[Platform] gbm_create_device failed\n");
        return -1;
    }
    
    ctx->gbm_surf = gbm_surface_create(
        ctx->gbm_dev,
        ctx->width,
        ctx->height,
        GBM_FORMAT_XRGB8888,
        GBM_BO_USE_SCANOUT | GBM_BO_USE_RENDERING
    );
    
    if (!ctx->gbm_surf) {
        fprintf(stderr, "[Platform] gbm_surface_create failed\n");
        return -1;
    }
    
    printf("[Platform] GBM surface created: %dx%d\n", ctx->width, ctx->height);
    return 0;
}

/* Initialize EGL */
static int init_egl(PlatformContext* ctx) {
    static const EGLint config_attribs[] = {
        EGL_SURFACE_TYPE, EGL_WINDOW_BIT,
        EGL_RED_SIZE, 8,
        EGL_GREEN_SIZE, 8,
        EGL_BLUE_SIZE, 8,
        EGL_ALPHA_SIZE, 0,
        EGL_DEPTH_SIZE, 24,
        EGL_STENCIL_SIZE, 0,
        EGL_RENDERABLE_TYPE, EGL_OPENGL_ES2_BIT,
        EGL_NONE
    };
    
    static const EGLint context_attribs[] = {
        EGL_CONTEXT_CLIENT_VERSION, 2,
        EGL_NONE
    };
    
    ctx->egl_display = eglGetDisplay((EGLNativeDisplayType)ctx->gbm_dev);
    if (ctx->egl_display == EGL_NO_DISPLAY) {
        fprintf(stderr, "[Platform] eglGetDisplay failed\n");
        return -1;
    }
    
    EGLint major, minor;
    if (!eglInitialize(ctx->egl_display, &major, &minor)) {
        fprintf(stderr, "[Platform] eglInitialize failed\n");
        return -1;
    }
    
    printf("[Platform] EGL version: %d.%d\n", major, minor);
    printf("[Platform] EGL vendor: %s\n", eglQueryString(ctx->egl_display, EGL_VENDOR));
    
    if (!eglBindAPI(EGL_OPENGL_ES_API)) {
        fprintf(stderr, "[Platform] eglBindAPI failed\n");
        return -1;
    }
    
    EGLint num_configs;
    if (!eglChooseConfig(ctx->egl_display, config_attribs, &ctx->egl_config, 1, &num_configs) ||
        num_configs == 0) {
        fprintf(stderr, "[Platform] eglChooseConfig failed\n");
        return -1;
    }
    
    ctx->egl_context = eglCreateContext(
        ctx->egl_display,
        ctx->egl_config,
        EGL_NO_CONTEXT,
        context_attribs
    );
    
    if (ctx->egl_context == EGL_NO_CONTEXT) {
        fprintf(stderr, "[Platform] eglCreateContext failed\n");
        return -1;
    }
    
    ctx->egl_surface = eglCreateWindowSurface(
        ctx->egl_display,
        ctx->egl_config,
        (EGLNativeWindowType)ctx->gbm_surf,
        NULL
    );
    
    if (ctx->egl_surface == EGL_NO_SURFACE) {
        fprintf(stderr, "[Platform] eglCreateWindowSurface failed\n");
        return -1;
    }
    
    if (!eglMakeCurrent(ctx->egl_display, ctx->egl_surface, ctx->egl_surface, ctx->egl_context)) {
        fprintf(stderr, "[Platform] eglMakeCurrent failed\n");
        return -1;
    }
    
    printf("[Platform] GL vendor: %s\n", glGetString(GL_VENDOR));
    printf("[Platform] GL renderer: %s\n", glGetString(GL_RENDERER));
    printf("[Platform] GL version: %s\n", glGetString(GL_VERSION));
    printf("[Platform] GLSL version: %s\n", glGetString(GL_SHADING_LANGUAGE_VERSION));
    
    return 0;
}

/* Initialize EGL with software rendering (for QEMU/testing) */
static int init_software_egl(PlatformContext* ctx) {
    static const EGLint config_attribs[] = {
        EGL_SURFACE_TYPE, EGL_PBUFFER_BIT,
        EGL_RED_SIZE, 8,
        EGL_GREEN_SIZE, 8,
        EGL_BLUE_SIZE, 8,
        EGL_ALPHA_SIZE, 8,
        EGL_DEPTH_SIZE, 24,
        EGL_STENCIL_SIZE, 0,
        EGL_RENDERABLE_TYPE, EGL_OPENGL_ES2_BIT,
        EGL_NONE
    };
    
    static const EGLint context_attribs[] = {
        EGL_CONTEXT_CLIENT_VERSION, 2,
        EGL_NONE
    };
    
    EGLint pbuffer_attribs[] = {
        EGL_WIDTH, ctx->width,
        EGL_HEIGHT, ctx->height,
        EGL_NONE
    };
    
    /* Get default display (Mesa software renderer) */
    ctx->egl_display = eglGetDisplay(EGL_DEFAULT_DISPLAY);
    if (ctx->egl_display == EGL_NO_DISPLAY) {
        fprintf(stderr, "[Platform] Software: eglGetDisplay failed\n");
        return -1;
    }
    
    EGLint major, minor;
    if (!eglInitialize(ctx->egl_display, &major, &minor)) {
        fprintf(stderr, "[Platform] Software: eglInitialize failed (0x%x)\n", eglGetError());
        return -1;
    }
    
    printf("[Platform] Software EGL version: %d.%d\n", major, minor);
    printf("[Platform] EGL vendor: %s\n", eglQueryString(ctx->egl_display, EGL_VENDOR));
    printf("[Platform] EGL extensions: %s\n", eglQueryString(ctx->egl_display, EGL_EXTENSIONS));
    
    if (!eglBindAPI(EGL_OPENGL_ES_API)) {
        fprintf(stderr, "[Platform] Software: eglBindAPI failed\n");
        return -1;
    }
    
    EGLint num_configs;
    if (!eglChooseConfig(ctx->egl_display, config_attribs, &ctx->egl_config, 1, &num_configs) ||
        num_configs == 0) {
        fprintf(stderr, "[Platform] Software: eglChooseConfig failed\n");
        return -1;
    }
    
    printf("[Platform] Software: Found %d EGL configs\n", num_configs);
    
    ctx->egl_context = eglCreateContext(
        ctx->egl_display,
        ctx->egl_config,
        EGL_NO_CONTEXT,
        context_attribs
    );
    
    if (ctx->egl_context == EGL_NO_CONTEXT) {
        fprintf(stderr, "[Platform] Software: eglCreateContext failed (0x%x)\n", eglGetError());
        return -1;
    }
    
    /* Create a pbuffer surface for off-screen rendering */
    ctx->egl_surface = eglCreatePbufferSurface(ctx->egl_display, ctx->egl_config, pbuffer_attribs);
    
    if (ctx->egl_surface == EGL_NO_SURFACE) {
        fprintf(stderr, "[Platform] Software: eglCreatePbufferSurface failed (0x%x)\n", eglGetError());
        return -1;
    }
    
    if (!eglMakeCurrent(ctx->egl_display, ctx->egl_surface, ctx->egl_surface, ctx->egl_context)) {
        fprintf(stderr, "[Platform] Software: eglMakeCurrent failed (0x%x)\n", eglGetError());
        return -1;
    }
    
    printf("[Platform] Software GL vendor: %s\n", glGetString(GL_VENDOR));
    printf("[Platform] Software GL renderer: %s\n", glGetString(GL_RENDERER));
    printf("[Platform] Software GL version: %s\n", glGetString(GL_VERSION));
    
    return 0;
}

/* Initialize input devices (evdev) */
static void init_input_devices(PlatformContext* ctx) {
    ctx->input_fd_count = 0;
    
    DIR* dir = opendir("/dev/input");
    if (!dir) {
        fprintf(stderr, "[Platform] Cannot open /dev/input\n");
        return;
    }
    
    struct dirent* entry;
    while ((entry = readdir(dir)) != NULL && ctx->input_fd_count < 16) {
        if (strncmp(entry->d_name, "event", 5) != 0) continue;
        
        char path[256];
        snprintf(path, sizeof(path), "/dev/input/%s", entry->d_name);
        
        int fd = open(path, O_RDONLY | O_NONBLOCK);
        if (fd >= 0) {
            char name[256] = "Unknown";
            ioctl(fd, EVIOCGNAME(sizeof(name)), name);
            printf("[Platform] Found input device: %s (%s)\n", path, name);
            ctx->input_fds[ctx->input_fd_count++] = fd;
        }
    }
    
    closedir(dir);
    printf("[Platform] Initialized %d input devices\n", ctx->input_fd_count);
}

/* DRM framebuffer callbacks */
static void drm_fb_destroy_callback(struct gbm_bo* bo, void* data) {
    DrmFramebuffer* fb = (DrmFramebuffer*)data;
    if (fb->fb_id) {
        /* Note: drm_fd should be stored somewhere accessible */
        /* For simplicity, we assume it's still valid */
    }
    free(fb);
}

static DrmFramebuffer* drm_fb_get(PlatformContext* ctx, struct gbm_bo* bo) {
    DrmFramebuffer* fb = (DrmFramebuffer*)gbm_bo_get_user_data(bo);
    if (fb) return fb;
    
    fb = (DrmFramebuffer*)calloc(1, sizeof(DrmFramebuffer));
    if (!fb) return NULL;
    
    fb->bo = bo;
    
    uint32_t width = gbm_bo_get_width(bo);
    uint32_t height = gbm_bo_get_height(bo);
    uint32_t stride = gbm_bo_get_stride(bo);
    uint32_t handle = gbm_bo_get_handle(bo).u32;
    
    int ret = drmModeAddFB(ctx->drm_fd, width, height, 24, 32, stride, handle, &fb->fb_id);
    if (ret) {
        fprintf(stderr, "[Platform] drmModeAddFB failed: %s\n", strerror(errno));
        free(fb);
        return NULL;
    }
    
    gbm_bo_set_user_data(bo, fb, drm_fb_destroy_callback);
    return fb;
}

/* Page flip handler */
static void page_flip_handler(int fd, unsigned int frame,
                              unsigned int sec, unsigned int usec,
                              void* data) {
    (void)fd;
    (void)frame;
    (void)sec;
    (void)usec;
    int* waiting = (int*)data;
    *waiting = 0;
}

/* Public API implementation */

PlatformContext* platform_init(int width, int height, const char* title, bool fullscreen) {
    (void)title;   /* No window title on framebuffer */
    (void)fullscreen; /* Always fullscreen */
    
    PlatformContext* ctx = (PlatformContext*)calloc(1, sizeof(PlatformContext));
    if (!ctx) {
        fprintf(stderr, "[Platform] Failed to allocate platform context\n");
        return NULL;
    }
    
    ctx->drm_fd = -1;
    ctx->fullscreen = true;
    ctx->software_mode = false;
    ctx->frame_count = 0;
    
    /* Check for software rendering mode (QEMU testing) */
    const char* sw_mode = getenv("PIXOS_SOFTWARE");
    bool force_software = (sw_mode && strcmp(sw_mode, "1") == 0);
    
    printf("[Platform] Initializing ARM platform...\n");
    
    /* Mount filesystems if running as init */
    if (getpid() == 1) {
        printf("[Platform] Running as PID 1, mounting filesystems...\n");
        mount_filesystems();
    }
    
    /* Try hardware rendering first (unless forced software) */
    bool hw_init_ok = false;
    
    if (!force_software) {
        printf("[Platform] Trying DRM/GBM/EGL hardware path...\n");
        
        printf("[Platform] Initializing DRM...\n");
        if (init_drm(ctx) >= 0) {
            printf("[Platform] Initializing GBM...\n");
            if (init_gbm(ctx) >= 0) {
                printf("[Platform] Initializing EGL...\n");
                if (init_egl(ctx) >= 0) {
                    hw_init_ok = true;
                    printf("[Platform] Hardware rendering initialized!\n");
                } else {
                    gbm_surface_destroy(ctx->gbm_surf);
                    gbm_device_destroy(ctx->gbm_dev);
                    close(ctx->drm_fd);
                    ctx->drm_fd = -1;
                }
            } else {
                close(ctx->drm_fd);
                ctx->drm_fd = -1;
            }
        }
    }
    
    /* Fall back to software rendering if hardware failed */
    if (!hw_init_ok) {
        printf("[Platform] Hardware init failed, falling back to software rendering...\n");
        printf("[Platform] (This is normal in QEMU - games will run but display is off-screen)\n");
        
        ctx->software_mode = true;
        ctx->width = (width > 0) ? width : 640;
        ctx->height = (height > 0) ? height : 480;
        
        if (init_software_egl(ctx) < 0) {
            fprintf(stderr, "[Platform] Software EGL initialization also failed!\n");
            free(ctx);
            return NULL;
        }
        
        printf("[Platform] Software rendering mode active\n");
    }
    
    /* Initialize input devices */
    init_input_devices(ctx);
    
    /* Record start time */
    clock_gettime(CLOCK_MONOTONIC, &ctx->start_time);
    
    ctx->initialized = true;
    ctx->should_close = false;
    
    printf("[Platform] ARM platform initialized successfully%s\n", 
           ctx->software_mode ? " (SOFTWARE MODE)" : "");
    printf("[Platform] Display: %dx%d\n", ctx->width, ctx->height);
    
    return ctx;
}

/* Headless mode - no graphics at all, for testing game logic */
PlatformContext* platform_init_headless(int width, int height) {
    PlatformContext* ctx = (PlatformContext*)calloc(1, sizeof(PlatformContext));
    if (!ctx) {
        fprintf(stderr, "[Platform] Failed to allocate platform context\n");
        return NULL;
    }
    
    printf("[Platform] Initializing ARM platform in HEADLESS mode...\n");
    
    ctx->drm_fd = -1;
    ctx->fullscreen = true;
    ctx->software_mode = false;
    ctx->headless_mode = true;
    ctx->frame_count = 0;
    ctx->width = (width > 0) ? width : 640;
    ctx->height = (height > 0) ? height : 480;
    
    /* Mount filesystems if running as init */
    if (getpid() == 1) {
        printf("[Platform] Running as PID 1, mounting filesystems...\n");
        mount_filesystems();
    }
    
    /* Initialize input devices (still useful for testing) */
    init_input_devices(ctx);
    
    /* Record start time */
    clock_gettime(CLOCK_MONOTONIC, &ctx->start_time);
    
    ctx->initialized = true;
    ctx->should_close = false;
    
    printf("[Platform] HEADLESS mode active - no display output\n");
    printf("[Platform] Virtual display: %dx%d\n", ctx->width, ctx->height);
    
    return ctx;
}

void platform_shutdown(PlatformContext* ctx) {
    if (!ctx) return;
    
    printf("[Platform] Shutting down ARM platform...\n");
    
    /* Close input devices */
    for (int i = 0; i < ctx->input_fd_count; i++) {
        close(ctx->input_fds[i]);
    }
    
    /* Headless mode - nothing else to clean up */
    if (ctx->headless_mode) {
        free(ctx);
        return;
    }
    
    /* Restore original CRTC (only in hardware mode) */
    if (!ctx->software_mode && ctx->saved_crtc) {
        drmModeSetCrtc(ctx->drm_fd, ctx->saved_crtc->crtc_id,
                       ctx->saved_crtc->buffer_id,
                       ctx->saved_crtc->x, ctx->saved_crtc->y,
                       &ctx->connector_id, 1, &ctx->saved_crtc->mode);
        drmModeFreeCrtc(ctx->saved_crtc);
    }
    
    /* Cleanup EGL */
    if (ctx->egl_display != EGL_NO_DISPLAY) {
        eglMakeCurrent(ctx->egl_display, EGL_NO_SURFACE, EGL_NO_SURFACE, EGL_NO_CONTEXT);
        if (ctx->egl_surface != EGL_NO_SURFACE) {
            eglDestroySurface(ctx->egl_display, ctx->egl_surface);
        }
        if (ctx->egl_context != EGL_NO_CONTEXT) {
            eglDestroyContext(ctx->egl_display, ctx->egl_context);
        }
        eglTerminate(ctx->egl_display);
    }
    
    /* Cleanup GBM (only in hardware mode) */
    if (!ctx->software_mode) {
        if (ctx->gbm_surf) {
            gbm_surface_destroy(ctx->gbm_surf);
        }
        if (ctx->gbm_dev) {
            gbm_device_destroy(ctx->gbm_dev);
        }
    }
    
    /* Close DRM (only in hardware mode) */
    if (!ctx->software_mode && ctx->drm_fd >= 0) {
        close(ctx->drm_fd);
    }
    
    free(ctx);
}

void platform_get_display_info(PlatformContext* ctx, PlatformDisplayInfo* info) {
    if (!ctx || !info) return;
    
    info->width = ctx->width;
    info->height = ctx->height;
    info->fullscreen = ctx->fullscreen;
    info->aspect_ratio = (float)ctx->width / (float)ctx->height;
    info->refresh_rate = (ctx->software_mode || ctx->headless_mode) ? 60 : ctx->drm_mode.vrefresh;
}

void platform_swap_buffers(PlatformContext* ctx) {
    if (!ctx || !ctx->initialized) return;
    
    /* Headless mode: no rendering, just simulate vsync */
    if (ctx->headless_mode) {
        ctx->frame_count++;
        
        /* Print progress occasionally */
        if (ctx->frame_count % 60 == 0) {
            printf("[Platform] Headless mode: Frame %d (no display)\n", ctx->frame_count);
        }
        
        /* Simulate vsync delay (~16ms for 60fps) */
        usleep(16000);
        return;
    }
    
    /* Software mode: just swap EGL buffers (no actual display) */
    if (ctx->software_mode) {
        eglSwapBuffers(ctx->egl_display, ctx->egl_surface);
        ctx->frame_count++;
        
        /* Print progress occasionally */
        if (ctx->frame_count % 60 == 0) {
            printf("[Platform] Software mode: Frame %d rendered (off-screen)\n", ctx->frame_count);
        }
        
        /* Simulate vsync delay (~16ms for 60fps) */
        usleep(16000);
        return;
    }
    
    /* Hardware mode: Swap EGL buffers and page flip */
    eglSwapBuffers(ctx->egl_display, ctx->egl_surface);
    
    /* Get front buffer for scanout */
    ctx->current_bo = gbm_surface_lock_front_buffer(ctx->gbm_surf);
    DrmFramebuffer* fb = drm_fb_get(ctx, ctx->current_bo);
    
    if (!fb) {
        fprintf(stderr, "[Platform] Failed to get framebuffer\n");
        return;
    }
    
    /* First frame: set mode directly */
    if (!ctx->prev_bo) {
        int ret = drmModeSetCrtc(ctx->drm_fd, ctx->crtc_id, fb->fb_id, 0, 0,
                                 &ctx->connector_id, 1, &ctx->drm_mode);
        if (ret) {
            fprintf(stderr, "[Platform] drmModeSetCrtc failed: %s\n", strerror(errno));
        }
    } else {
        /* Page flip for subsequent frames */
        int waiting_for_flip = 1;
        int ret = drmModePageFlip(ctx->drm_fd, ctx->crtc_id, fb->fb_id,
                                  DRM_MODE_PAGE_FLIP_EVENT, &waiting_for_flip);
        
        if (ret) {
            fprintf(stderr, "[Platform] drmModePageFlip failed: %s\n", strerror(errno));
            waiting_for_flip = 0;
        }
        
        /* Wait for page flip to complete */
        drmEventContext ev = {
            .version = DRM_EVENT_CONTEXT_VERSION,
            .page_flip_handler = page_flip_handler,
        };
        
        while (waiting_for_flip) {
            fd_set fds;
            FD_ZERO(&fds);
            FD_SET(ctx->drm_fd, &fds);
            
            struct timeval timeout = { .tv_sec = 1, .tv_usec = 0 };
            int ret = select(ctx->drm_fd + 1, &fds, NULL, NULL, &timeout);
            
            if (ret < 0) {
                if (errno == EINTR) continue;
                break;
            } else if (ret == 0) {
                /* Timeout */
                break;
            }
            
            drmHandleEvent(ctx->drm_fd, &ev);
        }
        
        /* Release previous buffer */
        gbm_surface_release_buffer(ctx->gbm_surf, ctx->prev_bo);
    }
    
    ctx->prev_bo = ctx->current_bo;
}

void platform_poll_events(PlatformContext* ctx) {
    if (!ctx) return;
    
    /* Poll all input devices */
    for (int i = 0; i < ctx->input_fd_count; i++) {
        struct input_event ev;
        
        while (read(ctx->input_fds[i], &ev, sizeof(ev)) == sizeof(ev)) {
            if (!ctx->input_callback) continue;
            
            PlatformInputEvent event = {0};
            
            switch (ev.type) {
                case EV_KEY:
                    event.type = PLATFORM_INPUT_KEY;
                    event.code = ev.code;
                    event.state = ev.value ? PLATFORM_INPUT_PRESSED : PLATFORM_INPUT_RELEASED;
                    ctx->input_callback(&event, ctx->input_user_data);
                    
                    /* Check for exit key combo (e.g., START + SELECT) */
                    /* This is device-specific - adjust for RG353V */
                    if (ev.code == KEY_ESC && ev.value) {
                        ctx->should_close = true;
                    }
                    break;
                    
                case EV_ABS:
                    event.type = PLATFORM_INPUT_AXIS;
                    event.code = ev.code;
                    event.value = (float)ev.value;
                    ctx->input_callback(&event, ctx->input_user_data);
                    break;
                    
                default:
                    break;
            }
        }
    }
}

bool platform_should_close(PlatformContext* ctx) {
    if (!ctx) return true;
    return ctx->should_close;
}

void platform_set_input_callback(PlatformContext* ctx, PlatformInputCallback callback, void* user_data) {
    if (!ctx) return;
    ctx->input_callback = callback;
    ctx->input_user_data = user_data;
}

double platform_get_time(PlatformContext* ctx) {
    if (!ctx) return 0.0;
    
    struct timespec now;
    clock_gettime(CLOCK_MONOTONIC, &now);
    
    double elapsed = (now.tv_sec - ctx->start_time.tv_sec) +
                     (now.tv_nsec - ctx->start_time.tv_nsec) / 1000000000.0;
    return elapsed;
}

void platform_sleep(int ms) {
    usleep(ms * 1000);
}

void platform_make_current(PlatformContext* ctx) {
    if (!ctx) return;
    eglMakeCurrent(ctx->egl_display, ctx->egl_surface, ctx->egl_surface, ctx->egl_context);
}

void platform_set_vsync(PlatformContext* ctx, bool enabled) {
    if (!ctx) return;
    eglSwapInterval(ctx->egl_display, enabled ? 1 : 0);
}

#endif /* USE_EGL_GBM */
