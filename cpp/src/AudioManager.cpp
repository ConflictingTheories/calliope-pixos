#include "AudioManager.h"
#include "Sound.h"
#include <iostream>

AudioManager::AudioManager(GLEngine* engine) : engine(engine), musicVolume(1.0f) {}
AudioManager::~AudioManager() {}

void AudioManager::init() {}
void AudioManager::update(double dt) {}
void AudioManager::shutdown() {}

void AudioManager::playSound(const std::string& soundId, float volume, bool loop) {
    std::cout << "AudioManager::playSound(" << soundId << ", vol=" << volume << ", loop=" << loop << ")" << std::endl;
}
void AudioManager::stopSound(const std::string& soundId) {
    std::cout << "AudioManager::stopSound(" << soundId << ")" << std::endl;
}
void AudioManager::pauseSound(const std::string& soundId) { std::cout << "AudioManager::pauseSound(" << soundId << ")" << std::endl; }
void AudioManager::resumeSound(const std::string& soundId) { std::cout << "AudioManager::resumeSound(" << soundId << ")" << std::endl; }

void AudioManager::playMusic(const std::string& musicId, float volume, bool loop) {
    currentMusic = musicId;
    musicVolume = volume;
    std::cout << "AudioManager::playMusic(" << musicId << ")" << std::endl;
}

void AudioManager::stopMusic() { std::cout << "AudioManager::stopMusic()" << std::endl; currentMusic.clear(); }
void AudioManager::pauseMusic() { std::cout << "AudioManager::pauseMusic()" << std::endl; }
void AudioManager::resumeMusic() { std::cout << "AudioManager::resumeMusic()" << std::endl; }
void AudioManager::setMusicVolume(float volume) { musicVolume = volume; }

void AudioManager::speak(const std::string& text, const std::string& voice, float rate, float volume) {
    std::cout << "AudioManager::speak(\"" << text << "\")" << std::endl;
}

std::shared_ptr<Sound> AudioManager::loadSound(const std::string& id, const std::string& path) {
    soundPaths[id] = path;
    return std::make_shared<Sound>(id, path);
}
void AudioManager::loadMusic(const std::string& id, const std::string& path) { musicPaths[id] = path; }
void AudioManager::unloadSound(const std::string& id) { soundPaths.erase(id); }
void AudioManager::unloadMusic(const std::string& id) { musicPaths.erase(id); }
