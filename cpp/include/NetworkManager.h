#pragma once

#include <memory>
#include <string>
#include <unordered_map>
#include <functional>
#include <queue>
#include <mutex>
#include <thread>

class GLEngine;

struct NetworkMessage {
    std::string type;
    std::string data;
    int clientId;
};

class NetworkManager {
public:
    NetworkManager(GLEngine* engine);
    ~NetworkManager();

    void init();
    void update(double dt);
    void shutdown();

    // Connection
    bool connect(const std::string& host, int port);
    void disconnect();
    bool isConnected() const;

    // Messaging
    void sendMessage(const std::string& type, const std::string& data);
    void broadcastMessage(const std::string& type, const std::string& data);
    bool hasMessages() const;
    NetworkMessage receiveMessage();

    // Client management (server mode)
    void startServer(int port);
    void stopServer();
    bool isServer() const;
    std::vector<int> getConnectedClients() const;

    // Event handlers
    void onClientConnected(std::function<void(int)> callback);
    void onClientDisconnected(std::function<void(int)> callback);
    void onMessageReceived(std::function<void(const NetworkMessage&)> callback);

    GLEngine* engine;

private:
    void networkThread();
    void handleIncomingData();
    void processMessage(const NetworkMessage& msg);

    bool connected;
    bool serverMode;
    int serverSocket;
    std::unordered_map<int, int> clientSockets; // clientId -> socket

    std::queue<NetworkMessage> messageQueue;
    std::mutex queueMutex;

    std::thread networkThreadHandle;
    bool running;

    // Callbacks
    std::function<void(int)> clientConnectedCallback;
    std::function<void(int)> clientDisconnectedCallback;
    std::function<void(const NetworkMessage&)> messageReceivedCallback;
};
