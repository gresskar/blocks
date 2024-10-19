#version 450

#include "block.inc"

layout(location = 0) in uint voxel;
layout(location = 0) out vec2 uv;
layout(set = 1, binding = 0) uniform mvp_t
{
    mat4 matrix;
} mvp;
layout(set = 1, binding = 1) uniform chunk_t
{
    ivec3 vector;
} chunk;
layout(set = 1, binding = 2) uniform scale_t
{
    vec2 vector;
} scale;

void main()
{
    uint x = voxel >> BLOCK_X_OFFSET & BLOCK_X_MASK;
    uint y = voxel >> BLOCK_Y_OFFSET & BLOCK_Y_MASK;
    uint z = voxel >> BLOCK_Z_OFFSET & BLOCK_Z_MASK;
    uint u = voxel >> BLOCK_U_OFFSET & BLOCK_U_MASK;
    uint v = voxel >> BLOCK_V_OFFSET & BLOCK_V_MASK;
    ivec3 position = chunk.vector + ivec3(x, y, z);
    uv = scale.vector * vec2(u, v);
    gl_Position = mvp.matrix * vec4(position, 1.0);
}