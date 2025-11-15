#pragma once

#include <memory>
#include <string>
#include <vector>
#include <unordered_map>
#include <nlohmann/json.hpp>

class GLEngine;

struct CutsceneAction {
    std::string type;
    std::unordered_map<std::string, std::string> params;
    float delay;
};

struct Cutscene {
    std::string id;
    std::vector<CutsceneAction> actions;
    int currentStep;
    bool playing;
};

class CutsceneManager {
public:
    CutsceneManager(GLEngine* engine);
    ~CutsceneManager();

    void init();
    void update(double dt);

    // Cutscene management
    void loadCutscene(const std::string& id, const nlohmann::json& data);
    void playCutscene(const std::string& id);
    void stopCutscene(const std::string& id);
    void pauseCutscene(const std::string& id);
    void resumeCutscene(const std::string& id);

    // Status
    bool isPlaying(const std::string& id) const;
    bool isLoaded(const std::string& id) const;

    // Backdrop for cutscenes
    void setBackdrop(const std::string& backdrop);
    const std::string& getCurrentBackdrop() const { return currentBackdrop; }

    GLEngine* engine;

private:
    void executeAction(const CutsceneAction& action);
    std::unordered_map<std::string, Cutscene> cutscenes;
    float actionTimer;
    std::string currentBackdrop;
};
