#include <SDL3/SDL_error.h>
#include <SDL3/SDL_gpu.h>
#include <SDL3/SDL_log.h>
#include <SDL3/SDL_surface.h>
#include <stdbool.h>
#include <stddef.h>
#include <string.h>
#include "block.h"
#include <gfx/atlas.h>
#include "helpers.h"

static SDL_GPUSampler* sampler;
static SDL_GPUTexture* texture;
static SDL_Surface* surface;

bool atlas_init(
    void* device)
{
    assert(device);
    SDL_Surface* argb32 = SDL_LoadBMP("atlas.bmp");
    if (!argb32) {
        SDL_Log("Failed to load atlas: %s", SDL_GetError());
        return false;
    }
    SDL_Surface* rgba32 = SDL_ConvertSurface(argb32, SDL_PIXELFORMAT_RGBA32);
    if (!rgba32) {
        SDL_Log("Failed to convert atlas: %s", SDL_GetError());
        return false;
    }
    surface = rgba32;
    SDL_GPUTextureCreateInfo tci = {0};
    tci.format = SDL_GPU_TEXTUREFORMAT_R8G8B8A8_UNORM;
    tci.type = SDL_GPU_TEXTURETYPE_2D;
    tci.layer_count_or_depth = 1;
    tci.num_levels = 1;
    tci.usage = SDL_GPU_TEXTUREUSAGE_SAMPLER;
    tci.width = surface->w;
    tci.height = surface->h;
    texture = SDL_CreateGPUTexture(device, &tci);
    if (!texture) {
        SDL_Log("Failed to create atlas texture: %s", SDL_GetError());
        return false;
    }
    SDL_GPUTransferBufferCreateInfo tbci = {0};
    tbci.size = surface->w * surface->h * 4;
    tbci.usage = SDL_GPU_TRANSFERBUFFERUSAGE_UPLOAD;
    SDL_GPUTransferBuffer* buffer = SDL_CreateGPUTransferBuffer(device, &tbci);
    if (!buffer) {
        SDL_Log("Failed to create atlas transfer buffer: %s", SDL_GetError());
        return false;
    }
    void* data = SDL_MapGPUTransferBuffer(device, buffer, 0);
    if (!data) {
        SDL_Log("Failed to map atlas transfer buffer: %s", SDL_GetError());
        return false;
    }
    memcpy(data, surface->pixels, surface->w * surface->h * 4);
    SDL_UnmapGPUTransferBuffer(device, buffer);
    SDL_GPUCommandBuffer* commands = SDL_AcquireGPUCommandBuffer(device);
    if (!commands) {
        SDL_Log("Failed to acquire atlas command buffer: %s", SDL_GetError());
        return false;
    }
    SDL_GPUCopyPass* pass = SDL_BeginGPUCopyPass(commands);
    if (!pass) {
        SDL_Log("Failed to begin atlas copy pass: %s", SDL_GetError());
        return false;
    }
    SDL_GPUTextureTransferInfo tti = {0};
    tti.transfer_buffer = buffer;
    SDL_GPUTextureRegion region = {0};
    region.texture = texture;
    region.w = surface->w;
    region.h = surface->h;
    region.d = 1;
    SDL_UploadToGPUTexture(pass, &tti, &region, 0);
    SDL_EndGPUCopyPass(pass);
    SDL_SubmitGPUCommandBuffer(commands);
    SDL_ReleaseGPUTransferBuffer(device, buffer);
    SDL_GPUSamplerCreateInfo sci = {0};
    sci.min_filter = SDL_GPU_FILTER_NEAREST;
    sci.mag_filter = SDL_GPU_FILTER_NEAREST;
    sci.mipmap_mode = SDL_GPU_SAMPLERMIPMAPMODE_NEAREST;
    sci.address_mode_u = SDL_GPU_SAMPLERADDRESSMODE_CLAMP_TO_EDGE;
    sci.address_mode_v = SDL_GPU_SAMPLERADDRESSMODE_CLAMP_TO_EDGE;
    sci.address_mode_w = SDL_GPU_SAMPLERADDRESSMODE_CLAMP_TO_EDGE;
    sampler = SDL_CreateGPUSampler(device, &sci);
    if (!sampler) {
        SDL_Log("Failed to create atlas sampler: %s", SDL_GetError());
        return false;
    }
    return true;
}

void atlas_free(void* device)
{
    assert(device);
    if (sampler) {
        SDL_ReleaseGPUSampler(device, sampler);
        sampler = NULL;
    }
    if (texture) {
        SDL_ReleaseGPUTexture(device, texture);
        texture = NULL;
    }
    if (surface) {
        SDL_DestroySurface(surface);
        surface = NULL;
    }
}

void* atlas_get_sampler()
{
    return sampler;
}

void* atlas_get_texture()
{
    return texture;
}

void* atlas_get_icon(
    const block_t block,
    const direction_t dir)
{
    assert(block > BLOCK_EMPTY);
    assert(block < BLOCK_COUNT);
    assert(dir < DIRECTION_3);
    if (!surface) {
        return NULL;
    }
    const int w = 16;
    const int h = 16;
    SDL_Surface* icon = SDL_CreateSurface(w, h, SDL_PIXELFORMAT_RGBA32);
    if (!icon) {
        SDL_Log("Failed to create icon surface: %s", SDL_GetError());
        return NULL;
    }
    SDL_Rect src;
    src.x = blocks[block][dir][0] * w;
    src.y = blocks[block][dir][1] * h;
    src.w = w;
    src.h = h;
    SDL_Rect dst;
    dst.x = 0;
    dst.y = 0;
    dst.w = w;
    dst.h = h;
    if (!SDL_BlitSurface(surface, &src, icon, &dst)) {
        SDL_Log("Failed to blit icon surface: %s", SDL_GetError());
        SDL_DestroySurface(icon);
        return NULL;
    }
    return icon;
}

void atlas_get_scale(
    float scale[2])
{
    scale[0] = 16.0f / surface->w;
    scale[1] = 16.0f / surface->h;
}