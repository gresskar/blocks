#version 450

#include "config.glsl"

// Position texture: stores world-space positions from the geometry pass
layout(set = 2, binding = 0) uniform sampler2D s_position;

// Voxel texture: stores normal information or other relevant scene data (if used)
layout(set = 2, binding = 1) uniform usampler2D s_voxel;

// Noise texture: contains random rotation vectors for sampling SSAO (not used in edge detection)
layout(set = 2, binding = 2) uniform sampler2D s_ssao_rotation;

// Output edge detection factor
layout(location = 0) out float o_edge;

// Viewport size and scale
layout(set = 3, binding = 0) uniform viewport_t {
    ivec2 size;
} u_viewport;

// Kernel samples (not used in edge detection)
layout(set = 3, binding = 1) uniform kernel_t {
    vec4 kernel[SSAO_KERNEL_SIZE];
} u_kernel;

layout(set = 3, binding = 2) uniform proj_t {
    mat4 matrix;
} u_proj;

layout(set = 3, binding = 3) uniform view_t {
    mat4 matrix;
} u_view;

const vec3 normals[6] = vec3[6](
    vec3( 0, 0, 1),
    vec3( 0, 0,-1),
    vec3( 1, 0, 0),
    vec3(-1, 0, 0),
    vec3( 0, 1, 0),
    vec3( 0,-1, 0)
);

// Base edge detection threshold values
const float BASE_POSITION_THRESHOLD = 0.01;
const float NORMAL_THRESHOLD = 0.1;

void main()
{
    vec2 coord = gl_FragCoord.xy / u_viewport.size;
    vec3 fragPos = texture(s_position, coord).rgb;
    uint voxel = texture(s_voxel, coord).x;
    uint direction = voxel >> VOXEL_DIRECTION_OFFSET & VOXEL_DIRECTION_MASK;
    vec3 normal = normals[direction];

    // Compute dynamic position threshold based on fragment distance from the camera
    float distanceToCamera = length(fragPos);
    float positionThreshold = BASE_POSITION_THRESHOLD * distanceToCamera * 0.1;

    // Sample neighboring positions and normals
    vec2 offset = 1.0 / vec2(u_viewport.size); // Pixel size in texture coordinates

    // Sample neighboring fragments
    vec3 fragPosLeft = texture(s_position, coord + vec2(-offset.x, 0.0)).rgb;
    vec3 fragPosRight = texture(s_position, coord + vec2(offset.x, 0.0)).rgb;
    vec3 fragPosUp = texture(s_position, coord + vec2(0.0, offset.y)).rgb;
    vec3 fragPosDown = texture(s_position, coord + vec2(0.0, -offset.y)).rgb;

    // Calculate normal differences in neighboring directions
    uint voxelLeft = texture(s_voxel, coord + vec2(-offset.x, 0.0)).x;
    uint voxelRight = texture(s_voxel, coord + vec2(offset.x, 0.0)).x;
    uint voxelUp = texture(s_voxel, coord + vec2(0.0, offset.y)).x;
    uint voxelDown = texture(s_voxel, coord + vec2(0.0, -offset.y)).x;

    vec3 normalLeft = normals[voxelLeft >> VOXEL_DIRECTION_OFFSET & VOXEL_DIRECTION_MASK];
    vec3 normalRight = normals[voxelRight >> VOXEL_DIRECTION_OFFSET & VOXEL_DIRECTION_MASK];
    vec3 normalUp = normals[voxelUp >> VOXEL_DIRECTION_OFFSET & VOXEL_DIRECTION_MASK];
    vec3 normalDown = normals[voxelDown >> VOXEL_DIRECTION_OFFSET & VOXEL_DIRECTION_MASK];

    // Calculate position differences with dynamic threshold
    float edgeFactor = 0.0;
    edgeFactor += (distance(fragPos, fragPosLeft) > positionThreshold) ? 1.0 : 0.0;
    edgeFactor += (distance(fragPos, fragPosRight) > positionThreshold) ? 1.0 : 0.0;
    edgeFactor += (distance(fragPos, fragPosUp) > positionThreshold) ? 1.0 : 0.0;
    edgeFactor += (distance(fragPos, fragPosDown) > positionThreshold) ? 1.0 : 0.0;

    // Calculate normal differences with fixed threshold
    edgeFactor += (distance(normal, normalLeft) > NORMAL_THRESHOLD) ? 1.0 : 0.0;
    edgeFactor += (distance(normal, normalRight) > NORMAL_THRESHOLD) ? 1.0 : 0.0;
    edgeFactor += (distance(normal, normalUp) > NORMAL_THRESHOLD) ? 1.0 : 0.0;
    edgeFactor += (distance(normal, normalDown) > NORMAL_THRESHOLD) ? 1.0 : 0.0;

    // Normalize edge factor to be in the range [0, 1]
    o_edge = clamp(edgeFactor / 8.0, 0.0, 1.0);
}
