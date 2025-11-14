#include "CutsceneManager.h"
#include "GLEngine.h"
#include <iostream>

CutsceneManager::CutsceneManager(GLEngine* engine) : engine(engine), actionTimer(0.0f) {}

CutsceneManager::~CutsceneManager() {}

void CutsceneManager::init() {
    // nothing for now
}

void CutsceneManager::update(double dt) {
    // Tick any playing cutscenes
    for (auto& kv : cutscenes) {
        Cutscene& cs = kv.second;
        if (!cs.playing) continue;
        if (cs.actions.empty()) { cs.playing = false; continue; }
        actionTimer -= static_cast<float>(dt);
        if (actionTimer <= 0.0f) {
            if (cs.currentStep < static_cast<int>(cs.actions.size())) {
                executeAction(cs.actions[cs.currentStep]);
                actionTimer = cs.actions[cs.currentStep].delay;
                cs.currentStep++;
            } else {
                cs.playing = false;
            }
        }
    }
}

void CutsceneManager::loadCutscene(const std::string& id, const nlohmann::json& data) {
    Cutscene cs;
    cs.id = id;
    cs.currentStep = 0;
    cs.playing = false;
    if (data.is_array()) {
        for (const auto& item : data) {
            CutsceneAction a;
            if (item.contains("type")) a.type = item["type"].get<std::string>();
            if (item.contains("delay")) a.delay = item["delay"].get<float>();
            if (item.contains("params") && item["params"].is_object()) {
                for (auto it = item["params"].begin(); it != item["params"].end(); ++it) {
                    a.params[it.key()] = it.value().get<std::string>();
                }
            }
            cs.actions.push_back(a);
        }
    }
    cutscenes[id] = cs;
}

void CutsceneManager::playCutscene(const std::string& id) {
    auto it = cutscenes.find(id);
    if (it == cutscenes.end()) {
        std::cerr << "CutsceneManager: cutscene not found: " << id << std::endl;
        return;
    }
    Cutscene& cs = it->second;
    cs.playing = true;
    cs.currentStep = 0;
    actionTimer = 0.0f;
    std::cout << "CutsceneManager: playing " << id << std::endl;
}

void CutsceneManager::stopCutscene(const std::string& id) {
    auto it = cutscenes.find(id);
    if (it != cutscenes.end()) {
        it->second.playing = false;
    }
}

void CutsceneManager::pauseCutscene(const std::string& id) {
    auto it = cutscenes.find(id);
    if (it != cutscenes.end()) it->second.playing = false;
}

void CutsceneManager::resumeCutscene(const std::string& id) {
    auto it = cutscenes.find(id);
    if (it != cutscenes.end()) it->second.playing = true;
}

bool CutsceneManager::isPlaying(const std::string& id) const {
    auto it = cutscenes.find(id);
    return it != cutscenes.end() && it->second.playing;
}

bool CutsceneManager::isLoaded(const std::string& id) const {
    return cutscenes.find(id) != cutscenes.end();
}

void CutsceneManager::executeAction(const CutsceneAction& action) {
    std::cout << "Cutscene action: " << action.type << std::endl;
    // Basic actions: move_sprite, dialogue, wait
    if (action.type == "move_sprite") {
        auto itx = action.params.find("x");
        auto ity = action.params.find("y");
        auto itz = action.params.find("z");
        auto idit = action.params.find("id");
        if (idit != action.params.end() && itx != action.params.end() && ity != action.params.end()) {
            std::string sid = idit->second;
            float x = std::stof(itx->second);
            float y = std::stof(ity->second);
            float z = (itz != action.params.end()) ? std::stof(itz->second) : 0.0f;
            World* w = engine->getWorld();
            if (w) {
                auto sp = w->getSpriteById(sid);
                if (sp) sp->pos = glm::vec3(x,y,z);
            }
        }
    } else if (action.type == "dialogue") {
        // show dialogue via avatar speak if sprite id provided
        auto idit = action.params.find("id");
        auto txtit = action.params.find("text");
        if (idit != action.params.end() && txtit != action.params.end()) {
            World* w = engine->getWorld();
            if (w) {
                auto sp = w->getSpriteById(idit->second);
                if (sp) {
                    // Try to cast to Avatar via raw pointer
                    Avatar* av = dynamic_cast<Avatar*>(sp.get());
                    if (av) av->speak(txtit->second, 3.0f);
                }
            }
        }
    }
}
