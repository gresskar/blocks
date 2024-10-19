#include <SDL3/SDL_gpu.h>
#include <SDL3/SDL_video.h>
#include <SDL3/SDL_log.h>
#include <SDL3/SDL_error.h>
#include <stddef.h>
#include <gfx/pipeline.h>
#include <gfx/shader.h>
#include "helpers.h"

static SDL_GPUGraphicsPipeline* pipelines[PIPELINE_COUNT];

void pipeline_init(
    void* device,
    void* window)
{
    assert(device);
    assert(window);
    SDL_GPUGraphicsPipelineCreateInfo voxel = {
        .vertex_shader = shader_load(device, "voxel.vert", 3, 0),
        .fragment_shader = shader_load(device, "voxel.frag", 0, 1),
        .target_info = {
            .num_color_targets = 1,
            .color_target_descriptions = (SDL_GPUColorTargetDescription[]) {{
                .format = SDL_GetGPUSwapchainTextureFormat(device, window)
            }},
            .has_depth_stencil_target = 1,
            .depth_stencil_format = SDL_GPU_TEXTUREFORMAT_D32_FLOAT,
        },
        .vertex_input_state = {
            .num_vertex_attributes = 1,
            .vertex_attributes = (SDL_GPUVertexAttribute[]) {{
                .format = SDL_GPU_VERTEXELEMENTFORMAT_UINT,
            }},
            .num_vertex_buffers = 1,
            .vertex_buffer_descriptions = (SDL_GPUVertexBufferDescription[]) {{
                .input_rate = SDL_GPU_VERTEXINPUTRATE_VERTEX,
                .pitch = 4,
            }},
        },
        .depth_stencil_state = {
            .enable_depth_test = 1,
            .enable_depth_write = 1,
            .compare_op = SDL_GPU_COMPAREOP_LESS,
        },
        .rasterizer_state = {
            .cull_mode = SDL_GPU_CULLMODE_BACK,
            .front_face = SDL_GPU_FRONTFACE_CLOCKWISE,
            .fill_mode = SDL_GPU_FILLMODE_FILL,
        },
    };
    pipelines[PIPELINE_VOXEL] = SDL_CreateGPUGraphicsPipeline(device, &voxel);
    if (!pipelines[PIPELINE_VOXEL]) {
        SDL_Log("Failed to create voxel pipeline: %s", SDL_GetError());
    }
    shader_unload(device, voxel.vertex_shader);
    shader_unload(device, voxel.fragment_shader);
}

void pipeline_free(
    void* device)
{
    assert(device);
    for (int i = 0; i < PIPELINE_COUNT; i++) {
        if (pipelines[i]) {
            SDL_ReleaseGPUGraphicsPipeline(device, pipelines[i]);
            pipelines[i] = NULL;
        }
    }
}

void pipeline_bind(
    void* pass,
    const pipeline_t pipeline)
{
    assert(pass);
    assert(pipeline < PIPELINE_COUNT);
    if (pipelines[pipeline]) {
        SDL_BindGPUGraphicsPipeline(pass, pipelines[pipeline]);
    }
}

void pipeline_push_uniform(
    void* commands,
    const pipeline_uniform_t type,
    const void* data)
{
    assert(commands);
    assert(data);
    switch (type) {
    case PIPELINE_VOXEL_CHUNK:
        SDL_PushGPUVertexUniformData(commands, 1, data, 12);
        break;
    case PIPELINE_VOXEL_MVP:
        SDL_PushGPUVertexUniformData(commands, 0, data, 64);
        break;
    case PIPELINE_VOXEL_SCALE:
        SDL_PushGPUVertexUniformData(commands, 2, data, 8);
        break;
    default:
        assert(0);
    }
}

void pipeline_bind_sampler(
    void* pass,
    const pipeline_sampler_t type,
    void* sampler,
    void* texture)
{
    assert(pass);
    assert(sampler);
    assert(texture);
    SDL_GPUTextureSamplerBinding tsb = {0};
    tsb.sampler = sampler;
    tsb.texture = texture;
    switch (type) {
    case PIPELINE_VOXEL_ATLAS:
        SDL_BindGPUFragmentSamplers(pass, 0, &tsb, 1);
        break;
    default:
        assert(0);
    }
}