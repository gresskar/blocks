#include <stdbool.h>
#include <stdint.h>
#include "block.h"
#include "block.inc"
#include "helpers.h"

const int blocks[][DIRECTION_3][2] =
{
    {{0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}},
    {{0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}},
    {{3, 0}, {3, 0}, {3, 0}, {3, 0}, {3, 0}, {3, 0}},
    {{0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}},
    {{2, 0}, {2, 0}, {2, 0}, {2, 0}, {1, 0}, {3, 0}},
    {{0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}},
    {{0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}},
    {{0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}},
    {{4, 0}, {4, 0}, {4, 0}, {4, 0}, {4, 0}, {4, 0}},
    {{0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}},
};

static bool opaque(const block_t block)
{
    assert(block > BLOCK_EMPTY);
    assert(block < BLOCK_COUNT);
    switch (block)
    {
    case BLOCK_GLASS:
    case BLOCK_WATER:
        return 0;
    }
    return 1;
}

bool block_visible(const block_t a, const block_t b)
{
    return b == BLOCK_EMPTY || (opaque(a) && !opaque(b));
}

uint32_t block_get_voxel(
    const block_t block,
    const int x,
    const int y,
    const int z,
    const direction_t direction,
    const int light,
    const int i)
{
    static const int positions[][4][3] =
    {
        {{0, 0, 1}, {0, 1, 1}, {1, 0, 1}, {1, 1, 1}},
        {{0, 0, 0}, {1, 0, 0}, {0, 1, 0}, {1, 1, 0}},
        {{1, 0, 0}, {1, 0, 1}, {1, 1, 0}, {1, 1, 1}},
        {{0, 0, 0}, {0, 1, 0}, {0, 0, 1}, {0, 1, 1}},
        {{0, 1, 0}, {1, 1, 0}, {0, 1, 1}, {1, 1, 1}},
        {{0, 0, 0}, {0, 0, 1}, {1, 0, 0}, {1, 0, 1}},
    };
    static const int uvs[][4][2] =
    {
        {{1, 1}, {1, 0}, {0, 1}, {0, 0}},
        {{1, 1}, {0, 1}, {1, 0}, {0, 0}},
        {{1, 1}, {0, 1}, {1, 0}, {0, 0}},
        {{1, 1}, {1, 0}, {0, 1}, {0, 0}},
        {{0, 0}, {1, 0}, {0, 1}, {1, 1}},
        {{0, 0}, {0, 1}, {1, 0}, {1, 1}},
    };
    assert(block > BLOCK_EMPTY);
    assert(block < BLOCK_COUNT);
    assert(direction < DIRECTION_3);
    assert(i < 4);
    const int a = positions[direction][i][0] + x;
    const int b = positions[direction][i][1] + y;
    const int c = positions[direction][i][2] + z;
    const int d = uvs[direction][i][0] + blocks[block][direction][0];
    const int e = uvs[direction][i][1] + blocks[block][direction][1];
    static_assert(BLOCK_X_OFFSET + BLOCK_X_BITS <= 32, "");
    static_assert(BLOCK_Y_OFFSET + BLOCK_Y_BITS <= 32, "");
    static_assert(BLOCK_Z_OFFSET + BLOCK_Z_BITS <= 32, "");
    static_assert(BLOCK_U_OFFSET + BLOCK_U_BITS <= 32, "");
    static_assert(BLOCK_V_OFFSET + BLOCK_V_BITS <= 32, "");
    static_assert(BLOCK_DIRECTION_OFFSET + BLOCK_DIRECTION_BITS <= 32, "");
    static_assert(BLOCK_LIGHT_OFFSET + BLOCK_LIGHT_BITS <= 32, "");
    assert(a <= BLOCK_X_MASK);
    assert(b <= BLOCK_Y_MASK);
    assert(c <= BLOCK_Z_MASK);
    assert(d <= BLOCK_U_MASK);
    assert(e <= BLOCK_V_MASK);
    assert(direction <= BLOCK_DIRECTION_MASK);
    assert(light <= BLOCK_LIGHT_MASK);
    uint32_t voxel = 0;
    voxel |= a << BLOCK_X_OFFSET;
    voxel |= b << BLOCK_Y_OFFSET;
    voxel |= c << BLOCK_Z_OFFSET;
    voxel |= d << BLOCK_U_OFFSET;
    voxel |= e << BLOCK_V_OFFSET;
    voxel |= direction << BLOCK_DIRECTION_OFFSET;
    voxel |= light << BLOCK_LIGHT_OFFSET;
    return voxel;
}

uint32_t block_get_index(const int i)
{
    switch (i)
    {
    case 0: return 0;
    case 1: return 1;
    case 2: return 2;
    case 3: return 3;
    case 4: return 2;
    case 5: return 1;
    }
    assert(0);
    return 0;
}