#version 450

#include "config.glsl"
#include "helpers.glsl"

layout(location = 0) in vec2 i_uv;
layout(location = 0) out float o_edge;
layout(set = 2, binding = 0) uniform sampler2D s_position; // Assuming this stores the position
layout(set = 2, binding = 1) uniform sampler2D s_uv;
layout(set = 2, binding = 2) uniform usampler2D s_voxel;
layout(set = 2, binding = 3) uniform sampler2D u_atlas;


// Helper function to get the voxel data at a given UV coordinate
uint getVoxel(vec2 uv) {
    return texture(s_voxel, uv).x;
}

// Helper function to get the position at a given UV coordinate
vec3 getPosition(vec2 uv) {
    return texture(s_position, uv).xyz; // Assuming s_position stores position in vec3
}

// Helper function to check if current voxel is at an edge based on its position
bool isEdge(uint direction, vec3 current_pos, vec3 neighbor_pos) {
    // Compare the positions based on direction
    if (direction == 4) { // Up
        return current_pos.y < neighbor_pos.y;
    }
    else if (direction == 5) { // Down
        return current_pos.y > neighbor_pos.y;
    }
    else if (direction == 2) { // Right
        return current_pos.x > neighbor_pos.x;
    }
    else if (direction == 3) { // Left
        return current_pos.x < neighbor_pos.x;
    }
    else if (direction == 0) { // Front
        return current_pos.z < neighbor_pos.z;
    }
    else if (direction == 1) { // Back
        return current_pos.z > neighbor_pos.z;
    }
    return false;
}

void main() {
    vec2 uv = texture(s_uv, i_uv).xy;
    if (length(uv) == 0) {
        discard;
    }

    uint voxel = getVoxel(i_uv);
    uint direction = (voxel >> VOXEL_DIRECTION_OFFSET) & VOXEL_DIRECTION_MASK; // Using VOXEL_DIRECTION_MASK
    vec3 color = texture(u_atlas, uv).xyz;

    // Nested loop for the "+"-shaped kernel (i = -1 to 1)
    const vec2 size = 1.0 / textureSize(s_voxel, 0);

    for (int x = -1; x <= 1; ++x) {
        for (int y = -1; y <= 1; ++y) {
            // Skip the center (no need to compare the voxel with itself)
            if (x == 0 && y == 0) {
                continue;
            }

            // Sample the neighboring voxel
            uint neighbor_voxel = getVoxel(i_uv + vec2(x, y) * size);

            vec3 neighbor_pos = getPosition(i_uv + vec2(x, y) * size);
            vec2 neighbor_uv = texture(s_uv, i_uv + vec2(x, y) * size).xy;
            if (length(neighbor_uv) == 0.0) {
                continue;
            }
            vec3 neighbor_color = texture(u_atlas, neighbor_uv).xyz;
            if (distance(color, neighbor_color) > 0.01)
            {
                o_edge = 1.0;
                return;
            }

            uint neighbor_direction = (neighbor_voxel >> VOXEL_DIRECTION_OFFSET) & VOXEL_DIRECTION_MASK; // Extract neighbor direction

            // Check if the direction differs from the current voxel's direction
            if (direction != neighbor_direction) {
                o_edge = 1.0;
                return;
            }
            else
            {
                vec3 current_pos = getPosition(i_uv);
                if (isEdge(direction, current_pos, neighbor_pos)) {
                    o_edge = 1.0;  // Edge detected based on position comparison
                    return;
                }
            }
        }
    }
    o_edge = 0.0;
}
