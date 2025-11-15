#pragma once

#include <string>
#include <memory>

class Sound {
public:
    Sound(const std::string& id, const std::string& path);
    ~Sound();

    void play(float volume = 1.0f, bool loop = false);
    void stop();
    void pause();
    void resume();

    std::string getId() const { return id; }
    std::string getPath() const { return path; }

private:
    std::string id;
    std::string path;
    // TODO: Add audio backend specific data
};
