#version 450

#include "config.glsl"

layout(location = 0) in uint i_voxel;
layout(location = 0) out vec3 o_position;
layout(location = 1) out vec2 o_uv;
layout(location = 2) out vec3 o_normal;
layout(set = 1, binding = 0) uniform position_t
{
    ivec3 vector;
}
u_position;
layout(set = 1, binding = 1) uniform mvp_t
{
    mat4 matrix;
}
u_mvp;

const vec3 normals[6] = vec3[6]
(
    vec3( 0, 0, 1),
    vec3( 0, 0,-1),
    vec3( 1, 0, 0),
    vec3(-1, 0, 0),
    vec3( 0, 1, 0),
    vec3( 0,-1, 0)
);

void main()
{
    const uint x = i_voxel >> VOXEL_X_OFFSET & VOXEL_X_MASK;
    const uint y = i_voxel >> VOXEL_Y_OFFSET & VOXEL_Y_MASK;
    const uint z = i_voxel >> VOXEL_Z_OFFSET & VOXEL_Z_MASK;
    const uint u = i_voxel >> VOXEL_U_OFFSET & VOXEL_U_MASK;
    const uint v = i_voxel >> VOXEL_V_OFFSET & VOXEL_V_MASK;
    const uint direction = i_voxel >> VOXEL_DIRECTION_OFFSET & VOXEL_DIRECTION_MASK;
    o_position = vec3(u_position.vector) + vec3(x, y, z);
    gl_Position = u_mvp.matrix * vec4(o_position, 1.0);
    o_uv.x = u / ATLAS_WIDTH * ATLAS_FACE_WIDTH;
    o_uv.y = v / ATLAS_HEIGHT * ATLAS_FACE_HEIGHT;
    o_normal = normals[direction];
}