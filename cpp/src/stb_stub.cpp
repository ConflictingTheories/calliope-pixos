// macOS-backed implementation of stbi_load/stbi_image_free using ImageIO/CoreGraphics
// This avoids shipping the full stb_image single-file implementation while providing
// PNG/JPEG decoding on macOS hosts.
#include <CoreFoundation/CoreFoundation.h>
#include <CoreGraphics/CoreGraphics.h>
#include <ImageIO/ImageIO.h>
#include <vector>
#include <fstream>
#include <iterator>
#include <cstring>
#include <cstdlib>

extern "C" unsigned char* stbi_load(const char* filename, int* x, int* y, int* comp, int req_comp) {
    if (!filename) return nullptr;
    try {
        std::ifstream ifs(filename, std::ios::binary);
        if (!ifs) return nullptr;
        std::vector<unsigned char> buf((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
        if (buf.empty()) return nullptr;

        CFDataRef data = CFDataCreate(kCFAllocatorDefault, buf.data(), buf.size());
        if (!data) return nullptr;
        CGImageSourceRef src = CGImageSourceCreateWithData(data, nullptr);
        if (!src) { CFRelease(data); return nullptr; }
        CGImageRef image = CGImageSourceCreateImageAtIndex(src, 0, nullptr);
        if (!image) { CFRelease(src); CFRelease(data); return nullptr; }

        size_t width = CGImageGetWidth(image);
        size_t height = CGImageGetHeight(image);
        size_t bytesPerRow = width * 4;
        size_t bufSize = bytesPerRow * height;

        std::vector<unsigned char> pixels(bufSize);
        CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
        CGContextRef ctx = CGBitmapContextCreate(pixels.data(), (size_t)width, (size_t)height, 8, (size_t)bytesPerRow, colorSpace, kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
        CGColorSpaceRelease(colorSpace);
        if (!ctx) { CGImageRelease(image); CFRelease(src); CFRelease(data); return nullptr; }

        CGRect rect = CGRectMake(0, 0, (CGFloat)width, (CGFloat)height);
        CGContextDrawImage(ctx, rect, image);
        CGContextRelease(ctx);
        CGImageRelease(image);
        CFRelease(src);
        CFRelease(data);

        unsigned char* out = (unsigned char*)malloc(bufSize);
        if (!out) return nullptr;
        memcpy(out, pixels.data(), bufSize);
        if (x) *x = (int)width;
        if (y) *y = (int)height;
        if (comp) *comp = 4;
        return out;
    } catch (...) {
        return nullptr;
    }
}

extern "C" void stbi_image_free(void* retval_from_stbi_load) {
    if (retval_from_stbi_load) free(retval_from_stbi_load);
}
