#include "Tileset.h"
#include <iostream>
#include <cstring>
#include <filesystem>
#include "../third_party/stb_image.h"

Tileset::Tileset(GLEngine* engine, const std::string& id) : engine(engine), id(id), tileWidth(32), tileHeight(32), imageWidth(0), imageHeight(0), columns(0), rows(0), tileCount(0), firstGid(0), textureId(0) {}

Tileset::~Tileset() {
    if (textureId != 0) {
        glDeleteTextures(1, &textureId);
    }
}

void Tileset::init() {
    // Initialize tileset
}

void Tileset::loadFromJson(const nlohmann::json& data, const std::string& gamePath) {
    // Support multiple tileset JSON formats used by example packages.
    // Prefer explicit keys, fall back to alternate schema used in `example/spritz`.
    name = data.value("name", id);

    // image path: either "image" or "src". Try several candidate locations so
    // packages that use different conventions still resolve their assets.
    std::string rawImage;
    if (data.contains("image") && data["image"].is_string()) rawImage = data["image"].get<std::string>();
    else if (data.contains("src") && data["src"].is_string()) rawImage = data["src"].get<std::string>();

    imagePath = "";
    // Trim whitespace/newlines from rawImage
    auto trim = [](std::string &s) {
        while (!s.empty() && isspace((unsigned char)s.front())) s.erase(s.begin());
        while (!s.empty() && isspace((unsigned char)s.back())) s.pop_back();
    };
    if (!rawImage.empty()) {
        trim(rawImage);
        // If rawImage is already absolute, try it first
        if (rawImage.size() > 0 && (rawImage[0] == '/' || (rawImage.size() > 1 && rawImage[1] == ':'))) {
            if (std::filesystem::exists(rawImage)) imagePath = rawImage;
        }

        // Candidate locations relative to gamePath
        std::vector<std::string> candidates;
        candidates.push_back(gamePath + "/" + rawImage);
        candidates.push_back(gamePath + "/textures/" + rawImage);
        candidates.push_back(gamePath + "/tilesets/" + id + "/" + rawImage);
        candidates.push_back(gamePath + "/tilesets/" + id + "/textures/" + rawImage);
        candidates.push_back(gamePath + "/textures/tileset.png");
        candidates.push_back(gamePath + "/textures/" + id + ".png");

        for (const auto &c : candidates) {
            if (!c.empty() && std::filesystem::exists(c)) { imagePath = c; break; }
        }

        // Debug: report chosen path when trying to load texture
        std::cout << "Tileset::resolved image candidates for '" << id << "' -> raw='" << rawImage << "' selected='" << imagePath << "'\n";

        // If nothing found, fall back to rawImage as-is (maybe working directory will resolve it)
        if (imagePath.empty()) imagePath = rawImage;
    } else {
        imagePath = ""; // will use placeholder texture
    }

    // tile size
    if (data.contains("tilewidth") && data.contains("tileheight")) {
        tileWidth = data.value("tilewidth", tileWidth);
        tileHeight = data.value("tileheight", tileHeight);
    } else if (data.contains("tileSize")) {
        tileWidth = tileHeight = data.value("tileSize", tileWidth);
    } else if (data.contains("tileSize") && data["tileSize"].is_object()) {
        // older/alternate schemas
        tileWidth = tileHeight = data.value("tileSize", tileWidth);
    }

    // image dimensions
    if (data.contains("imagewidth") && data.contains("imageheight")) {
        imageWidth = data.value("imagewidth", imageWidth);
        imageHeight = data.value("imageheight", imageHeight);
    } else if (data.contains("sheetSize") && data["sheetSize"].is_array() && data["sheetSize"].size() >= 2) {
        imageWidth = data["sheetSize"][0].get<int>();
        imageHeight = data["sheetSize"][1].get<int>();
    }

    // columns / rows / tileCount / firstGid
    if (data.contains("columns")) {
        columns = data.value("columns", columns);
    }
    if (columns == 0 && tileWidth > 0 && imageWidth > 0) {
        columns = imageWidth / tileWidth;
    }
    if (imageHeight > 0 && tileHeight > 0) {
        rows = imageHeight / tileHeight;
    }
    if (data.contains("tilecount")) {
        tileCount = data.value("tilecount", tileCount);
    }
    if (tileCount == 0 && columns > 0 && rows > 0) {
        tileCount = columns * rows;
    }
    firstGid = data.value("firstgid", data.value("firstGid", firstGid));

    // Ensure firstGid is at least 1 so generated tile ids are non-zero
    if (firstGid == 0) firstGid = 1;

    // Load texture if possible, otherwise create placeholder
    if (!imagePath.empty()) {
    std::cout << "Tileset::loadFromJson loading image: " << imagePath << " (tileset=" << name << ")" << std::endl;
    loadTexture(imagePath);
    } else {
        loadTexture("");
    }

    // Guard against divide-by-zero when computing UVs
    if (imageWidth <= 0) imageWidth = std::max(1, columns * tileWidth);
    if (imageHeight <= 0) imageHeight = std::max(1, rows * tileHeight);

    generateTiles();
}

void Tileset::bindTexture() {
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, textureId);
}

void Tileset::unbindTexture() {
    glBindTexture(GL_TEXTURE_2D, 0);
}

const Tile* Tileset::getTile(int id) const {
    for (const auto& tile : tiles) {
        if (tile.id == id) {
            return &tile;
        }
    }
    return nullptr;
}

bool Tileset::isTileWalkable(int id) const {
    const Tile* tile = getTile(id);
    return tile ? tile->walkable : false;
}

bool Tileset::isTileInteractive(int id) const {
    const Tile* tile = getTile(id);
    return tile ? tile->interactive : false;
}

void Tileset::loadTexture(const std::string& path) {
    glGenTextures(1, &textureId);
    glBindTexture(GL_TEXTURE_2D, textureId);

    if (!path.empty()) {
        int w = 0, h = 0, channels = 0;
        // Diagnostic: verify filesystem can see the file and report size
        try {
            bool exists = std::filesystem::exists(path);
            std::cout << "Tileset::loadTexture checking path exists=" << (exists ? "yes" : "no") << " path='" << path << "'\n";
            if (exists) {
                try { auto fsz = std::filesystem::file_size(path); std::cout << "Tileset::loadTexture file_size=" << fsz << " bytes\n"; } catch(...){}
            }
        } catch(...) {}

    // Attempt to load with stb_image; rely on filesystem diagnostics above to help
        unsigned char* img = stbi_load(path.c_str(), &w, &h, &channels, 4);
        if (img) {
            imageWidth = w;
            imageHeight = h;
            glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, w, h, 0, GL_RGBA, GL_UNSIGNED_BYTE, img);
            stbi_image_free(img);
            std::cout << "Tileset::loadTexture SUCCESS: " << path << " size=" << w << "x" << h << std::endl;
        } else {
            std::cerr << "Failed to load texture: " << path << ", using placeholder checkerboard" << std::endl;
            // If we already know sheet dimensions from JSON, use them instead of forcing 8x8
            int pw = imageWidth > 0 ? imageWidth : 8;
            int ph = imageHeight > 0 ? imageHeight : 8;
            std::vector<unsigned char> pdata(pw * ph * 4);
            for (int y = 0; y < ph; ++y) {
                for (int x = 0; x < pw; ++x) {
                    bool white = (((x / std::max(1, tileWidth/2)) % 2) == ((y / std::max(1, tileHeight/2)) % 2));
                    unsigned char v = white ? 200 : 50;
                    int idx = (y * pw + x) * 4;
                    pdata[idx + 0] = v;
                    pdata[idx + 1] = v;
                    pdata[idx + 2] = v;
                    pdata[idx + 3] = 255;
                }
            }
            glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, pw, ph, 0, GL_RGBA, GL_UNSIGNED_BYTE, pdata.data());
            if (imageWidth == 0) imageWidth = pw;
            if (imageHeight == 0) imageHeight = ph;
        }
    } else {
        unsigned char data[] = {255, 255, 255, 255};
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, 1, 1, 0, GL_RGBA, GL_UNSIGNED_BYTE, data);
        if (imageWidth == 0) imageWidth = 1;
        if (imageHeight == 0) imageHeight = 1;
    }

    std::cout << "Tileset::loadTexture final image size for '" << id << "' = " << imageWidth << "x" << imageHeight << " firstGid=" << firstGid << std::endl;

    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glBindTexture(GL_TEXTURE_2D, 0);
}

void Tileset::generateTiles() {
    tiles.clear();
    for (int i = 0; i < tileCount; ++i) {
        Tile tile;
        tile.id = firstGid + i;
        tile.name = "Tile " + std::to_string(tile.id);
        tile.walkable = true; // Default to walkable
        tile.interactive = false; // Default to non-interactive

        int x = (i % columns) * tileWidth;
        int y = (i / columns) * tileHeight;
        tile.uvMin = glm::vec2((float)x / imageWidth, (float)y / imageHeight);
        tile.uvMax = glm::vec2((float)(x + tileWidth) / imageWidth, (float)(y + tileHeight) / imageHeight);

        tiles.push_back(tile);
    }
}
