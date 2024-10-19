#include <SDL3/SDL_gpu.h>
#include <SDL3/SDL_iostream.h>
#include <SDL3/SDL_log.h>
#include <SDL3/SDL_error.h>
#include <stddef.h>
#include <string.h>
#include <gfx/shader.h>
#include "helpers.h"

void* shader_load(
    void* device,
    const char* file,
    const int uniforms,
    const int samplers)
{
    assert(device);
    assert(file);
    SDL_GPUShaderCreateInfo sci = {0};
    void* code = SDL_LoadFile(file, &sci.code_size);
    if (!code) {
        SDL_Log("Failed to load %s shader: %s", file, SDL_GetError());
        return NULL;
    }
    sci.code = code;
    if (strstr(file, ".vert")) {
        sci.stage = SDL_GPU_SHADERSTAGE_VERTEX;
    } else {
        sci.stage = SDL_GPU_SHADERSTAGE_FRAGMENT;
    }
    sci.format = SDL_GPU_SHADERFORMAT_SPIRV;
    sci.entrypoint = "main";
    sci.num_uniform_buffers = uniforms;
    sci.num_samplers = samplers;
    SDL_GPUShader* shader = SDL_CreateGPUShader(device, &sci);
    SDL_free(code);
    if (!shader) {
        SDL_Log("Failed to create %s shader: %s", file, SDL_GetError());
        return NULL;
    }
    return shader;
}

void shader_unload(
    void* device,
    void* shader)
{
    assert(device);
    assert(shader);
    if (shader) {
        SDL_ReleaseGPUShader(device, shader);
    }
}