#pragma once

#include <memory>
#include <string>
#include <unordered_map>
#include <vector>

class GLEngine;

class AudioManager {
public:
    AudioManager(GLEngine* engine);
    ~AudioManager();

    void init();
    void update(double dt);
    void shutdown();

    // Sound effects
    void playSound(const std::string& soundId, float volume = 1.0f, bool loop = false);
    void stopSound(const std::string& soundId);
    void pauseSound(const std::string& soundId);
    void resumeSound(const std::string& soundId);

    // Music
    void playMusic(const std::string& musicId, float volume = 1.0f, bool loop = true);
    void stopMusic();
    void pauseMusic();
    void resumeMusic();
    void setMusicVolume(float volume);

    // Voice synthesis
    void speak(const std::string& text, const std::string& voice = "default", float rate = 1.0f, float volume = 1.0f);

    // Resource management
    void loadSound(const std::string& id, const std::string& path);
    void loadMusic(const std::string& id, const std::string& path);
    void unloadSound(const std::string& id);
    void unloadMusic(const std::string& id);

    GLEngine* engine;

private:
    std::unordered_map<std::string, std::string> soundPaths;
    std::unordered_map<std::string, std::string> musicPaths;
    std::string currentMusic;
    float musicVolume;
};
