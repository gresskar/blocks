#pragma once

#include <stdbool.h>
#include <stdint.h>
#include <gfx/pipeline.h>

bool gfx_init(
    void* window);
void gfx_free();
bool gfx_begin_frame();
void gfx_end_frame();
void gfx_bind_pipeline(
    const pipeline_t pipeline);
void gfx_push_uniform(
    const pipeline_uniform_t type,
    const void* data);
void* gfx_get_device();
void* gfx_get_commands();
void* gfx_get_pass();
