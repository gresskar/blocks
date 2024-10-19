#pragma once

#include <stdbool.h>
#include "block.h"
#include "helpers.h"

bool atlas_init(
    void* device);
void atlas_free(
    void* device);
void* atlas_get_sampler();
void* atlas_get_texture();
void* atlas_get_icon(
    const block_t block,
    const direction_t dir);
void atlas_get_scale(
    float scale[2]);