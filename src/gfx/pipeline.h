#pragma once

typedef enum
{
    PIPELINE_VOXEL,
    PIPELINE_COUNT,
} pipeline_t;

typedef enum
{
    PIPELINE_VOXEL_CHUNK,
    PIPELINE_VOXEL_MVP,
    PIPELINE_VOXEL_SCALE,
} pipeline_uniform_t;

typedef enum
{
    PIPELINE_VOXEL_ATLAS,
} pipeline_sampler_t;

void pipeline_init(
    void* device,
    void* window);
void pipeline_free(
    void* device);
void pipeline_bind(
    void* pass,
    const pipeline_t pipeline);
void pipeline_push_uniform(
    void* commands,
    const pipeline_uniform_t type,
    const void* data);
void pipeline_bind_sampler(
    void* pass,
    const pipeline_sampler_t type,
    void* sampler,
    void* texture);