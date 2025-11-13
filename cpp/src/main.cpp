#include "GLEngine.h"
#include <iostream>

int main()
{
    try
    {
        GLEngine engine;
        engine.init(1280, 720, "Pixospritz OpenGL");
        engine.run();
        engine.shutdown();
    }
    catch (const std::exception &e)
    {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    return 0;
}
