#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdlib.h>
#include <gfx/atlas.h>
#include <gfx/gfx.h>
#include "camera.h"
#include "noise.h"
#include "world.h"

static SDL_Window* window;
static SDL_GPUTexture* color;
static SDL_GPUTexture* depth;
static uint32_t width;
static uint32_t height;
static camera_t camera;

static void draw()
{
    if (!gfx_begin_frame())
    {
        return;
    }
    gfx_bind_pipeline(PIPELINE_VOXEL);
    camera_update(&camera);
    gfx_push_uniform(PIPELINE_VOXEL_MVP, camera.matrix);
    world_render(&camera, gfx_get_commands(), gfx_get_pass());
    gfx_end_frame();
}

int main(int argc, char** argv)
{
    (void) argc;
    (void) argv;

    SDL_SetAppMetadata("blocks", NULL, NULL);
    SDL_SetLogPriorities(SDL_LOG_PRIORITY_VERBOSE);
    if (!SDL_Init(SDL_INIT_VIDEO))
    {
        SDL_Log("Failed to initialize SDL: %s", SDL_GetError());
        return EXIT_FAILURE;
    }
    window = SDL_CreateWindow("blocks", 1024, 764, 0);
    if (!window)
    {
        SDL_Log("Failed to create window: %s", SDL_GetError());
        return EXIT_FAILURE;
    }
    gfx_init(window);
    noise_init(NOISE_CUBE);
    if (!world_init(gfx_get_device()))
    {
        return EXIT_FAILURE;
    }
    SDL_SetWindowResizable(window, true);
    SDL_Surface* icon = atlas_get_icon(BLOCK_GRASS, DIRECTION_N);
    SDL_SetWindowIcon(window, icon);
    SDL_DestroySurface(icon);

    camera_init(&camera);
    camera_move(&camera, 0, 30, 0);

    int loop = 1;
    while (loop)
    {
        SDL_Event event;
        while (SDL_PollEvent(&event))
        {
            switch (event.type)
            {
            case SDL_EVENT_QUIT:
                loop = 0;
                break;
            case SDL_EVENT_WINDOW_RESIZED:
                camera_size(&camera, event.window.data1, event.window.data2);
                break;
            case SDL_EVENT_MOUSE_MOTION:
                if (SDL_GetWindowRelativeMouseMode(window))
                {
                    float sensitivity = 0.1f;
                    camera_rotate(&camera, -event.motion.yrel * sensitivity, event.motion.xrel * sensitivity);
                }
                break;
            case SDL_EVENT_MOUSE_BUTTON_DOWN:
                SDL_SetWindowRelativeMouseMode(window, 1);
                break;
            case SDL_EVENT_KEY_DOWN:
                if (event.key.scancode == SDL_SCANCODE_ESCAPE)
                {
                    SDL_SetWindowRelativeMouseMode(window, 0);
                }
                break;
            }
        }

        float dx = 0.0f;
        float dy = 0.0f;
        float dz = 0.0f;
        if (SDL_GetKeyboardState(NULL)[SDL_SCANCODE_D]) dx++;
        if (SDL_GetKeyboardState(NULL)[SDL_SCANCODE_A]) dx--;
        if (SDL_GetKeyboardState(NULL)[SDL_SCANCODE_E]) dy++;
        if (SDL_GetKeyboardState(NULL)[SDL_SCANCODE_Q]) dy--;
        if (SDL_GetKeyboardState(NULL)[SDL_SCANCODE_W]) dz++;
        if (SDL_GetKeyboardState(NULL)[SDL_SCANCODE_S]) dz--;
        float speed = 5.1f;
        dx *= speed;
        dy *= speed;
        dz *= speed;

        camera_move(&camera, dx, dy, dz);
        world_move(camera.x, camera.y, camera.z);
        world_update();

        draw();
    }

    world_free();
    gfx_free();
    SDL_DestroyWindow(window);
    SDL_Quit();

    return EXIT_SUCCESS;
}