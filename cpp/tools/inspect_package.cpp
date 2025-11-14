#include <iostream>
#include <fstream>
#include <filesystem>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

int main(int argc, char** argv) {
    std::string pkg = "example/spritz";
    if (argc > 1) pkg = argv[1];
    std::cout << "Inspecting package: " << pkg << std::endl;
    std::filesystem::path base(pkg);
    auto manifestPath = base / "manifest.json";
    if (!std::filesystem::exists(manifestPath)) {
        std::cerr << "Manifest not found: " << manifestPath << std::endl;
        return 1;
    }
    json manifest;
    std::ifstream mf(manifestPath);
    mf >> manifest;
    mf.close();

    std::cout << "Manifest loaded. initialZones: ";
    if (manifest.contains("initialZones") && manifest["initialZones"].is_array()) {
        for (auto &z : manifest["initialZones"]) std::cout << z.get<std::string>() << " ";
    }
    std::cout << std::endl;

    std::string zone = "";
    if (manifest.contains("initialZones") && manifest["initialZones"].is_array() && manifest["initialZones"].size()>0) {
        zone = manifest["initialZones"][0].get<std::string>();
    } else if (manifest.contains("maps") && manifest["maps"].is_array() && manifest["maps"].size()>0) {
        zone = manifest["maps"][0].get<std::string>();
    }
    if (zone.empty()) {
        std::cerr << "No initial zone found in manifest." << std::endl;
        return 1;
    }

    auto mapPath = base / "maps" / zone / "map.json";
    if (!std::filesystem::exists(mapPath)) {
        std::cerr << "map.json not found for zone " << zone << " at " << mapPath << std::endl;
        return 1;
    }

    json mapData;
    std::ifstream mf2(mapPath);
    mf2 >> mapData;
    mf2.close();
    std::cout << "Loaded map.json for zone '" << zone << "' size=" << std::filesystem::file_size(mapPath) << std::endl;

    // Print basic info
    if (mapData.contains("bounds")) {
        std::cout << "bounds: " << mapData["bounds"] << std::endl;
    }
    if (mapData.contains("tileset")) {
        std::cout << "map tileset: " << mapData["tileset"].get<std::string>() << std::endl;
    }

    // Tilesets array
    if (mapData.contains("tilesets") && mapData["tilesets"].is_array()) {
        std::cout << "Map has " << mapData["tilesets"].size() << " tileset entries." << std::endl;
        for (auto &ts : mapData["tilesets"]) {
            std::cout << " - tileset entry: ";
            if (ts.is_object()) {
                if (ts.contains("name")) std::cout << ts["name"].get<std::string>() << " ";
                if (ts.contains("image")) std::cout << "image=" << ts["image"].get<std::string>() << " ";
                if (ts.contains("src")) std::cout << "src=" << ts["src"].get<std::string>() << " ";
                if (ts.contains("firstgid")) std::cout << "firstgid=" << ts["firstgid"] << " ";
            } else if (ts.is_string()) {
                std::cout << ts.get<std::string>() << " ";
            }
            std::cout << std::endl;
        }
    } else {
        std::cout << "No tilesets array in map.json; map.tileset=" << (mapData.contains("tileset")? mapData["tileset"].get<std::string>() : "(none)") << std::endl;
    }

    // Check layers
    if (mapData.contains("layers") && mapData["layers"].is_array()) {
        std::cout << "Map layers: " << mapData["layers"].size() << std::endl;
        for (auto &layer : mapData["layers"]) {
            std::string type = layer.value("type", "");
            std::cout << " - layer type=" << type << " name=" << layer.value("name","(noname)") << std::endl;
            if (type == "tilelayer" && layer.contains("data")) {
                auto &ldata = layer["data"];
                size_t nonZero = 0;
                size_t sampleN = std::min<size_t>(20, ldata.size());
                std::cout << "   data size=" << ldata.size() << " sample:";
                for (size_t i=0;i<sampleN;++i) { std::cout << ldata[i] << ","; if (ldata[i].get<int>()!=0) ++nonZero; }
                std::cout << std::endl;
                // count non-zero
                for (auto &v : ldata) if (v.get<int>()!=0) ++nonZero;
                std::cout << "   non-zero tile count=" << nonZero << std::endl;
            }
        }
    } else {
        std::cout << "No layers array. Checking cells..." << std::endl;
        if (mapData.contains("cells")) {
            std::cout << " cells size=" << mapData["cells"].size() << std::endl;
        }
    }

    // Tileset files in package
    auto tilesetName = mapData.value("tileset", "");
    if (!tilesetName.empty()) {
        auto tsPath = base / "tilesets" / tilesetName / "tileset.json";
        if (std::filesystem::exists(tsPath)) {
            std::cout << "Found tileset JSON at " << tsPath << std::endl;
            json tsj;
            std::ifstream tfs(tsPath);
            tfs >> tsj; tfs.close();
            std::string imagePath;
            if (tsj.contains("image")) imagePath = (base / tsj["image"].get<std::string>()).string();
            else if (tsj.contains("src")) imagePath = (base / "textures" / tsj["src"].get<std::string>()).string();
            std::cout << " tileset name=" << tsj.value("name", "(noname)") << " tileSize=" << tsj.value("tileSize", 0) << " sheetSize=" << (tsj.contains("sheetSize")? tsj["sheetSize"].dump() : std::string("(none)")) << std::endl;
            if (!imagePath.empty()) {
                std::cout << " image path resolved to: " << imagePath << std::endl;
                if (std::filesystem::exists(imagePath)) {
                    std::cout << " image exists, size=" << std::filesystem::file_size(imagePath) << std::endl;
                } else {
                    std::cout << " image DOES NOT exist at that path" << std::endl;
                }
            }
        } else {
            std::cout << "Tileset JSON not found at " << tsPath << std::endl;
        }
    }

    std::cout << "Inspection complete." << std::endl;
    return 0;
}
