#include <SDL3/SDL_gpu.h>
#include <SDL3/SDL_video.h>
#include <SDL3/SDL_log.h>
#include <SDL3/SDL_error.h>
#include <stdbool.h>
#include <stdint.h>
#include <gfx/atlas.h>
#include <gfx/gfx.h>
#include <gfx/pipeline.h>
#include "helpers.h"

static SDL_GPUDevice* device;
static SDL_Window* window;
static SDL_GPUCommandBuffer* commands;
static SDL_GPURenderPass* pass;
static SDL_GPUTexture* depth;
static uint32_t width;
static uint32_t height;

bool gfx_init(
    void* handle)
{
    assert(handle);
    window = handle;
    device = SDL_CreateGPUDevice(SDL_GPU_SHADERFORMAT_SPIRV, 1, NULL);
    if (!device) {
        SDL_Log("Failed to create device: %s", SDL_GetError());
        return false;
    }
    if (!SDL_ClaimWindowForGPUDevice(device, window)) {
        SDL_Log("Failed to create swapchain: %s", SDL_GetError());
        return false;
    }
    atlas_init(device);
    pipeline_init(device, window);
    return true;
}

void gfx_free()
{
    assert(!commands);
    assert(!pass);
    if (depth) {
        SDL_ReleaseGPUTexture(device, depth);
        depth = NULL;
    }
    pipeline_free(device);
    atlas_free(device);
    SDL_ReleaseWindowFromGPUDevice(device, window);
    SDL_DestroyGPUDevice(device);
    device = NULL;
    window = NULL;
    width = 0;
    height = 0;
}

bool gfx_begin_frame()
{
    assert(!commands);
    assert(!pass);
    commands = SDL_AcquireGPUCommandBuffer(device);
    if (!commands) {
        SDL_Log("Failed to acquire command buffer: %s", SDL_GetError());
        return false;
    }
    uint32_t w;
    uint32_t h;
    SDL_GPUTexture* color;
    if (!SDL_AcquireGPUSwapchainTexture(commands, window, &color, &w, &h)) {
        SDL_Log("Failed to aqcuire swapchain image: %s", SDL_GetError());
        return false;
    }
    if (width != w || height != h) {
        if (depth) {
            SDL_ReleaseGPUTexture(device, depth);
            depth = NULL;
        }
        SDL_GPUTextureCreateInfo tci = {0};
        tci.usage = SDL_GPU_TEXTUREUSAGE_DEPTH_STENCIL_TARGET;
        tci.type = SDL_GPU_TEXTURETYPE_2D;
        tci.format = SDL_GPU_TEXTUREFORMAT_D32_FLOAT;
        tci.width = w;
        tci.height = h;
        tci.layer_count_or_depth = 1;
        tci.num_levels = 1;
        depth = SDL_CreateGPUTexture(device, &tci);
        if (!depth) {
            SDL_Log("Failed to create depth texture: %s", SDL_GetError());
            return false;
        }
        width = w;
        height = h;
    }
    SDL_GPUColorTargetInfo cti = {0};
    cti.clear_color = (SDL_FColor) {1.0f, 0.0f, 1.0f, 1.0f};
    cti.load_op = SDL_GPU_LOADOP_CLEAR;
    cti.store_op = SDL_GPU_STOREOP_STORE;
    cti.texture = color;
    SDL_GPUDepthStencilTargetInfo dsti = {0};
    dsti.clear_depth = 1;
    dsti.load_op = SDL_GPU_LOADOP_CLEAR;
    dsti.texture = depth;
    dsti.store_op = SDL_GPU_STOREOP_STORE;
    pass = SDL_BeginGPURenderPass(commands, &cti, 1, &dsti);
    if (!pass) {
        SDL_Log("Failed to begin render pass: %s", SDL_GetError());
        return false;
    }
    return true;
}

void gfx_end_frame()
{
    if (pass) {
        SDL_EndGPURenderPass(pass);
        pass = NULL;
    }
    if (commands) {
        SDL_SubmitGPUCommandBuffer(commands);
        commands = NULL;
    }
}

void gfx_bind_pipeline(
    const pipeline_t pipeline)
{
    if (!pass) {
        return;
    }
    pipeline_bind(pass, pipeline);
    switch (pipeline) {
    case PIPELINE_VOXEL:
        float scale[2];
        atlas_get_scale(scale);
        gfx_push_uniform(PIPELINE_VOXEL_SCALE, scale);
        SDL_GPUSampler* sampler = atlas_get_sampler();
        SDL_GPUTexture* texture = atlas_get_texture();
        pipeline_bind_sampler(pass, PIPELINE_VOXEL_ATLAS, sampler, texture);
        break;
    }
}

void gfx_push_uniform(
    const pipeline_uniform_t type,
    const void* data)
{
    if (!pass) {
        return;
    }
    pipeline_push_uniform(commands, type, data);
}

void* gfx_get_device()
{
    return device;
}

void* gfx_get_commands()
{
    return commands;
}
void* gfx_get_pass()
{
    return pass;
}
