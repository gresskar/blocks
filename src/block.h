#pragma once

#include <stdbool.h>
#include <stdint.h>
#include "helpers.h"

typedef uint8_t block_t;
enum
{
    BLOCK_EMPTY,
    BLOCK_CLOUD,
    BLOCK_DIRT,
    BLOCK_GLASS,
    BLOCK_GRASS,
    BLOCK_LAVA,
    BLOCK_SAND,
    BLOCK_SNOW,
    BLOCK_STONE,
    BLOCK_WATER,
    BLOCK_COUNT,
};

extern const int blocks[][DIRECTION_3][2];

bool block_visible(const block_t a, const block_t b);
uint32_t block_get_index(const int i);
uint32_t block_get_voxel(
    const block_t block,
    const int x,
    const int y,
    const int z,
    const direction_t direction,
    const int light,
    const int i);