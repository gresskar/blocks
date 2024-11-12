#version 450

#include "config.glsl"
#include "helpers.glsl"

layout(location = 0) in uint i_voxel;
layout(location = 0) out vec2 o_uv;
layout(location = 1) out vec3 o_normal;
layout(location = 2) out vec4 o_shadow_position;
layout(location = 3) out flat uint o_shadow;
layout(location = 4) out float o_fog;
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
layout(set = 1, binding = 2) uniform camera_t
{
    vec3 vector;
}
u_camera;
layout(set = 1, binding = 3) uniform shadow_t
{
    mat4 matrix;
}
u_shadow;

void main()
{
    const uint u = i_voxel >> VOXEL_U_OFFSET & VOXEL_U_MASK;
    const uint v = i_voxel >> VOXEL_V_OFFSET & VOXEL_V_MASK;
    o_shadow = i_voxel >> VOXEL_SHADOW_OFFSET & VOXEL_SHADOW_MASK;
    vec3 position = u_position.vector + get_position(i_voxel);
    o_uv.x = u / ATLAS_WIDTH * ATLAS_FACE_WIDTH;
    o_uv.y = v / ATLAS_HEIGHT * ATLAS_FACE_HEIGHT;
    gl_Position = u_mvp.matrix * vec4(position, 1.0);
    o_fog = get_fog(position.xz, u_camera.vector.xz);
    o_normal = get_normal(i_voxel);
    if (o_shadow != 0)
    {
        o_shadow_position = bias * u_shadow.matrix * vec4(position, 1.0);
    }
}