#pragma once

#include <SDL3/SDL.h>
#include <stdbool.h>

typedef enum
{
    PIPELINE_SKY,
    PIPELINE_SHADOW,
    PIPELINE_OPAQUE,
    PIPELINE_EDGE,
    PIPELINE_COMPOSITE,
    PIPELINE_TRANSPARENT,
    PIPELINE_RAYCAST,
    PIPELINE_UI,
    PIPELINE_COUNT
}
pipeline_t;

bool pipeline_init(
    SDL_GPUDevice* device,
    SDL_Window* window);
void pipeline_free();
void pipeline_bind(
    SDL_GPURenderPass* pass,
    const pipeline_t pipeline);